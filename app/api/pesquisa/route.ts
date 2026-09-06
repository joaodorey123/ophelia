import { NextResponse } from 'next/server';

import { catalogue } from '@/lib/commerce';
import { CommerceError } from '@/lib/commerce/types';
import { toSearchResults } from '@/lib/search';

/**
 * Type-ahead for the header's search sheet.
 *
 * The overlay needs results while the visitor types, which a server component
 * cannot provide; this is the one read that goes over the wire. It still calls
 * the commerce layer rather than Shopify, so no GraphQL and no token reach the
 * browser.
 */
export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get('q')?.trim() ?? '';

  try {
    const products = term
      ? await catalogue().searchProducts(term, { first: 8 })
      : await catalogue().getProducts({ first: 6, sortKey: 'BEST_SELLING' });

    return NextResponse.json(
      { results: toSearchResults(products) },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' } },
    );
  } catch (error) {
    const code = error instanceof CommerceError ? error.code : 'unavailable';
    // The message is deliberately generic: adapters put store detail in it.
    return NextResponse.json({ results: [], error: code }, { status: 503 });
  }
}
