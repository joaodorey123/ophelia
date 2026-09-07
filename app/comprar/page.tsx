import { CollectionFilters } from '@/components/product/CollectionFilters';
import { ProductCard } from '@/components/product/ProductCard';
import { ButtonLink } from '@/components/ui/Button';
import { Display, Kicker } from '@/components/ui/Type';
import { catalogue } from '@/lib/commerce';
import { getCollectionsSafe } from '@/lib/commerce/safe';
import { shop, site } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './collection.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'Produtos',
  description: shop.lede,
  path: '/comprar',
});

export const revalidate = 900;

const PAGE_SIZE = 24;

/**
 * The shop index — the handoff's "tudo" filter.
 *
 * Pagination is Shopify's cursor, carried in the URL, so the "ver mais" link
 * is a real navigable page rather than client state that vanishes on refresh.
 */
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;

  const [collections, page] = await Promise.all([
    getCollectionsSafe(),
    catalogue().getProductPage({
      first: PAGE_SIZE,
      sortKey: 'BEST_SELLING',
      ...(cursor ? { cursor } : {}),
    }),
  ]);

  const products = page.products;
  const nextCursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;

  return (
    <div className={`${sections.wide} ${styles.page}`}>
      <div className={styles.intro} data-editor-section="shop">
        <Kicker>{shop.kicker}</Kicker>
        <Display as="h1" size="page" className={styles.title}>
          {shop.title}
        </Display>
        <p className={sections.introLede}>{shop.lede}</p>
      </div>

      <CollectionFilters collections={collections} active={null} />

      <p className={styles.count}>
        {products.length === 1 ? '1 produto' : `${products.length} produtos`}
      </p>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>ainda não há produtos aqui</p>
          <p className={styles.emptyBody}>
            Estamos a preparar a loja. Escreve-nos para {site.footer.help.at(-1)} e dizemos-te
            assim que estiver tudo disponível.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} showTag priority={index < 4} />
          ))}
        </div>
      )}

      {nextCursor ? (
        <div className={styles.more}>
          <ButtonLink href={`/comprar?cursor=${encodeURIComponent(nextCursor)}`}>
            ver mais
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
