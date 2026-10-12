import 'server-only';

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { getPasswordHash, getSessionSecret } from './config';

/**
 * Authentication for a single editor.
 *
 * There is one password, held as a scrypt hash in the environment, and a
 * signed session cookie. No user table, no third-party identity provider —
 * this tool has exactly one user, and anything more would be more surface to
 * get wrong rather than more security.
 */

const SCRYPT = { N: 16_384, r: 8, p: 1, keylen: 64 } as const;

export const SESSION_COOKIE = 'ophelia_builder_session';
const SESSION_HOURS = 12;

/** Produces the value of BUILDER_PASSWORD_HASH. Used by the setup script. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

const SALT_BYTES = 16;

/**
 * Parses a stored hash, or returns null if it is not one.
 *
 * The length checks are the important part. `Buffer.from` silently drops
 * characters that are not hex, so "scrypt:zz:zz" would otherwise parse to two
 * empty buffers — and an empty derived key compares equal to an empty expected
 * key, which accepts every password. A malformed hash must fail closed.
 */
function parseStoredHash(stored: string): { salt: Buffer; expected: Buffer } | null {
  const [scheme, saltHex, hashHex] = stored.split(':');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return null;
  if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) return null;

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  if (salt.length !== SALT_BYTES || expected.length !== SCRYPT.keylen) return null;

  return { salt, expected };
}

/**
 * Constant-time password check.
 *
 * Every failure path costs the same work: an unusable stored hash still runs a
 * full comparison against random bytes, so timing cannot distinguish "no hash
 * configured" from "wrong password" — and it can never succeed, because the
 * value it compares against is unknowable.
 */
export function verifyPassword(password: string, stored = getPasswordHash()): boolean {
  const parsed = parseStoredHash(stored);
  const salt = parsed?.salt ?? randomBytes(SALT_BYTES);
  const expected = parsed?.expected ?? randomBytes(SCRYPT.keylen);

  let derived: Buffer;
  try {
    derived = scryptSync(password, salt, SCRYPT.keylen, SCRYPT);
  } catch {
    return false;
  }

  if (derived.length !== expected.length) return false;
  const matches = timingSafeEqual(derived, expected);

  // A hash we could not parse never authenticates, whatever the comparison said.
  return parsed !== null && matches;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sign(payload: string, secret: string): string {
  return base64url(createHmac('sha256', secret).update(payload).digest());
}

/** Issues a session token valid for SESSION_HOURS. */
export function createSession(secret = getSessionSecret()): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = base64url(JSON.stringify({ exp: expiresAt }));
  return {
    token: `${payload}.${sign(payload, secret)}`,
    maxAge: SESSION_HOURS * 60 * 60,
  };
}

/**
 * Verifies a session token.
 *
 * The signature is checked before the payload is trusted, and compared in
 * constant time, so a forged token cannot be discovered byte by byte.
 */
export function verifySession(token: string | undefined, secret = getSessionSecret()): boolean {
  if (!token) return false;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sign(payload, secret);

  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as {
      exp?: number;
    };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

/**
 * Login throttle.
 *
 * In-memory, so it protects one serverless instance rather than the whole
 * deployment — enough to make guessing impractical without adding a database
 * to a single-user tool. The lockout is per-instance and clears on redeploy.
 */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function isLockedOut(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const entry = attempts.get(key);
  const now = Date.now();
  if (!entry || now > entry.until) {
    attempts.set(key, { count: 1, until: now + LOCKOUT_MS });
    return;
  }
  entry.count += 1;
  entry.until = now + LOCKOUT_MS;
  if (attempts.size > 1000) attempts.clear();
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
