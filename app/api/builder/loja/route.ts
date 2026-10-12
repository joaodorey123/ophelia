import { NextResponse } from 'next/server';

import { isShopConnected, listCollections, listProducts } from '@/lib/builder/shopify';
import { guardRequest } from '@/lib/builder/session';

export const runtime = 'nodejs';

/** The products and categories the editor offers as choices. */
export async function GET() {
  const denied = await guardRequest();
  if (denied) return denied;

  if (!isShopConnected()) {
    return NextResponse.json({ connected: false, products: [], collections: [] });
  }

  const [products, collections] = await Promise.all([listProducts(), listCollections()]);

  return NextResponse.json({
    // `connected` says credentials exist; a null list means the shop was
    // unreachable, which the editor reports differently.
    connected: true,
    reachable: products !== null && collections !== null,
    products: products ?? [],
    collections: collections ?? [],
  });
}
