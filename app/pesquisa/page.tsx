import { ProductCard } from '@/components/product/ProductCard';
import { TextLink } from '@/components/ui/Button';
import { Display, Kicker } from '@/components/ui/Type';
import { catalogue } from '@/lib/commerce';
import type { Product } from '@/lib/commerce/types';
import { SHOP_INDEX } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './search.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'Pesquisar',
  description: 'Procura cookies, mercearia, café e presentes na loja da Ophelia.',
  path: '/pesquisa',
  // Query pages are not content: keep them out of the index.
  noIndex: true,
});

/**
 * Server-rendered search.
 *
 * The header sheet is the fast path; this is the same Shopify search rendered
 * on the server, so results are shareable, work without JavaScript, and give
 * the sheet somewhere real to submit to.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? '').trim();

  let products: Product[] = [];
  let failed = false;

  if (term) {
    try {
      products = await catalogue().searchProducts(term, { first: 48 });
    } catch (error) {
      console.error('[search] Shopify search failed:', error);
      failed = true;
    }
  }

  return (
    <div className={`${sections.wide} ${styles.page}`}>
      <div className={styles.intro}>
        <Kicker>a loja</Kicker>
        <Display as="h1" size="pageSm" className={styles.title}>
          pesquisar
        </Display>
      </div>

      <form className={styles.form} role="search" action="/pesquisa">
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

      {failed ? (
        <div className={styles.error}>
          <p className={styles.emptyTitle}>a pesquisa não está disponível</p>
          <p className={styles.emptyBody}>
            Não conseguimos falar com a loja neste momento. Tenta outra vez dentro de instantes.
          </p>
        </div>
      ) : !term ? (
        <p className={styles.count}>Escreve o que procuras.</p>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>sem resultados para “{term}”</p>
          <p className={styles.emptyBody}>
            Experimenta outra palavra — ou vê a loja completa, é pequena e vale a pena.
          </p>
          <p style={{ marginTop: 22 }}>
            <TextLink href={SHOP_INDEX} small>
              ver todos os produtos
            </TextLink>
          </p>
        </div>
      ) : (
        <>
          <p className={styles.count}>
            {products.length === 1 ? '1 resultado' : `${products.length} resultados`} para “{term}”
          </p>
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showTag />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
