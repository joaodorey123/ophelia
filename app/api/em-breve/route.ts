import { NextResponse } from 'next/server';

import {
  PREVIEW_COOKIE,
  PREVIEW_MAX_AGE,
  isCorrectPassword,
  previewToken,
  safeNext,
} from '@/lib/coming-soon';

/** The "em breve" form posts here: a plain form, so it works without JavaScript. */
export async function POST(request: Request) {
  const form = await request.formData();
  const next = safeNext(form.get('next'));
  const attempt = String(form.get('password') ?? '');
  const base = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? base.origin;

  if (!isCorrectPassword(attempt)) {
    // A moment's pause makes guessing slower without bothering a person.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const back = new URL('/em-breve', origin);
    back.searchParams.set('next', next);
    back.searchParams.set('erro', '1');
    return NextResponse.redirect(back, 303);
  }

  const response = NextResponse.redirect(new URL(next, origin), 303);
  response.cookies.set(PREVIEW_COOKIE, previewToken(), {
    httpOnly: true,
    secure: origin.startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: PREVIEW_MAX_AGE,
  });
  return response;
}
