import 'server-only';

import { getShopifyConfig } from '@/lib/commerce/config';
import { CommerceError } from '@/lib/commerce/types';

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: Record<string, unknown> }[];
};

export type StorefrontRequest = {
  query: string;
  variables?: Record<string, unknown>;
  /**
   * Cache tags for on-demand revalidation. Public catalogue reads are cached;
   * cart and customer reads pass `cache: 'no-store'` instead.
   */
  tags?: string[];
  revalidate?: number | false;
  cache?: RequestCache;
};

const DEFAULT_REVALIDATE_SECONDS = 60 * 15;

/**
 * The single point where a Shopify Storefront API request is made.
 *
 * Everything above this file speaks domain types; everything below is GraphQL.
 * The access token never leaves the server.
 */
export async function storefront<T>({
  query,
  variables,
  tags,
  revalidate,
  cache,
}: StorefrontRequest): Promise<T> {
  const config = getShopifyConfig();
  if (!config) {
    throw new CommerceError(
      'not_configured',
      'Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
    );
  }

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken,
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      ...(cache ? { cache } : {}),
      next:
        cache === 'no-store'
          ? undefined
          : {
              revalidate: revalidate ?? DEFAULT_REVALIDATE_SECONDS,
              ...(tags ? { tags } : {}),
            },
    });
  } catch (cause) {
    throw new CommerceError('network', 'Could not reach the Shopify Storefront API.', { cause });
  }

  if (!response.ok) {
    throw new CommerceError(
      'unavailable',
      `Shopify Storefront API responded ${response.status} ${response.statusText}.`,
    );
  }

  const body = (await response.json()) as GraphQLResponse<T>;

  if (body.errors?.length) {
    const message = body.errors.map((error) => error.message).join('; ');
    throw new CommerceError('invalid', `Shopify Storefront API error: ${message}`);
  }

  if (!body.data) {
    throw new CommerceError('invalid', 'Shopify Storefront API returned no data.');
  }

  return body.data;
}

/** Cache tags, so a Shopify webhook can invalidate precisely. */
export const TAGS = {
  products: 'shopify:products',
  collections: 'shopify:collections',
  product: (handle: string) => `shopify:product:${handle}`,
  collection: (handle: string) => `shopify:collection:${handle}`,
} as const;
