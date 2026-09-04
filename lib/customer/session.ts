import 'server-only';

import { cookies } from 'next/headers';

/**
 * Customer session storage.
 *
 * Tokens live in httpOnly, sameSite=lax cookies and are never sent to the
 * browser. We store no passwords: authentication is delegated entirely to
 * Shopify's Customer Account API.
 */

const ACCESS_COOKIE = 'ophelia_customer_token';
const REFRESH_COOKIE = 'ophelia_customer_refresh';
const ID_TOKEN_COOKIE = 'ophelia_customer_id_token';
const VERIFIER_COOKIE = 'ophelia_pkce_verifier';
const STATE_COOKIE = 'ophelia_oauth_state';
const NONCE_COOKIE = 'ophelia_oauth_nonce';

const secure = process.env.NODE_ENV === 'production';

const base = { httpOnly: true as const, sameSite: 'lax' as const, secure, path: '/' };

export type CustomerTokens = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
};

export async function saveTokens(tokens: CustomerTokens): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: tokens.expiresIn });
  if (tokens.refreshToken) {
    store.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
  }
  if (tokens.idToken) {
    store.set(ID_TOKEN_COOKIE, tokens.idToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
  }
}

export async function readAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function readIdToken(): Promise<string | null> {
  return (await cookies()).get(ID_TOKEN_COOKIE)?.value ?? null;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ID_TOKEN_COOKIE]) store.delete(name);
}

/** PKCE + CSRF material, short-lived and cleared as soon as it is used. */
export async function saveAuthorizationState(state: string, nonce: string, verifier: string) {
  const store = await cookies();
  const options = { ...base, maxAge: 60 * 10 };
  store.set(STATE_COOKIE, state, options);
  store.set(NONCE_COOKIE, nonce, options);
  store.set(VERIFIER_COOKIE, verifier, options);
}

export async function takeAuthorizationState(): Promise<{
  state: string | null;
  nonce: string | null;
  verifier: string | null;
}> {
  const store = await cookies();
  const state = store.get(STATE_COOKIE)?.value ?? null;
  const nonce = store.get(NONCE_COOKIE)?.value ?? null;
  const verifier = store.get(VERIFIER_COOKIE)?.value ?? null;
  for (const name of [STATE_COOKIE, NONCE_COOKIE, VERIFIER_COOKIE]) store.delete(name);
  return { state, nonce, verifier };
}
