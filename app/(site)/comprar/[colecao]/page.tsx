import { notFound } from 'next/navigation';

import { CollectionFilters } from '@/components/product/CollectionFilters';
import { ProductCard } from '@/components/product/ProductCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { ButtonLink, TextLink } from '@/components/ui/Button';
import { Display, Kicker } from '@/components/ui/Type';
import { catalogue } from '@/lib/commerce';
import { getCollectionsSafe } from '@/lib/commerce/safe';
import { CommerceError } from '@/lib/commerce/types';
import { shop } from '@/lib/content';
import { SHOP_INDEX, collectionPath } from '@/lib/navigation';
import { clampDescription, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/structured-data';

import styles from '../collection.module.css';
import sections from '@/styles/sections.module.css';

export const revalidate = 900;

const PAGE_SIZE = 24;

type Params = { params: Promise<{ colecao: string }> };

/*
 * Deliberately no generateStaticParams.
 *
 * This page reads a pagination cursor from the query string, so it cannot be
 * prerendered — asking Next to try produces a DYNAMIC_SERVER_USAGE error and a
 * 500 where a missing collection should be a clean 404. It renders on demand;
 * the Shopify reads underneath are still cached for `revalidate` seconds and
 * purged by webhook, so this costs a cache lookup, not a round trip.
 */

export async function generateMetadata({ params }: Params) {
  const { colecao } = await params;
  const collection = await catalogue()
    .getCollection(colecao)
    .catch(() => null);

  if (!collection) {
    return pageMetadata({
      title: 'Coleção não encontrada',
      description: shop.lede,
      path: collectionPath(colecao),
      noIndex: true,
    });
  }

  /*
   * The merchant's own description when there is one. Otherwise the collection
   * name leads the shop's standing line, so every collection has a description
   * of its own rather than N pages sharing one string.
   */
  const description =
    collection.seo.description ||
    collection.description ||
    `${collection.title} da Ophelia. ${shop.lede}`;

  return pageMetadata({
    title: collection.seo.title ?? collection.title,
    description: clampDescription(description),
    path: collectionPath(collection.handle),
    image: collection.image?.url ?? null,
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ cursor?: string }> }) {
  const [{ colecao }, { cursor }] = await Promise.all([params, searchParams]);

  let result;
  try {
    result = await catalogue().getCollectionProducts(colecao, {
      first: PAGE_SIZE,
      ...(cursor ? { cursor } : {}),
    });
  } catch (error) {
    /*
     * A Shopify outage is not a missing page. Re-throwing sends this to the
     * route's error boundary with a real message, rather than rendering a 404
     * that would tell the client their collection had been deleted.
     */
    if (error instanceof CommerceError && error.code === 'not_found') notFound();
    throw error;
  }

  if (!result) notFound();

  const { collection, products, pageInfo } = result;
  const collections = await getCollectionsSafe();

  return (
    <div className={`${sections.wide} ${styles.page}`}>
      <JsonLd
        data={[
          collectionSchema(collection, products),
          breadcrumbSchema([
            { name: 'Produtos', path: SHOP_INDEX },
            { name: collection.title, path: collectionPath(collection.handle) },
          ]),
        ]}
      />

      <div className={styles.intro}>
        <Kicker>{shop.kicker}</Kicker>
        <Display as="h1" size="page" className={styles.title}>
          {collection.title.toLowerCase()}
        </Display>
        <p className={sections.introLede}>{collection.description || shop.lede}</p>
      </div>

      <CollectionFilters collections={collections} active={collection.handle} />

      <p className={styles.count}>
        {products.length === 1 ? '1 produto' : `${products.length} produtos`}
      </p>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>ainda não há nada nesta categoria</p>
          <p className={styles.emptyBody}>
            Esta coleção está publicada mas ainda sem produtos. Vê o resto da loja enquanto a
            preparamos.
          </p>
          <p style={{ marginTop: 22 }}>
            <TextLink href={SHOP_INDEX} small>
              ver todos os produtos
            </TextLink>
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} showTag priority={index < 4} />
          ))}
        </div>
      )}

      {pageInfo.hasNextPage && pageInfo.endCursor ? (
        <div className={styles.more}>
          <ButtonLink
            href={`${collectionPath(collection.handle)}?cursor=${encodeURIComponent(pageInfo.endCursor)}`}
          >
            ver mais
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
