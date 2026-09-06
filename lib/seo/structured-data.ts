import type { Collection, Product } from '@/lib/commerce/types';
import { absoluteUrl, getSiteUrl, SITE } from '@/lib/site';
import { productPath } from '@/lib/navigation';

/**
 * Schema.org JSON-LD.
 *
 * Everything here is derived from data that is visibly on the page. There are
 * deliberately no `aggregateRating` or `review` nodes: Ophelia has not supplied
 * reviews, and fabricating them would be both dishonest and a policy breach.
 */

export type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${getSiteUrl()}#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: getSiteUrl(),
    logo: absoluteUrl('/brand/logo-azul.png'),
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressCountry: SITE.address.country,
    },
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${getSiteUrl()}#website`,
    name: SITE.name,
    url: getSiteUrl(),
    inLanguage: SITE.locale,
    publisher: { '@id': `${getSiteUrl()}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${getSiteUrl()}/pesquisa?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function productSchema(product: Product): JsonLd {
  const url = absoluteUrl(productPath(product.handle));
  const availability = product.availableForSale
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const offers = product.variants.map((variant) => ({
    '@type': 'Offer',
    url,
    priceCurrency: variant.price.currencyCode,
    price: variant.price.amount,
    availability: variant.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': `${getSiteUrl()}#organization` },
    ...(variant.sku ? { sku: variant.sku } : {}),
    ...(variant.selectedOptions.length > 0
      ? { name: variant.selectedOptions.map((option) => option.value).join(' · ') }
      : {}),
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url,
    brand: { '@type': 'Brand', name: SITE.name },
    ...(product.featuredImage ? { image: [product.featuredImage.url] } : {}),
    ...(product.variants[0]?.sku ? { sku: product.variants[0].sku } : {}),
    offers:
      offers.length === 1
        ? offers[0]
        : {
            '@type': 'AggregateOffer',
            priceCurrency: product.priceRange.minVariantPrice.currencyCode,
            lowPrice: product.priceRange.minVariantPrice.amount,
            highPrice: product.priceRange.maxVariantPrice.amount,
            offerCount: offers.length,
            availability,
            offers,
          },
  };
}

export function collectionSchema(collection: Collection, products: Product[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.title,
    description: collection.description,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(productPath(product.handle)),
      name: product.title,
    })),
  };
}

/**
 * Diary articles.
 *
 * `date` is the client's own human string ("28 agosto"), not a machine date,
 * so `datePublished` is omitted rather than guessed — a wrong date in
 * structured data is worse than no date.
 */
export function articleSchema(post: {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.image),
    mainEntityOfPage: absoluteUrl(`/diario/${post.slug}`),
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name },
  };
}
