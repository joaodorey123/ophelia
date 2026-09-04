import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Shopify webhook authentication.
 *
 * Shopify signs every webhook with `X-Shopify-Hmac-Sha256`: the base64
 * HMAC-SHA256 of the **raw** request body, keyed with the webhook signing
 * secret. Verification must therefore happen before the body is parsed, and
 * the comparison must be timing-safe.
 */

export type WebhookVerification =
  | { ok: true; topic: string | null; shopDomain: string | null }
  | { ok: false; status: 401 | 503; message: string };

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  // timingSafeEqual throws on a length mismatch, which would itself leak.
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Verifies a Shopify webhook, or a manually triggered revalidation.
 *
 * Two accepted callers:
 *  - Shopify, proving itself with the HMAC header.
 *  - An operator or deploy hook, presenting the shared secret directly in
 *    `X-Ophelia-Revalidate-Secret`. Useful for a manual cache purge.
 */
export function verifyWebhook(
  request: Request,
  rawBody: string,
  secret: string | undefined,
): WebhookVerification {
  if (!secret) {
    return {
      ok: false,
      status: 503,
      message: 'Revalidation is not configured. Set OPHELIA_REVALIDATION_SECRET.',
    };
  }

  const topic = request.headers.get('x-shopify-topic');
  const shopDomain = request.headers.get('x-shopify-shop-domain');
  const hmac = request.headers.get('x-shopify-hmac-sha256');

  if (hmac) {
    const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
    if (!safeEqual(digest, hmac)) {
      return { ok: false, status: 401, message: 'Invalid webhook signature.' };
    }
    return { ok: true, topic, shopDomain };
  }

  // No Shopify signature: fall back to the shared secret for manual triggers.
  const presented = request.headers.get('x-ophelia-revalidate-secret');
  if (presented && safeEqual(presented, secret)) {
    return { ok: true, topic, shopDomain };
  }

  return { ok: false, status: 401, message: 'Unauthorized.' };
}

/** Maps a Shopify webhook topic to the handle field carrying the resource. */
export function handleFromPayload(topic: string | null, payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const handle = record.handle;
  if (typeof handle === 'string' && handle.length > 0) return handle;
  // `products/delete` sends only an id, so there is no handle to target.
  void topic;
  return null;
}
