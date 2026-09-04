import 'server-only';

import { cache } from 'react';

import { cartSource } from '@/lib/commerce';
import type { Cart } from '@/lib/commerce/types';

import { readCartId } from './cookies';

/**
 * Reads the visitor's cart. Deduplicated per request with React `cache` so the
 * header, the drawer and the cart page share one round trip.
 *
 * Never cached across requests — a cart is user-specific data.
 */
export const getCart = cache(async (): Promise<Cart | null> => {
  const cartId = await readCartId();
  if (!cartId) return null;

  try {
    return await cartSource().get(cartId);
  } catch {
    // A stale or revoked cart id must not break the page: the visitor simply
    // starts with an empty cesto.
    return null;
  }
});
