import { NextResponse } from 'next/server';

import { buildLogoutUrl } from '@/lib/customer/oauth';
import { clearSession, readIdToken } from '@/lib/customer/session';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** Clears the local session, then ends the Shopify session too. */
export async function GET() {
  const idToken = await readIdToken();
  await clearSession();

  const logoutUrl = buildLogoutUrl(idToken);
  return NextResponse.redirect(logoutUrl ?? absoluteUrl('/'));
}
