'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';

import styles from './search.module.css';

/**
 * Search input. Submitting navigates to /pesquisa?q=…, so results are a real
 * URL a visitor can share, reload or land on from a search engine — not a
 * client-only state that disappears on refresh.
 */
export function SearchField() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputId = useId();
  /*
   * The field mirrors ?q= so a back/forward navigation or a suggestion link
   * updates it, while still letting the visitor type freely in between.
   * Derived during render rather than synchronised in an effect.
   */
  const queryTerm = searchParams.get('q') ?? '';
  const [term, setTerm] = useState(queryTerm);
  const [lastQueryTerm, setLastQueryTerm] = useState(queryTerm);
  if (lastQueryTerm !== queryTerm) {
    setLastQueryTerm(queryTerm);
    setTerm(queryTerm);
  }

  return (
    <form
      className={styles.form}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = term.trim();
        router.push(trimmed ? `/pesquisa?q=${encodeURIComponent(trimmed)}` : '/pesquisa');
      }}
    >
      <label htmlFor={inputId} className="oph-visually-hidden">
        Procurar produtos
      </label>
      <input
        id={inputId}
        name="q"
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Cookies, mel, granola…"
        className={styles.input}
        autoComplete="off"
      />
      <Button type="submit" variant="primary" size="lg">
        Procurar
      </Button>
    </form>
  );
}
