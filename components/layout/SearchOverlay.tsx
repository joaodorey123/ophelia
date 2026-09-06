'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { TextLink } from '@/components/ui/Button';
import { productPath } from '@/lib/navigation';
import type { SearchResult } from '@/lib/search';

import styles from './SearchOverlay.module.css';

type State =
  | { status: 'idle' | 'loading'; results: SearchResult[] }
  | { status: 'ready'; results: SearchResult[] }
  | { status: 'error'; results: [] };

/**
 * The search sheet.
 *
 * Results come from Shopify through /api/pesquisa on a 250ms debounce; with an
 * empty field the handoff shows the first six products, so that is what the
 * route returns for a blank query. Submitting goes to /pesquisa, which renders
 * the same search server-side — so search works without JavaScript too.
 */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [state, setState] = useState<State>({ status: 'loading', results: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  /*
   * The effect only fetches; "loading" is set by the keystroke that caused it,
   * so there is no setState inside the effect body and no cascading render.
   */
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/pesquisa?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { results: SearchResult[] };
        setState({ status: 'ready', results: data.results });
      } catch {
        // An aborted request is the previous keystroke being superseded, not
        // a failure; the AbortController's own signal tells them apart.
        if (controller.signal.aborted) return;
        setState({ status: 'error', results: [] });
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term]);

  const trimmed = term.trim();

  return (
    <>
      <div className={styles.veil} onClick={onClose} aria-hidden />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Pesquisar">
        <div className={styles.inner}>
          <form
            className={styles.row}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (!trimmed) return;
              router.push(`/pesquisa?q=${encodeURIComponent(trimmed)}`);
              onClose();
            }}
          >
            <label className="oph-sr-only" htmlFor="oph-search">
              Procurar produtos
            </label>
            <input
              ref={inputRef}
              id="oph-search"
              name="q"
              type="search"
              className={styles.input}
              placeholder="procurar cookies, mel, café…"
              value={term}
              autoComplete="off"
              onChange={(event) => {
                setTerm(event.target.value);
                setState((current) => ({ status: 'loading', results: current.results }));
              }}
            />
            <button type="button" className={styles.close} onClick={onClose}>
              fechar
            </button>
          </form>

          <p className={styles.status} role="status" aria-live="polite">
            {state.status === 'error'
              ? 'Não foi possível pesquisar agora. Tenta outra vez dentro de momentos.'
              : state.status === 'loading'
                ? 'A procurar…'
                : state.results.length === 0
                  ? trimmed
                    ? `Sem resultados para “${trimmed}”.`
                    : 'Ainda não há produtos para mostrar.'
                  : `${state.results.length} ${state.results.length === 1 ? 'resultado' : 'resultados'}`}
          </p>

          {state.results.length > 0 ? (
            <div className={styles.results}>
              {state.results.map((result) => (
                <Link
                  key={result.handle}
                  href={productPath(result.handle)}
                  className={styles.chip}
                  onClick={onClose}
                >
                  {result.image ? (
                    <Image
                      className={styles.thumb}
                      src={result.image.url}
                      alt=""
                      width={38}
                      height={38}
                    />
                  ) : (
                    <span className={styles.thumb} aria-hidden />
                  )}
                  <span>{result.title}</span>
                  <span className={styles.chipPrice}>{result.price}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {trimmed ? (
            <div className={styles.all}>
              <TextLink href={`/pesquisa?q=${encodeURIComponent(trimmed)}`} small>
                ver todos os resultados
              </TextLink>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
