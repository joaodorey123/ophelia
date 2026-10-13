import 'server-only';

import { localCart, localCatalogue } from '@/lib/catalogue/adapter';
import { site } from '@/lib/content';
import { shopifyCart, shopifyCatalogue } from '@/lib/shopify/adapter';

import { assertCommerceConfigured, isUsingLocalCatalogue } from './config';
import type { CartSource, CatalogueSource, Product } from './types';

/**
 * The storefront's single commerce entry point.
 *
 * Pages and server actions import `catalogue()` / `cart()` and never an
 * adapter directly, so swapping the local development catalogue for a real
 * Shopify store is purely a matter of setting environment variables.
 */

export function catalogue(): CatalogueSource {
  assertCommerceConfigured();
  return withoutAddOns(isUsingLocalCatalogue() ? localCatalogue : shopifyCatalogue);
}

/**
 * The handwritten card is a real Shopify product — it has to be, to go in the
 * cart — but it is an add-on offered on product pages, not something to browse.
 * Every list leaves it out; fetching it by handle still works.
 */
function withoutAddOns(source: CatalogueSource): CatalogueSource {
  const hidden = site.product.giftCardHandle;
  const keep = (products: Product[]) => products.filter((product) => product.handle !== hidden);

  return {
    kind: source.kind,
    getProduct: (handle) => source.getProduct(handle),
    getProducts: async (options) => keep(await source.getProducts(options)),
    getProductPage: async (options) => {
      const page = await source.getProductPage(options);
      return { ...page, products: keep(page.products) };
    },
    getCollection: (handle) => source.getCollection(handle),
    getCollectionProducts: async (handle, options) => {
      const result = await source.getCollectionProducts(handle, options);
      return result ? { ...result, products: keep(result.products) } : null;
    },
    getCollections: () => source.getCollections(),
    searchProducts: async (term, options) => keep(await source.searchProducts(term, options)),
    getProductRecommendations: async (product, limit) =>
      keep(await source.getProductRecommendations(product, limit)),
  };
}

export function cartSource(): CartSource {
  assertCommerceConfigured();
  return isUsingLocalCatalogue() ? localCart : shopifyCart;
}

/** True when the storefront cannot take a real order. The UI must say so. */
export function isCheckoutAvailable(): boolean {
  return !isUsingLocalCatalogue();
}

export * from './types';
