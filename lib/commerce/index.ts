import 'server-only';

import { localCart, localCatalogue } from '@/lib/catalogue/adapter';
import { shopifyCart, shopifyCatalogue } from '@/lib/shopify/adapter';

import { assertCommerceConfigured, isUsingLocalCatalogue } from './config';
import type { CartSource, CatalogueSource } from './types';

/**
 * The storefront's single commerce entry point.
 *
 * Pages and server actions import `catalogue()` / `cart()` and never an
 * adapter directly, so swapping the local development catalogue for a real
 * Shopify store is purely a matter of setting environment variables.
 */

export function catalogue(): CatalogueSource {
  assertCommerceConfigured();
  return isUsingLocalCatalogue() ? localCatalogue : shopifyCatalogue;
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
