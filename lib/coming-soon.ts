import { createHash, timingSafeEqual } from 'node:crypto';

import { site } from '@/lib/content';

/**
 * The "em breve" gate: until launch, visitors see a coming-soon page and need
 * a password to see the site.
 *
 * It is on only when the client has switched it on (content/site.json →
 * comingSoon.enabled, a toggle in /builder) *and* the server has a password
 * (COMING_SOON_PASSWORD). Either one off opens the site.
 */
export const PREVIEW_COOKIE = 'ophelia_preview';
export const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30;

function password(): string {
  return process.env.COMING_SOON_PASSWORD?.trim() ?? '';
}

export function isGateOn(): boolean {
  return site.comingSoon.enabled && password().length > 0;
}

/** The cookie value proving the password was given. Changes with the password. */
export function previewToken(): string {
  return createHash('sha256').update(`ophelia-preview:${password()}`).digest('hex');
}

export function hasPreviewAccess(cookie: string | undefined): boolean {
  if (!cookie) return false;
  const expected = Buffer.from(previewToken());
  const given = Buffer.from(cookie);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function isCorrectPassword(attempt: string): boolean {
  const expected = Buffer.from(password());
  const given = Buffer.from(attempt.trim());
  return (
    expected.length > 0 && given.length === expected.length && timingSafeEqual(given, expected)
  );
}

/** Only same-site paths, so the form cannot be used to bounce visitors elsewhere. */
export function safeNext(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/';
}
