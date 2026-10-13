import { NextResponse, type NextRequest } from 'next/server';

import { PREVIEW_COOKIE, hasPreviewAccess, isGateOn } from '@/lib/coming-soon';

/**
 * Until launch, every page shows the "em breve" page instead — same address,
 * so a visitor who enters the password lands back where they were going.
 * See lib/coming-soon.ts for when the gate is on.
 */
export function proxy(request: NextRequest) {
  if (!isGateOn() || hasPreviewAccess(request.cookies.get(PREVIEW_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const next = `${url.pathname}${url.search}`;
  url.pathname = '/em-breve';
  url.search = `?next=${encodeURIComponent(next)}`;

  const response = NextResponse.rewrite(url);
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
