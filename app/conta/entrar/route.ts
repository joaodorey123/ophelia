import { NextResponse } from 'next/server';

import { buildAuthorizationUrl } from '@/lib/customer/oauth';
import { saveAuthorizationState } from '@/lib/customer/session';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** Starts the Shopify Customer Account sign-in. */
export async function GET() {
  const authorization = await buildAuthorizationUrl();
  if (!authorization) {
    return NextResponse.redirect(absoluteUrl('/conta?erro=nao-configurado'));
  }

  await saveAuthorizationState(authorization.state, authorization.nonce, authorization.verifier);
  return NextResponse.redirect(authorization.url);
}
