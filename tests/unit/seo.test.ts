import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Collection, Product } from '@/lib/commerce/types';
import { clampDescription, pageMetadata } from '@/lib/seo/metadata';
import {
  breadcrumbSchema,
  collectionSchema,
  organizationSchema,
  productSchema,
  websiteSchema,
} from '@/lib/seo/structured-data';

const ORIGIN = 'https://www.callmeophelia.com';

/** The origin is read per call, so setting it here is enough. */
beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = ORIGIN;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

/** Narrow views of the JSON-LD shapes the assertions reach into. */
type Offer = { '@type': string; price?: string; availability?: string };
type ProductLd = {
  offers: Offer & { lowPrice?: string; highPrice?: string; offers?: Offer[] };
};
type ListLd = {
  '@type': string;
  numberOfItems?: number;
  itemListElement: { position?: number; url?: string; item?: string }[];
};

const product: Product = {
  id: 'gid://shopify/Product/1',
  handle: 'ophelia-cookies',
  title: 'Ophelia Cookies',
  description: 'A cookie que nos deu nome.',
  descriptionHtml: '<p>A cookie que nos deu nome.</p>',
  productType: 'Cookies',
  vendor: 'Ophelia',
  tags: ['cookies'],
  availableForSale: true,
  featuredImage: null,
  images: [],
  options: [{ id: 'o', name: 'Tamanho', values: ['4 unidades', '12 unidades'] }],
  variants: [
    {
      id: 'v1',
      title: '4 unidades',
      availableForSale: true,
      quantityAvailable: null,
      sku: 'OPH-CK-1',
      price: { amount: '17.00', currencyCode: 'EUR' },
      compareAtPrice: null,
      selectedOptions: [{ name: 'Tamanho', value: '4 unidades' }],
      image: null,
    },
    {
      id: 'v2',
      title: '12 unidades',
      availableForSale: false,
      quantityAvailable: 0,
      sku: 'OPH-CK-3',
      price: { amount: '48.00', currencyCode: 'EUR' },
      compareAtPrice: null,
      selectedOptions: [{ name: 'Tamanho', value: '12 unidades' }],
      image: null,
    },
  ],
  priceRange: {
    minVariantPrice: { amount: '17.00', currencyCode: 'EUR' },
    maxVariantPrice: { amount: '48.00', currencyCode: 'EUR' },
  },
  seo: { title: null, description: null },
  editorial: { kicker: null, badge: null, shortDescription: null, ingredients: null },
  updatedAt: '2026-01-01T00:00:00Z',
};

const collection: Collection = {
  id: 'c1',
  handle: 'cookies',
  title: 'As famosas Cookies da Ophelia',
  description: 'Feitas todos os dias.',
  descriptionHtml: '<p>Feitas todos os dias.</p>',
  image: null,
  seo: { title: null, description: null },
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('pageMetadata', () => {
  it('sets an absolute canonical', () => {
    const meta = pageMetadata({ title: 'T', description: 'D', path: '/comprar/cookies' });
    expect(meta.alternates?.canonical).toBe(`${ORIGIN}/comprar/cookies`);
  });

  it('indexes public pages and blocks transactional ones', () => {
    expect(pageMetadata({ title: 'T', description: 'D', path: '/' }).robots).toEqual({
      index: true,
      follow: true,
    });
    expect(
      pageMetadata({ title: 'T', description: 'D', path: '/carrinho', noIndex: true }).robots,
    ).toEqual({ index: false, follow: false, nocache: true });
  });

  it('falls back to the brand card when a page has no image', () => {
    const meta = pageMetadata({ title: 'T', description: 'D', path: '/' });
    expect(meta.openGraph?.images).toEqual([
      { url: `${ORIGIN}/brand/og-default.png`, width: 1200, height: 630, alt: 'Ophelia' },
    ]);
  });

  it('prefers a product image when one exists', () => {
    const meta = pageMetadata({
      title: 'T',
      description: 'D',
      path: '/produto/x',
      image: 'https://cdn.shopify.com/x.jpg',
    });
    expect(meta.openGraph?.images).toEqual([
      { url: 'https://cdn.shopify.com/x.jpg', width: 1200, height: 630, alt: 'Ophelia' },
    ]);
  });
});

describe('clampDescription', () => {
  it('leaves a short description alone', () => {
    expect(clampDescription('Curto.')).toBe('Curto.');
  });

  it('collapses whitespace', () => {
    expect(clampDescription('a\n\n  b')).toBe('a b');
  });

  it('truncates on a word boundary and stays within the limit', () => {
    const long = 'palavra '.repeat(40);
    const out = clampDescription(long);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});

describe('structured data', () => {
  it('describes the organisation with the client\'s real identity', () => {
    const org = organizationSchema();
    expect(org['@type']).toBe('Organization');
    expect(org.legalName).toBe('Receita Consistente, Lda.');
    expect(org.email).toBe('info@callmeophelia.com');
  });

  it('never fabricates ratings or reviews', () => {
    const json = JSON.stringify([
      organizationSchema(),
      websiteSchema(),
      productSchema(product),
      collectionSchema(collection, [product]),
    ]);
    expect(json).not.toMatch(/aggregateRating|reviewCount|ratingValue|"review"/);
  });

  it('emits an AggregateOffer whose prices match the displayed variants', () => {
    const p = productSchema(product) as unknown as ProductLd;
    expect(p.offers['@type']).toBe('AggregateOffer');
    expect(p.offers.lowPrice).toBe('17.00');
    expect(p.offers.highPrice).toBe('48.00');
    expect(p.offers.offers).toHaveLength(2);
    expect(p.offers.offers?.[0]?.price).toBe('17.00');
    expect(p.offers.offers?.[0]?.availability).toBe('https://schema.org/InStock');
    // The sold-out variant must say so rather than claim availability.
    expect(p.offers.offers?.[1]?.availability).toBe('https://schema.org/OutOfStock');
  });

  it('emits a single Offer for a single-variant product', () => {
    const single = { ...product, variants: [product.variants[0]!] };
    const p = productSchema(single) as unknown as ProductLd;
    expect(p.offers['@type']).toBe('Offer');
    expect(p.offers.price).toBe('17.00');
  });

  it('numbers breadcrumb positions from 1 with absolute URLs', () => {
    const crumbs = breadcrumbSchema([
      { name: 'Ophelia', path: '/' },
      { name: 'Cookies', path: '/comprar/cookies' },
    ]) as unknown as ListLd;
    expect(crumbs.itemListElement[0]?.position).toBe(1);
    expect(crumbs.itemListElement[1]?.item).toBe(`${ORIGIN}/comprar/cookies`);
  });

  it('lists collection products in order', () => {
    const list = collectionSchema(collection, [product]) as unknown as ListLd;
    expect(list['@type']).toBe('ItemList');
    expect(list.numberOfItems).toBe(1);
    expect(list.itemListElement[0]?.url).toBe(`${ORIGIN}/produto/ophelia-cookies`);
  });
});
