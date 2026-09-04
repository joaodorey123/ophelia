import 'server-only';

import { getCustomerAccountConfig } from '@/lib/commerce/config';

import type { CustomerTokens } from './session';

/**
 * Shopify Customer Account API — OAuth 2.0 with PKCE.
 *
 * Public client, so there is no client secret to leak; the code verifier never
 * leaves the server either. See docs/SHOPIFY.md for the app configuration this
 * expects.
 */

const SCOPES = 'openid email customer-account-api:full';

function randomString(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64url');
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return Buffer.from(digest).toString('base64url');
}

export async function buildAuthorizationUrl(): Promise<{
  url: string;
  state: string;
  nonce: string;
  verifier: string;
} | null> {
  const config = getCustomerAccountConfig();
  if (!config) return null;

  const state = randomString(16);
  const nonce = randomString(16);
  const verifier = randomString(32);

  const url = new URL(`${config.apiUrl}/auth/oauth/authorize`);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', nonce);
  url.searchParams.set('code_challenge', await codeChallenge(verifier));
  url.searchParams.set('code_challenge_method', 'S256');

  return { url: url.toString(), state, nonce, verifier };
}

export async function exchangeCodeForTokens(
  code: string,
  verifier: string,
): Promise<CustomerTokens | null> {
  const config = getCustomerAccountConfig();
  if (!config) return null;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code,
    code_verifier: verifier,
  });

  const response = await fetch(`${config.apiUrl}/auth/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Shopify requires an Origin header for public clients.
      Origin: new URL(config.redirectUri).origin,
    },
    body,
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
  };

  if (!json.access_token) return null;

  return {
    accessToken: json.access_token,
    ...(json.refresh_token ? { refreshToken: json.refresh_token } : {}),
    ...(json.id_token ? { idToken: json.id_token } : {}),
    expiresIn: json.expires_in ?? 7200,
  };
}

export function buildLogoutUrl(idToken: string | null): string | null {
  const config = getCustomerAccountConfig();
  if (!config) return null;
  const url = new URL(`${config.apiUrl}/auth/logout`);
  if (idToken) url.searchParams.set('id_token_hint', idToken);
  url.searchParams.set('post_logout_redirect_uri', new URL(config.redirectUri).origin);
  return url.toString();
}
