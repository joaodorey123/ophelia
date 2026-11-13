'use client';

import { useRouteNavigate } from '@/components/loading/RouteLoading';

import styles from './search.module.css';

/**
 * The search page's form. Without JavaScript it is a plain GET to /pesquisa;
 * with it, the search is a client navigation, so the results skeleton can
 * stand in while Shopify answers instead of the browser's blank wait.
 */
export function SearchForm({ term }: { term: string }) {
  const navigate = useRouteNavigate();

  return (
    <form
      className={styles.form}
      role="search"
      action="/pesquisa"
      onSubmit={(event) => {
        const q = String(new FormData(event.currentTarget).get('q') ?? '').trim();
        if (!q) return;
        event.preventDefault();
        navigate(`/pesquisa?q=${encodeURIComponent(q)}`);
      }}
    >
      <label className="oph-sr-only" htmlFor="oph-search-page">
        Procurar produtos
      </label>
      <input
        id="oph-search-page"
        className={styles.input}
        type="search"
        name="q"
        defaultValue={term}
        placeholder="procurar cookies, mel, café…"
        autoComplete="off"
      />
      <button type="submit" className={styles.submit}>
        procurar
      </button>
    </form>
  );
}
