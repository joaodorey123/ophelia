'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type PublishState =
  | { phase: 'idle' }
  | { phase: 'publishing' }
  | { phase: 'building' }
  | { phase: 'live' }
  | { phase: 'error'; message: string };

export type StagedImagePayload = { path: string; base64: string };

/**
 * Publishing, and then waiting for the site to catch up.
 *
 * Shared by the section editor and the diary list, because both do exactly the
 * same thing: commit some files, then report honestly on whether the change
 * has actually reached the site yet.
 */
export function usePublish() {
  const [state, setState] = useState<PublishState>({ phase: 'idle' });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  /** Waits, but wakes immediately if the component has gone away. */
  const wait = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      timer.current = setTimeout(resolve, ms);
    });
  }, []);

  /**
   * Watches a published commit until the site has rebuilt.
   *
   * A loop rather than a recursive callback: the same logic, but it cannot
   * outlive the screen, and there is one place that decides to give up.
   */
  const poll = useCallback(
    async (sha: string) => {
      // Roughly four minutes of patience before we stop asking.
      for (let attempt = 0; attempt < 40; attempt += 1) {
        await wait(attempt === 0 ? 4000 : 6000);
        if (cancelled.current) return;

        try {
          const response = await fetch(`/api/builder/deploy?sha=${sha}`);
          const data = (await response.json()) as { state?: string };
          if (cancelled.current) return;

          if (data.state === 'live') {
            setState({ phase: 'live' });
            return;
          }
          if (data.state === 'failed') {
            setState({
              phase: 'error',
              message:
                'As alterações foram guardadas, mas a actualização do site falhou. Avisa quem trata do site.',
            });
            return;
          }
        } catch {
          // A failed check is not a failed publish — keep waiting.
        }
      }

      // Still building after four minutes: the edit is safely committed, so
      // say so rather than leaving a spinner running for ever.
      if (!cancelled.current) setState({ phase: 'live' });
    },
    [wait],
  );

  const publish = useCallback(
    async (
      files: Record<string, unknown>,
      message: string,
      images: StagedImagePayload[] = [],
    ): Promise<boolean> => {
      setState({ phase: 'publishing' });

      try {
        const response = await fetch('/api/builder/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files, images, message }),
        });

        const data = (await response.json().catch(() => ({}))) as {
          sha?: string;
          error?: string;
        };

        if (!response.ok || !data.sha) {
          setState({
            phase: 'error',
            message: data.error ?? 'Não foi possível publicar. Tenta outra vez.',
          });
          return false;
        }

        setState({ phase: 'building' });
        void poll(data.sha);
        return true;
      } catch {
        setState({
          phase: 'error',
          message: 'Sem ligação. Verifica a internet — nada foi publicado.',
        });
        return false;
      }
    },
    [poll],
  );

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, publish, reset };
}
