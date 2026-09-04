import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getRevalidationSecret } from '@/lib/commerce/config';
import { TAGS } from '@/lib/shopify/client';
import { handleFromPayload, verifyWebhook } from '@/lib/shopify/webhooks';

/**
 * On-demand cache invalidation, driven by Shopify webhooks so catalogue changes
 * appear without a redeploy.
 *
 * Authenticated by Shopify's own HMAC signature over the raw body — see
 * lib/shopify/webhooks.ts. An operator can also purge manually with the shared
 * secret. Both paths compare in constant time.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** `expire: 0` purges now rather than waiting out a cacheLife profile. */
const IMMEDIATE = { expire: 0 };

export async function POST(request: Request) {
  // The signature covers the raw bytes, so read text before parsing.
  const rawBody = await request.text();

  const verification = verifyWebhook(request, rawBody, getRevalidationSecret());
  if (!verification.ok) {
    return NextResponse.json({ message: verification.message }, { status: verification.status });
  }

  let payload: unknown = null;
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }
  }

  const handle = handleFromPayload(verification.topic, payload);

  revalidateTag(TAGS.products, IMMEDIATE);
  revalidateTag(TAGS.collections, IMMEDIATE);
  if (handle) {
    revalidateTag(TAGS.product(handle), IMMEDIATE);
    revalidateTag(TAGS.collection(handle), IMMEDIATE);
  }

  return NextResponse.json({
    revalidated: true,
    topic: verification.topic,
    handle,
  });
}
