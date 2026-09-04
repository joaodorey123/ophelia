import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PantryCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPurchase } from '@/components/product/ProductPurchase';
import { JsonLd } from '@/components/seo/JsonLd';
import { catalogue } from '@/lib/commerce';
import { getCrossSellProducts } from '@/lib/commerce/cross-sell';
import type { Product } from '@/lib/commerce/types';
import { SHIPPING_NOTE } from '@/lib/content/shipping';
import { collectionPath, productPath } from '@/lib/navigation';
import { cheapestVariant } from '@/lib/product';
import { clampDescription, pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

import styles from './product.module.css';
import sections from '@/styles/sections.module.css';

export const revalidate = 900;

type PageProps = { params: Promise<{ handle: string }> };

/** The collection a product belongs under, for breadcrumbs and internal links. */
function parentCollection(product: Product): { name: string; handle: string } {
  if (product.tags.includes('cookies') || product.productType === 'Cookies') {
    return { name: 'Cookies', handle: 'cookies' };
  }
  if (product.productType === 'Lifestyle') return { name: 'Lifestyle', handle: 'lifestyle' };
  if (product.productType === 'Presentes') return { name: 'Presentes', handle: 'presentes' };
  return { name: 'Mercearia', handle: 'mercearia' };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await catalogue().getProduct(handle);

  if (!product) {
    return pageMetadata({
      title: 'Produto não encontrado',
      description: '',
      path: productPath(handle),
      noIndex: true,
    });
  }

  return pageMetadata({
    title: product.seo.title ?? product.title,
    description: clampDescription(
      product.seo.description ?? product.editorial.shortDescription ?? product.description,
    ),
    path: productPath(product.handle),
    image: product.featuredImage?.url ?? null,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;

  const [product, crossSell, giftCardProduct] = await Promise.all([
    catalogue().getProduct(handle),
    getCrossSellProducts(),
    catalogue().getProduct('cartao-personalizado'),
  ]);

  if (!product) notFound();

  const parent = parentCollection(product);
  const crumbs = [
    { name: 'Ophelia', path: '/' },
    { name: parent.name, path: collectionPath(parent.handle) },
    { name: product.title, path: productPath(product.handle) },
  ];

  const giftCardVariant = giftCardProduct ? cheapestVariant(giftCardProduct) : null;
  const giftCard =
    giftCardProduct && giftCardVariant && giftCardProduct.handle !== product.handle
      ? { variantId: giftCardVariant.id, price: giftCardVariant.price }
      : null;

  // Never cross-sell the product the visitor is already looking at.
  const suggestions = crossSell.filter((item) => item.handle !== product.handle).slice(0, 4);

  const galleryBriefs = [
    product.editorial.shortDescription ?? `${product.title} em grande plano, textura e migalhas`,
    'Interior cremoso',
    'Caixa azul Ophelia',
    'Mesa com café',
  ];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), productSchema(product)]} />

      <div className={styles.crumbs}>
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <section className={styles.layout} aria-label={product.title}>
        <ProductGallery images={product.images} productTitle={product.title} briefs={galleryBriefs} />
        <ProductPurchase product={product} giftCard={giftCard} shippingNote={SHIPPING_NOTE} />
      </section>

      {suggestions.length > 0 ? (
        <section className={sections.sectionTight} aria-labelledby="cross-sell-title">
          <h2 id="cross-sell-title" className={styles.crossSellTitle}>
            Fica ainda melhor com…
          </h2>
          <p className={styles.crossSellLead}>Escolhido por nós, não por um algoritmo.</p>
          <div className={sections.gridCrossSell}>
            {suggestions.map((item) => (
              <PantryCard
                key={item.id}
                product={item}
                bordered
                imageHeight={180}
                addLabel="Juntar"
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
