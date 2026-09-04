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

export type ShopifyConfig = {
  storeDomain: string;
  storefrontAccessToken: string;
  apiVersion: string;
  endpoint: string;
};

export function getShopifyConfig(): ShopifyConfig | null {
  const storeDomain = optional('SHOPIFY_STORE_DOMAIN');
  const storefrontAccessToken = optional('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  if (!storeDomain || !storefrontAccessToken) return null;

  const apiVersion = optional('SHOPIFY_STOREFRONT_API_VERSION') ?? '2025-07';
  const host = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return {
    storeDomain: host,
    storefrontAccessToken,
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

/** True when the storefront is running on the local development catalogue. */
export function isUsingLocalCatalogue(): boolean {
  if (optional('OPHELIA_FORCE_LOCAL_CATALOGUE') === 'true') return true;
  return getShopifyConfig() === null;
}
