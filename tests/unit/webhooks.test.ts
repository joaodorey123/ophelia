import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { handleFromPayload, verifyWebhook } from '@/lib/shopify/webhooks';

const SECRET = 'a-long-random-webhook-secret';

function shopifyRequest(body: string, secret = SECRET, extra: Record<string, string> = {}) {
  const hmac = createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  return new Request('https://example.com/api/revalidate', {
    method: 'POST',
    headers: {
      'x-shopify-hmac-sha256': hmac,
      'x-shopify-topic': 'products/update',
      'x-shopify-shop-domain': 'ophelia.myshopify.com',
      ...extra,
    },
    body,
  });
}

describe('verifyWebhook', () => {
  const body = JSON.stringify({ handle: 'ophelia-cookies' });

  it('accepts a correctly signed Shopify webhook', () => {
    const result = verifyWebhook(shopifyRequest(body), body, SECRET);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.topic).toBe('products/update');
      expect(result.shopDomain).toBe('ophelia.myshopify.com');
    }
  });

  it('rejects a webhook signed with the wrong secret', () => {
    const result = verifyWebhook(shopifyRequest(body, 'wrong-secret'), body, SECRET);
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it('rejects a webhook whose body was tampered with after signing', () => {
    const request = shopifyRequest(body);
    const tampered = JSON.stringify({ handle: 'attacker-controlled' });
    expect(verifyWebhook(request, tampered, SECRET)).toMatchObject({ ok: false, status: 401 });
  });

  it('rejects a signature of the wrong length without throwing', () => {
    const request = new Request('https://example.com/api/revalidate', {
      method: 'POST',
      headers: { 'x-shopify-hmac-sha256': 'short' },
      body,
    });
    expect(verifyWebhook(request, body, SECRET)).toMatchObject({ ok: false, status: 401 });
  });

  it('rejects an unsigned request', () => {
    const request = new Request('https://example.com/api/revalidate', { method: 'POST', body });
    expect(verifyWebhook(request, body, SECRET)).toMatchObject({ ok: false, status: 401 });
  });

  it('accepts a manual purge presenting the shared secret', () => {
    const request = new Request('https://example.com/api/revalidate', {
      method: 'POST',
      headers: { 'x-ophelia-revalidate-secret': SECRET },
      body: '',
    });
    expect(verifyWebhook(request, '', SECRET).ok).toBe(true);
  });

  it('rejects a manual purge with the wrong secret', () => {
    const request = new Request('https://example.com/api/revalidate', {
      method: 'POST',
      headers: { 'x-ophelia-revalidate-secret': 'nope' },
      body: '',
    });
    expect(verifyWebhook(request, '', SECRET)).toMatchObject({ ok: false, status: 401 });
  });

  it('reports 503 rather than 401 when no secret is configured', () => {
    expect(verifyWebhook(shopifyRequest(body), body, undefined)).toMatchObject({
      ok: false,
      status: 503,
    });
  });

  it('does not accept an empty configured secret', () => {
    expect(verifyWebhook(shopifyRequest(body), body, '')).toMatchObject({ ok: false, status: 503 });
  });
});

describe('handleFromPayload', () => {
  it('reads the handle from a product or collection payload', () => {
    expect(handleFromPayload('products/update', { handle: 'granola-da-ophelia' })).toBe(
      'granola-da-ophelia',
    );
  });

  it('returns null when the payload carries no handle', () => {
    expect(handleFromPayload('products/delete', { id: 123 })).toBeNull();
    expect(handleFromPayload('products/update', null)).toBeNull();
    expect(handleFromPayload('products/update', 'nope')).toBeNull();
    expect(handleFromPayload('products/update', { handle: '' })).toBeNull();
  });
});
