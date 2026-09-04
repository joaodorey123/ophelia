'use server';

import { revalidatePath } from 'next/cache';

import { cartSource, isCheckoutAvailable } from '@/lib/commerce';
import type { Cart, CartLineInput } from '@/lib/commerce/types';
import { CommerceError } from '@/lib/commerce/types';

import { clearCartId, readCartId, writeCartId } from './cookies';

/**
 * Cart mutations. Every one returns a discriminated result rather than
 * throwing across the server boundary, so the UI can show the failure in the
 * design's own language instead of an error overlay.
 */
export type CartActionResult =
  | { ok: true; cart: Cart }
  | { ok: false; message: string; cart: Cart | null };

const GENERIC_FAILURE =
  'Não conseguimos atualizar o cesto. Verifica a ligação e tenta outra vez.';

function toMessage(error: unknown): string {
  if (error instanceof CommerceError) {
    switch (error.code) {
      case 'not_configured':
        return 'A loja ainda não está ligada ao Shopify.';
      case 'not_found':
        return 'O cesto já não existe. Começámos um novo para ti.';
      case 'network':
        return 'Não conseguimos falar com a loja. Verifica a ligação e tenta outra vez.';
      default:
        return error.message || GENERIC_FAILURE;
    }
  }
  return GENERIC_FAILURE;
}

async function currentCart(): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;
  try {
    return await cartSource().get(cartId);
  } catch {
    return null;
  }
}

/** Persists the returned cart id and refreshes every route that shows a cart. */
async function commit(cart: Cart): Promise<CartActionResult> {
  await writeCartId(cart.id);
  revalidatePath('/', 'layout');
  return { ok: true, cart };
}

export async function addToCart(lines: CartLineInput[]): Promise<CartActionResult> {
  const sane = lines.filter((line) => line.merchandiseId && line.quantity > 0);
  if (sane.length === 0) {
    return { ok: false, message: 'Nada para adicionar.', cart: await currentCart() };
  }

  const source = cartSource();

  try {
    const cartId = await readCartId();
    if (!cartId) return commit(await source.create(sane));

    try {
      return await commit(await source.addLines(cartId, sane));
    } catch (error) {
      // The stored cart may have been completed or expired: start a new one
      // rather than losing the visitor's click.
      if (error instanceof CommerceError && error.code === 'not_found') {
        await clearCartId();
        return commit(await source.create(sane));
      }
      throw error;
    }
  } catch (error) {
    return { ok: false, message: toMessage(error), cart: await currentCart() };
  }
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartActionResult> {
  const cartId = await readCartId();
  if (!cartId) return { ok: false, message: 'O cesto está vazio.', cart: null };

  // Stepping a line below 1 removes it — handoff cart rule 2.
  const next = Math.min(99, Math.max(0, Math.trunc(quantity)));

  try {
    const source = cartSource();
    const cart =
      next === 0
        ? await source.removeLines(cartId, [lineId])
        : await source.updateLines(cartId, [{ id: lineId, quantity: next }]);
    return commit(cart);
  } catch (error) {
    return { ok: false, message: toMessage(error), cart: await currentCart() };
  }
}

export async function removeCartLine(lineId: string): Promise<CartActionResult> {
  const cartId = await readCartId();
  if (!cartId) return { ok: false, message: 'O cesto está vazio.', cart: null };

  try {
    return commit(await cartSource().removeLines(cartId, [lineId]));
  } catch (error) {
    return { ok: false, message: toMessage(error), cart: await currentCart() };
  }
}

/** Re-reads the cart from the source of truth, used to recover from an error. */
export async function refreshCart(): Promise<Cart | null> {
  return currentCart();
}

/**
 * Hands the visitor to Shopify's hosted checkout. We never take payment here.
 * Returns the URL rather than redirecting so the caller can show a message
 * when checkout is not configured.
 */
export async function getCheckoutUrl(): Promise<
  { ok: true; url: string } | { ok: false; message: string }
> {
  if (!isCheckoutAvailable()) {
    return {
      ok: false,
      message:
        'O pagamento é processado pelo Shopify e ainda não está ligado a esta loja. Fala connosco em ' +
        'info@callmeophelia.com para concluíres a encomenda.',
    };
  }

  const cart = await currentCart();
  if (!cart || cart.lines.length === 0) {
    return { ok: false, message: 'O cesto está vazio.' };
  }
  if (!cart.checkoutUrl) {
    return { ok: false, message: 'O pagamento não está disponível de momento.' };
  }
  return { ok: true, url: cart.checkoutUrl };
}
