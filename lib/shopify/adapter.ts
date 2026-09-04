import 'server-only';

import type {
  Cart,
  CartLineInput,
  CartSource,
  CatalogueSource,
  Collection,
  CollectionWithProducts,
  Product,
  ProductQueryOptions,
} from '@/lib/commerce/types';
import { CommerceError } from '@/lib/commerce/types';

import { storefront, TAGS } from './client';
import {
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
} from './mutations';
import {
  GET_CART,
  GET_COLLECTION,
  GET_COLLECTION_PRODUCTS,
  GET_COLLECTIONS,
  GET_PRODUCT,
  GET_PRODUCTS,
  SEARCH_PRODUCTS,
} from './queries';
import type { RawCart, RawCollection, RawProduct } from './transform';
import { toCart, toCollection, toProduct } from './transform';

const DEFAULT_PAGE_SIZE = 48;

/** Collection sort keys differ from product sort keys in Shopify's schema. */
function collectionSortKey(sortKey: ProductQueryOptions['sortKey']): string | undefined {
  switch (sortKey) {
    case 'PRICE':
      return 'PRICE';
    case 'TITLE':
      return 'TITLE';
    case 'BEST_SELLING':
      return 'BEST_SELLING';
    case 'CREATED_AT':
      return 'CREATED';
    default:
      return undefined;
  }
}

export const shopifyCatalogue: CatalogueSource = {
  kind: 'shopify',

  async getProduct(handle) {
    const data = await storefront<{ product: RawProduct | null }>({
      query: GET_PRODUCT,
      variables: { handle },
      tags: [TAGS.products, TAGS.product(handle)],
    });
    return data.product ? toProduct(data.product) : null;
  },

  async getProducts(options = {}) {
    const data = await storefront<{ products: { nodes: RawProduct[] } }>({
      query: GET_PRODUCTS,
      variables: {
        first: options.first ?? DEFAULT_PAGE_SIZE,
        sortKey: options.sortKey ?? null,
        reverse: options.reverse ?? false,
        query: options.query ?? null,
        after: options.cursor ?? null,
      },
      tags: [TAGS.products],
    });
    return data.products.nodes.map(toProduct);
  },

  async getCollection(handle) {
    const data = await storefront<{ collection: RawCollection | null }>({
      query: GET_COLLECTION,
      variables: { handle },
      tags: [TAGS.collections, TAGS.collection(handle)],
    });
    return data.collection ? toCollection(data.collection) : null;
  },

  async getCollectionProducts(handle, options = {}) {
    const data = await storefront<{
      collection:
        | (RawCollection & {
            products: { nodes: RawProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
          })
        | null;
    }>({
      query: GET_COLLECTION_PRODUCTS,
      variables: {
        handle,
        first: options.first ?? DEFAULT_PAGE_SIZE,
        sortKey: collectionSortKey(options.sortKey) ?? null,
        reverse: options.reverse ?? false,
        after: options.cursor ?? null,
      },
      tags: [TAGS.collections, TAGS.collection(handle), TAGS.products],
    });

    if (!data.collection) return null;

    return {
      collection: toCollection(data.collection),
      products: data.collection.products.nodes.map(toProduct),
      pageInfo: data.collection.products.pageInfo,
    } satisfies CollectionWithProducts;
  },

  async getCollections() {
    const data = await storefront<{ collections: { nodes: RawCollection[] } }>({
      query: GET_COLLECTIONS,
      variables: { first: 50 },
      tags: [TAGS.collections],
    });
    return data.collections.nodes.map(toCollection) satisfies Collection[];
  },

  async searchProducts(term, options = {}) {
    const trimmed = term.trim();
    if (!trimmed) return [];

    const data = await storefront<{ search: { nodes: (RawProduct | Record<string, never>)[] } }>({
      query: SEARCH_PRODUCTS,
      variables: { query: trimmed, first: options.first ?? 24 },
      // Search results follow the catalogue, so they may be cached with it.
      tags: [TAGS.products],
    });

    return data.search.nodes
      .filter((node): node is RawProduct => typeof (node as RawProduct).handle === 'string')
      .map(toProduct) satisfies Product[];
  },

};

type CartMutationResult = {
  cart: RawCart | null;
  userErrors: { field: string[] | null; message: string }[];
};

function unwrapCart(result: CartMutationResult | undefined, operation: string): Cart {
  if (!result) {
    throw new CommerceError('invalid', `Shopify returned no result for ${operation}.`);
  }
  if (result.userErrors?.length) {
    throw new CommerceError('invalid', result.userErrors.map((error) => error.message).join('; '));
  }
  if (!result.cart) {
    throw new CommerceError('not_found', `Shopify returned no cart for ${operation}.`);
  }
  return toCart(result.cart);
}

export const shopifyCart: CartSource = {
  kind: 'shopify',

  async get(cartId) {
    const data = await storefront<{ cart: RawCart | null }>({
      query: GET_CART,
      variables: { cartId },
      cache: 'no-store',
    });
    return data.cart ? toCart(data.cart) : null;
  },

  async create(lines: CartLineInput[]) {
    const data = await storefront<{ cartCreate: CartMutationResult }>({
      query: CART_CREATE,
      variables: { lines },
      cache: 'no-store',
    });
    return unwrapCart(data.cartCreate, 'cartCreate');
  },

  async addLines(cartId, lines) {
    const data = await storefront<{ cartLinesAdd: CartMutationResult }>({
      query: CART_LINES_ADD,
      variables: { cartId, lines },
      cache: 'no-store',
    });
    return unwrapCart(data.cartLinesAdd, 'cartLinesAdd');
  },

  async updateLines(cartId, lines) {
    const data = await storefront<{ cartLinesUpdate: CartMutationResult }>({
      query: CART_LINES_UPDATE,
      variables: { cartId, lines },
      cache: 'no-store',
    });
    return unwrapCart(data.cartLinesUpdate, 'cartLinesUpdate');
  },

  async removeLines(cartId, lineIds) {
    const data = await storefront<{ cartLinesRemove: CartMutationResult }>({
      query: CART_LINES_REMOVE,
      variables: { cartId, lineIds },
      cache: 'no-store',
    });
    return unwrapCart(data.cartLinesRemove, 'cartLinesRemove');
  },
};
