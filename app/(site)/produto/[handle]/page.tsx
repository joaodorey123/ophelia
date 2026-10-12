import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPurchase, type GiftCard } from '@/components/product/ProductPurchase';
import { JsonLd } from '@/components/seo/JsonLd';
import { Display, Kicker } from '@/components/ui/Type';
import { catalogue } from '@/lib/commerce';
import { CommerceError, type Product } from '@/lib/commerce/types';
import { site } from '@/lib/content';
import { SHOP_INDEX, productPath } from '@/lib/navigation';
import { defaultVariant } from '@/lib/product';
import { clampDescription, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

import styles from './product.module.css';
import sections from '@/styles/sections.module.css';

export const revalidate = 900;

type Params = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  try {
    const products = await catalogue().getProducts({ first: 100 });
    return products.map((product) => ({ handle: product.handle }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params) {
  const { handle } = await params;
  const product = await catalogue()
    .getProduct(handle)
    .catch(() => null);

  if (!product) {
    return pageMetadata({
      title: 'Produto não encontrado',
      description: site.brand.description,
      path: productPath(handle),
      noIndex: true,
    });
  }

  return pageMetadata({
    title: product.seo.title ?? product.title,
    description: clampDescription(
      product.seo.description || product.description || site.brand.description,
    ),
    path: productPath(product.handle),
    image: product.featuredImage?.url ?? null,
  });
}

/**
 * The handwritten-card add-on.
 *
 * It is a real Shopify product, so the €4 line is a line Shopify can actually
 * charge for. When it is not published the add-on is simply absent — the
 * alternative is a checkbox that adds nothing to the order.
 */
async function getGiftCard(): Promise<GiftCard | null> {
  try {
    const product = await catalogue().getProduct(site.product.giftCardHandle);
    const variant = product ? defaultVariant(product) : null;
    if (!variant?.availableForSale) return null;
    return { variantId: variant.id, price: variant.price };
  } catch {
    return null;
  }
}

/**
 * "Fica ainda melhor com".
 *
 * Shopify's own RELATED recommendations first — that is the merchant's
 * merchandising, not an invention of ours. A young or small catalogue returns
 * nothing, so the row falls back to best sellers rather than disappearing.
 */
async function getSuggestions(product: Product): Promise<Product[]> {
  try {
    const related = await catalogue().getProductRecommendations(product, 3);
    if (related.length > 0) return related;

    const pool = await catalogue().getProducts({ first: 8, sortKey: 'BEST_SELLING' });
    return pool.filter((candidate) => candidate.handle !== product.handle).slice(0, 3);
  } catch (error) {
    // Suggestions are a nicety; they never take the product page down.
    console.error('[product] Could not load recommendations:', error);
    return [];
  }
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;

  let product: Product | null;
  try {
    product = await catalogue().getProduct(handle);
  } catch (error) {
    // Shopify being down is a 500 with a message, never a silent 404.
    if (error instanceof CommerceError && error.code === 'not_found') notFound();
    throw error;
  }

  if (!product) notFound();

  const [giftCard, suggestions] = await Promise.all([getGiftCard(), getSuggestions(product)]);
  const category = product.productType || product.editorial.kicker;

  return (
    <div className={`${sections.mid} ${styles.page}`}>
      <JsonLd
        data={[
          productSchema(product),
          breadcrumbSchema([
            { name: 'Produtos', path: SHOP_INDEX },
            { name: product.title, path: productPath(product.handle) },
          ]),
        ]}
      />

      <nav className={styles.breadcrumb} aria-label="Migalhas">
        <Link href={SHOP_INDEX}>produtos</Link>
        {category ? <span> / {category.toLowerCase()}</span> : null}
      </nav>

      <div className={styles.layout}>
        <ProductGallery images={product.images} title={product.title} />

        <div>
          {category ? <Kicker>{category}</Kicker> : null}
          <Display as="h1" size="product" className={styles.buyTitle}>
            {product.title}
          </Display>

          <ProductPurchase
            product={product}
            giftCard={giftCard}
            giftCardTitle={site.product.giftCardTitle}
            giftCardNote={site.product.giftCardNote}
            panels={[
              ...(product.editorial.ingredients
                ? [
                    {
                      id: 'ingredientes',
                      title: 'ingredientes',
                      body: product.editorial.ingredients,
                    },
                  ]
                : []),
              ...site.product.panels,
            ]}
          />
        </div>
      </div>

      {suggestions.length > 0 ? (
        <section className={styles.suggest} aria-labelledby="oph-suggest">
          <Display as="h2" size="sectionSm" id="oph-suggest">
            {site.product.suggestHeading}
          </Display>
          <div className={styles.suggestGrid}>
            {suggestions.map((suggestion) => (
              <ProductCard
                key={suggestion.id}
                product={suggestion}
                compact
                sizes="(max-width: 640px) 50vw, 230px"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
