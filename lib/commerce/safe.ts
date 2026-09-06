import 'server-only';

import { catalogue } from '@/lib/commerce';
import type { Collection } from '@/lib/commerce/types';

/**
 * Chrome-level reads that must not take the whole site down.
 *
 * The header and footer are on every page, including the ones that have
 * nothing to do with commerce. If Shopify is unreachable, "quem somos" should
 * still render — so this logs loudly and returns nothing, while pages that
 * genuinely need products surface the failure themselves.
 */
export async function getCollectionsSafe(): Promise<Collection[]> {
  try {
    return await catalogue().getCollections();
  } catch (error) {
    console.error('[commerce] Could not load collections for site chrome:', error);
    return [];
  }
}
