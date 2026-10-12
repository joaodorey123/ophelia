'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { isEqual } from '@/lib/builder/paths';
import type { Field } from '@/lib/builder/schema';

import styles from './editor.module.css';
import { FieldControl, StagingProvider, type StagedImage } from './Fields';
import { PublishBar } from './PublishBar';
import { usePublish } from './usePublish';

/**
 * The editing surface: a form over one content document, and the publish flow
 * that gets it onto the site.
 *
 * Publishing is deliberately a single, explicit action. Nothing autosaves — on
 * a site customers are looking at, a half-finished sentence going live because
 * someone stopped typing would be worse than an extra button.
 */
export function Editor({
  title,
  description,
  fields,
  initial,
  file,
  storefrontUrl,
  previewPath,
  commitMessage,
  children,
}: {
  title: string;
  description?: string;
  fields: Field[];
  initial: unknown;
  /**
   * Which content file this document is written back to. A plain string
   * rather than a function: a Server Component page cannot pass a function
   * prop into this Client Component, since functions cannot cross that
   * boundary — Next.js rejects the render outright when they do.
   */
  file: string;
  storefrontUrl: string | null;
  previewPath?: string;
  commitMessage: string;
  children?: React.ReactNode;
}) {
  const [document, setDocument] = useState<unknown>(initial);
  const [staged, setStaged] = useState<Record<string, StagedImage>>({});
  const { state, publish, reset } = usePublish();

  const dirty = useMemo(
    () => !isEqual(document, initial) || Object.keys(staged).length > 0,
    [document, initial, staged],
  );

  // Losing an unpublished edit to a stray tab close is the one irreversible
  // thing this tool can do, so the browser is asked to confirm.
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const stage = useCallback((src: string, image: StagedImage) => {
    setStaged((current) => ({ ...current, [src]: image }));
  }, []);

  const stagingValue = useMemo(
    () => ({ staged, stage, storefrontUrl }),
    [staged, stage, storefrontUrl],
  );

  async function onPublish() {
    const images = Object.values(staged).map((image) => ({
      path: image.path,
      base64: image.base64,
    }));

    const ok = await publish({ [file]: document }, commitMessage, images);
    // The photographs are committed now; keeping them staged would offer to
    // upload them a second time.
    if (ok) setStaged({});
  }

  function discard() {
    if (!window.confirm('Descartar as alterações que ainda não publicaste?')) return;
    setDocument(initial);
    setStaged({});
    reset();
  }

  return (
    <StagingProvider value={stagingValue}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {description ? <p className={styles.pageIntro}>{description}</p> : null}
      {storefrontUrl !== null && previewPath ? (
        <a
          className={styles.viewLink}
          href={`${storefrontUrl}${previewPath}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver esta página no site ↗
        </a>
      ) : null}

      {children}

      <div className={styles.fields}>
        {fields.map((field) => (
          <FieldControl
            key={`${field.kind}-${field.path}-${field.label}`}
            field={field}
            document={document}
            onChange={setDocument}
          />
        ))}
      </div>

      <PublishBar
        state={state}
        dirty={dirty}
        onPublish={onPublish}
        onDiscard={discard}
        viewUrl={storefrontUrl !== null && previewPath ? `${storefrontUrl}${previewPath}` : null}
      />
    </StagingProvider>
  );
}
