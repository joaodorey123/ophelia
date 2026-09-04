import { NextResponse } from 'next/server';

import { exchangeCodeForTokens } from '@/lib/customer/oauth';
import { saveTokens, takeAuthorizationState } from '@/lib/customer/session';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * OAuth redirect target. Verifies the CSRF state before exchanging the code,
 * and clears the one-time PKCE material either way.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');

  const { state, verifier } = await takeAuthorizationState();

  if (!code || !verifier || !state || returnedState !== state) {
    return NextResponse.redirect(absoluteUrl('/conta?erro=sessao-invalida'));
  }

  const tokens = await exchangeCodeForTokens(code, verifier);
  if (!tokens) {
    return NextResponse.redirect(absoluteUrl('/conta?erro=autenticacao'));
  }

  await saveTokens(tokens);
  return NextResponse.redirect(absoluteUrl('/conta'));
}
