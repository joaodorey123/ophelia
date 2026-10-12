import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  clearFailures,
  createSession,
  isLockedOut,
  recordFailure,
  SESSION_COOKIE,
  verifyPassword,
} from '@/lib/builder/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sign in and sign out.
 *
 * The failure message never distinguishes "wrong password" from anything else,
 * and every attempt is throttled per client address.
 */
export async function POST(request: Request) {
  const header = await headers();
  const client = header.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isLockedOut(client)) {
    return NextResponse.json(
      { error: 'Demasiadas tentativas. Tenta outra vez dentro de 15 minutos.' },
      { status: 429 },
    );
  }

  let password: unknown;
  try {
    password = ((await request.json()) as { password?: unknown }).password;
  } catch {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length === 0) {
    recordFailure(client);
    return NextResponse.json({ error: 'Palavra-passe incorrecta.' }, { status: 401 });
  }

  let ok = false;
  try {
    ok = verifyPassword(password);
  } catch (error) {
    // A missing BUILDER_PASSWORD_HASH is a setup problem, not a bad password.
    console.error('[auth] configuration error:', error);
    return NextResponse.json(
      { error: 'O editor ainda não está configurado. Falta BUILDER_PASSWORD_HASH.' },
      { status: 500 },
    );
  }

  if (!ok) {
    recordFailure(client);
    return NextResponse.json({ error: 'Palavra-passe incorrecta.' }, { status: 401 });
  }

  clearFailures(client);
  const session = createSession();
  const store = await cookies();
  store.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
