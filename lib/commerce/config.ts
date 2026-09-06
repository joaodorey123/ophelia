import 'server-only';

/**
 * Environment contract. Read here and nowhere else, so a missing variable
 * produces one clear message instead of an undefined deep in a fetch call.
 *
 * Nothing in this module may be imported from a client component: the tokens
 * are server-only by design.
 */

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

/**
 * Latest stable Storefront API version at the time of writing.
 *
 * Shopify silently downgrades a request for an unsupported version to the
 * oldest one it still serves and only says so in the
 * `x-shopify-api-version-warning` response header — which is how a storefront
 * ends up quietly running on year-old fields. Bump this deliberately.
 */
export const DEFAULT_API_VERSION = '2026-07';

export type ShopifyConfig = {
  storeDomain: string;
  storefrontAccessToken: string;
  tokenKind: 'public' | 'private';
  apiVersion: string;
  endpoint: string;
};

export function getShopifyConfig(): ShopifyConfig | null {
  const storeDomain = optional('SHOPIFY_STORE_DOMAIN');
  const publicToken = optional('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  const privateToken = optional('SHOPIFY_STOREFRONT_PRIVATE_TOKEN');
  const storefrontAccessToken = privateToken ?? publicToken;
  if (!storeDomain || !storefrontAccessToken) return null;

  const apiVersion = optional('SHOPIFY_STOREFRONT_API_VERSION') ?? DEFAULT_API_VERSION;
  const host = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return {
    storeDomain: host,
    storefrontAccessToken,
    /*
     * The Headless channel issues both a public and a private token. Every
     * call this storefront makes is server-side, so the private token is
     * preferred: higher rate limits, and it is never safe in a browser.
     */
    tokenKind: privateToken ? 'private' : 'public',
    apiVersion,
    endpoint: `https://${host}/api/${apiVersion}/graphql.json`,
  };
}

export type CustomerAccountConfig = {
  apiUrl: string;
  clientId: string;
  redirectUri: string;
};

export function getCustomerAccountConfig(): CustomerAccountConfig | null {
  const apiUrl = optional('SHOPIFY_CUSTOMER_ACCOUNT_API_URL');
  const clientId = optional('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID');
  const redirectUri = optional('SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI');
  if (!apiUrl || !clientId || !redirectUri) return null;
  return { apiUrl: apiUrl.replace(/\/$/, ''), clientId, redirectUri };
}

export function getEnquiryConfig(): { webhookUrl: string; secret?: string } | null {
  const webhookUrl = optional('OPHELIA_ENQUIRY_WEBHOOK_URL');
  if (!webhookUrl) return null;
  const secret = optional('OPHELIA_ENQUIRY_WEBHOOK_SECRET');
  return secret ? { webhookUrl, secret } : { webhookUrl };
}

export function getRevalidationSecret(): string | undefined {
  return optional('OPHELIA_REVALIDATION_SECRET');
}

/**
 * True when the storefront is running on the development fixture.
 *
 * Note what this does *not* do: it never falls back on its own. If Shopify is
 * misconfigured, pages fail with a configuration error rather than quietly
 * serving fixture data that looks like a working shop — the exact failure that
 * makes a broken integration invisible until launch day.
 */
export function isUsingLocalCatalogue(): boolean {
  if (optional('OPHELIA_FORCE_LOCAL_CATALOGUE') !== 'true') return false;

  if (process.env.VERCEL_ENV === 'production') {
    throw new Error(
      'OPHELIA_FORCE_LOCAL_CATALOGUE is set on a production deployment. ' +
        'The development fixture is not a shop: it has no cart and no checkout. ' +
        'Unset it and configure SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
    );
  }

  return true;
}

/**
 * Throws with an actionable message when Shopify is neither configured nor
 * explicitly bypassed. Called at the top of every commerce read.
 */
export function assertCommerceConfigured(): void {
  if (isUsingLocalCatalogue()) return;
  if (getShopifyConfig()) return;

  const missing = [
    optional('SHOPIFY_STORE_DOMAIN') ? null : 'SHOPIFY_STORE_DOMAIN',
    optional('SHOPIFY_STOREFRONT_ACCESS_TOKEN') || optional('SHOPIFY_STOREFRONT_PRIVATE_TOKEN')
      ? null
      : 'SHOPIFY_STOREFRONT_ACCESS_TOKEN (or SHOPIFY_STOREFRONT_PRIVATE_TOKEN)',
  ].filter(Boolean);

  throw new Error(
    `Shopify is not configured: ${missing.join(', ')} missing. ` +
      'Copy .env.example to .env.local and fill it in, or set ' +
      'OPHELIA_FORCE_LOCAL_CATALOGUE=true to develop against the fixture catalogue.',
  );
}
