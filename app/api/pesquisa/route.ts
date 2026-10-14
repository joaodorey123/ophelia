import { NextResponse } from 'next/server';

import { catalogue } from '@/lib/commerce';
import { CommerceError } from '@/lib/commerce/types';
import { site } from '@/lib/content';
import { searchCatalogue, toSearchResults } from '@/lib/search';
import { matchPages } from '@/lib/search-match';

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
      ? await searchCatalogue(term, 8)
      : await catalogue().getProducts({ first: 6, sortKey: 'BEST_SELLING' });

    return NextResponse.json(
      { results: toSearchResults(products), pages: matchPages(term, site.reservations.url) },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' } },
    );
  } catch (error) {
    const code = error instanceof CommerceError ? error.code : 'unavailable';
    // The message is deliberately generic: adapters put store detail in it.
    return NextResponse.json({ results: [], error: code }, { status: 503 });
  }
}
