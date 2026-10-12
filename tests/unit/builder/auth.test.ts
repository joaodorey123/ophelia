import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createSession, hashPassword, verifyPassword, verifySession } from '@/lib/builder/auth';

const SECRET = 'a'.repeat(48);

describe('password hashing', () => {
  it('accepts the password it was made from', () => {
    const hash = hashPassword('correct horse battery staple');
    expect(verifyPassword('correct horse battery staple', hash)).toBe(true);
  });

  it('rejects anything else', () => {
    const hash = hashPassword('correct horse battery staple');
    for (const wrong of [
      '',
      'wrong',
      'Correct horse battery staple',
      'correct horse battery stapl',
    ]) {
      expect(verifyPassword(wrong, hash), wrong).toBe(false);
    }
  });

  it('salts, so the same password hashes differently each time', () => {
    expect(hashPassword('same password')).not.toBe(hashPassword('same password'));
  });

  /*
   * A malformed hash must fail closed. `Buffer.from` drops non-hex characters
   * silently, so "scrypt:zz:zz" parses to two empty buffers — and an empty
   * derived key compares equal to an empty expected one, which would accept
   * every password. This is the regression test for that.
   */
  it('refuses every password when the stored hash is unusable', () => {
    const broken = [
      '',
      'not-a-hash',
      'scrypt:',
      'scrypt:zz:zz',
      'scrypt::',
      'bcrypt:a:b',
      // Right shape, wrong lengths.
      'scrypt:ab:cd',
      `scrypt:${'a'.repeat(30)}:${'b'.repeat(128)}`,
      `scrypt:${'a'.repeat(32)}:${'b'.repeat(120)}`,
    ];
    for (const stored of broken) {
      for (const attempt of ['', 'anything', 'admin']) {
        expect(verifyPassword(attempt, stored), `${stored} / ${attempt}`).toBe(false);
      }
    }
  });
});

describe('sessions', () => {
  it('issues a token it accepts back', () => {
    const { token } = createSession(SECRET);
    expect(verifySession(token, SECRET)).toBe(true);
  });

  it('rejects a token signed with a different secret', () => {
    const { token } = createSession(SECRET);
    expect(verifySession(token, 'b'.repeat(48))).toBe(false);
  });

  it('rejects a tampered payload', () => {
    const { token } = createSession(SECRET);
    const [payload, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 10_000_000 })).toString(
      'base64url',
    );
    expect(payload).toBeTruthy();
    expect(verifySession(`${forged}.${signature}`, SECRET)).toBe(false);
  });

  it('rejects an expired token', () => {
    // A correctly signed token whose expiry has passed.
    const payload = Buffer.from(JSON.stringify({ exp: Date.now() - 1000 })).toString('base64url');
    const signature = createHmac('sha256', SECRET)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(verifySession(`${payload}.${signature}`, SECRET)).toBe(false);
  });

  it('rejects nonsense', () => {
    for (const bad of [undefined, '', 'no-dot', '.', 'a.b']) {
      expect(verifySession(bad as string | undefined, SECRET), String(bad)).toBe(false);
    }
  });
});
