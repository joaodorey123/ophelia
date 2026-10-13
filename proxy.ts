import { NextResponse, type NextRequest } from 'next/server';

import { PREVIEW_COOKIE, hasPreviewAccess, isGateOn } from '@/lib/coming-soon';

/**
 * Until launch, every page sends visitors to the "em breve" page, remembering
 * where they were going so the password lands them back there. See
 * lib/coming-soon.ts for when the gate is on.
 *
 * A redirect rather than a rewrite: behind the hosting's proxy a rewrite is
 * resolved against the forwarded https origin and Next tries to fetch it from
 * itself as an external URL, which fails.
 */
export function proxy(request: NextRequest) {
  if (!isGateOn() || hasPreviewAccess(request.cookies.get(PREVIEW_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const target = new URL('/em-breve', origin);
  target.searchParams.set('next', next);

  const response = NextResponse.redirect(target, 302);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  /*
   * Everything except: the gate itself, the content editor and every API
   * (Shopify webhooks, the editor's own), Next's assets, and any file with an
   * extension — images, robots.txt, the sitemap.
   */
  matcher: ['/((?!_next/|api/|builder|em-breve|.*\\..*).*)'],
};
