import 'server-only';

import type {
  Cart,
  CartLineInput,
  CartSource,
  CatalogueSource,
  Collection,
  CollectionWithProducts,
  Product,
  ProductPage,
  ProductQueryOptions,
} from '@/lib/commerce/types';
import { CommerceError } from '@/lib/commerce/types';

import {
  FIXTURE_COLLECTIONS,
  FIXTURE_COLLECTION_PRODUCTS,
  FIXTURE_PRODUCTS,
  FIXTURE_SUGGESTIONS,
} from './fixture-data';

/**
 * The development and test catalogue.
 *
 * It exists so the Playwright suite can exercise every route without Shopify
 * credentials, and so the design can be reviewed against the full 27-product
 * handoff catalogue. It is never a production fallback: reaching it requires
 * OPHELIA_FORCE_LOCAL_CATALOGUE=true, and cart operations here refuse to
 * pretend they can take money.
 */

function paginate<T>(items: T[], options: ProductQueryOptions | undefined) {
  const first = options?.first ?? 24;
  const start = options?.cursor ? Number(options.cursor) : 0;
  const page = items.slice(start, start + first);
  const end = start + page.length;
  return {
    page,
    pageInfo: {
      hasNextPage: end < items.length,
      endCursor: end < items.length ? String(end) : null,
    },
  };
}

function sortProducts(products: Product[], options?: ProductQueryOptions): Product[] {
  const sorted = [...products];
  switch (options?.sortKey) {
    case 'PRICE':
      sorted.sort(
        (a, b) =>
          Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount),
      );
      break;
    case 'TITLE':
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt-PT'));
      break;
    case 'CREATED_AT':
    case 'BEST_SELLING':
    case 'RELEVANCE':
    default:
      break;
  }
  return options?.reverse ? sorted.reverse() : sorted;
}

function matches(product: Product, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return [product.title, product.description, product.productType, ...product.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export const localCatalogue: CatalogueSource = {
  kind: 'local',

  async getProduct(handle: string): Promise<Product | null> {
    return FIXTURE_PRODUCTS.find((product) => product.handle === handle) ?? null;
  },

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    return (await localCatalogue.getProductPage(options)).products;
  },

  async getProductPage(options?: ProductQueryOptions): Promise<ProductPage> {
    const filtered = options?.query
      ? FIXTURE_PRODUCTS.filter((product) => matches(product, options.query ?? ''))
      : FIXTURE_PRODUCTS;
    const { page, pageInfo } = paginate(sortProducts(filtered, options), options);
    return { products: page, pageInfo };
  },

  async getCollection(handle: string): Promise<Collection | null> {
    return FIXTURE_COLLECTIONS.find((collection) => collection.handle === handle) ?? null;
  },

  async getCollectionProducts(
    handle: string,
    options?: ProductQueryOptions,
  ): Promise<CollectionWithProducts | null> {
    const collection = FIXTURE_COLLECTIONS.find((entry) => entry.handle === handle);
    if (!collection) return null;

    const handles = FIXTURE_COLLECTION_PRODUCTS[handle] ?? [];
    const products = handles
      .map((productHandle) => FIXTURE_PRODUCTS.find((p) => p.handle === productHandle))
      .filter((product): product is Product => Boolean(product));

    const { page, pageInfo } = paginate(sortProducts(products, options), options);
    return { collection, products: page, pageInfo };
  },

  async getCollections(): Promise<Collection[]> {
    return FIXTURE_COLLECTIONS;
  },

  async getProductRecommendations(product: Product, limit = 3): Promise<Product[]> {
    // The handoff hand-picks three cross-sells per SKU; that is the fixture's
    // stand-in for Shopify's recommendation engine.
    return (FIXTURE_SUGGESTIONS[product.handle] ?? [])
      .map((handle) => FIXTURE_PRODUCTS.find((candidate) => candidate.handle === handle))
      .filter((candidate): candidate is Product => Boolean(candidate))
      .slice(0, limit);
  },

  async searchProducts(term: string, options?: ProductQueryOptions): Promise<Product[]> {
    const hits = FIXTURE_PRODUCTS.filter((product) => matches(product, term));
    return paginate(hits, options).page;
  },
};

/**
 * The fixture cannot hold a cart: a cart without a checkout is a lie, and the
 * whole point of this adapter is that it never pretends to be a shop. Every
 * mutation fails loudly and the UI explains why.
 */
function noCart(): never {
  throw new CommerceError(
    'not_configured',
    'O catálogo de desenvolvimento não tem cesto. Configura o Shopify para comprar.',
  );
}

export const localCart: CartSource = {
  kind: 'local',
  async get(): Promise<Cart | null> {
    return null;
  },
  async create(_lines: CartLineInput[]): Promise<Cart> {
    noCart();
  },
  async addLines(): Promise<Cart> {
    noCart();
  },
  async updateLines(): Promise<Cart> {
    noCart();
  },
  async removeLines(): Promise<Cart> {
    noCart();
  },
};
