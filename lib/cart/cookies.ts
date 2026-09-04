import 'server-only';

import { cookies } from 'next/headers';

/**
 * The cart id lives in an httpOnly cookie so it is never readable by scripts
 * in the page. It is an opaque handle: with Shopify it is a Shopify cart GID,
 * with the local development catalogue it is the encoded cart itself.
 */
export const CART_COOKIE = 'ophelia_cart';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function writeCartId(cartId: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  });
}

export async function clearCartId(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}
