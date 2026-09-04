import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { PantryCard } from '@/components/product/ProductCard';
import { catalogue } from '@/lib/commerce';
import { pageMetadata } from '@/lib/seo/metadata';

import { SearchField } from './SearchField';
import styles from './search.module.css';
import sections from '@/styles/sections.module.css';

/**
 * Search results are a view of the catalogue, not indexable content of their
 * own: every query would otherwise become a thin duplicate page.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Procurar',
  description: 'Procura cookies, mercearia e presentes da Ophelia.',
  path: '/pesquisa',
  noIndex: true,
});

const SUGGESTIONS = [
  { label: 'Cookies', href: '/comprar/cookies' },
  { label: 'Mercearia', href: '/comprar/mercearia' },
  { label: 'Presentes', href: '/comprar/presentes' },
  { label: 'Granola', href: '/produto/granola-da-ophelia' },
  { label: 'Café', href: '/produto/cafe-da-ophelia' },
];

async function Results({ term }: { term: string }) {
  if (!term) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>O que procuras?</h2>
        <p className={styles.emptyCopy}>
          Escreve o nome de um produto, ou começa por aqui.
        </p>
        <ul className={styles.suggestions}>
          {SUGGESTIONS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.suggestion}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  let products;
  try {
    products = await catalogue().searchProducts(term, { first: 24 });
  } catch {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>A pesquisa está indisponível.</h2>
        <p className={styles.emptyCopy}>
          Não conseguimos falar com a loja neste momento. Tenta outra vez daqui a pouco, ou navega
          pelas <Link href="/comprar/cookies">cookies</Link> e pela{' '}
          <Link href="/comprar/mercearia">mercearia</Link>.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>Não encontrámos nada para “{term}”.</h2>
        <p className={styles.emptyCopy}>
          Experimenta outra palavra, ou vê o que temos nestas secções.
        </p>
        <ul className={styles.suggestions}>
          {SUGGESTIONS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.suggestion}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
      <p className={styles.count} role="status">
        {products.length} {products.length === 1 ? 'resultado' : 'resultados'} para “{term}”
      </p>
      <div className={sections.gridCollection}>
        {products.map((product) => (
          <PantryCard key={product.id} product={product} headingLevel={2} />
        ))}
      </div>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className={styles.skeletonGrid} aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className={styles.skeleton} />
      ))}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? '').trim();

  return (
    <section className={styles.page} aria-labelledby="search-title">
      <h1 id="search-title" className={styles.title}>
        Procurar
      </h1>

      <Suspense fallback={null}>
        <SearchField />
      </Suspense>

      <Suspense key={term} fallback={<ResultsSkeleton />}>
        <Results term={term} />
      </Suspense>
    </section>
  );
}
