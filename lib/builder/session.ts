import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE, verifySession } from './auth';

/** True when the caller holds a valid session. */
export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * Guards a page. Redirects to the sign-in screen rather than rendering an
 * error, because an expired session is ordinary, not exceptional.
 */
export async function requireSession(): Promise<void> {
  if (!(await hasSession())) redirect('/builder/entrar');
}

/** Guards an API route. Returns a 401 response, or null when authorised. */
export async function guardRequest(): Promise<Response | null> {
  if (await hasSession()) return null;
  return Response.json({ error: 'Sessão terminada. Volta a entrar.' }, { status: 401 });
}
