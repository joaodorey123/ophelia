import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';

import { getEnquiryConfig } from '@/lib/commerce/config';
import {
  isEnquiryType,
  isHoneypotTripped,
  validateEnquiry,
} from '@/lib/forms/enquiry';
import { SITE } from '@/lib/site';

/**
 * Enquiry delivery for the Eventos and Personalizadas forms, and the newsletter.
 *
 * There is deliberately no fallback that silently swallows a submission: when
 * OPHELIA_ENQUIRY_WEBHOOK_URL is unset this route answers 503 and the forms tell
 * the visitor to email us instead. A form that shows "obrigada!" for a message
 * nobody received is worse than no form at all.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Best-effort abuse throttle. In-memory, so it only protects one serverless
 * instance — see docs/INTEGRATIONS.md for the durable-store upgrade.
 */
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function throttled(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Pedido inválido.' }, { status: 400 });
  }

  const type = payload.type;
  if (!isEnquiryType(type)) {
    return NextResponse.json({ message: 'Tipo de pedido desconhecido.' }, { status: 400 });
  }

  // A hidden field only a bot fills in. Accept and discard, so it learns nothing.
  if (isHoneypotTripped(payload)) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (throttled(`${ip}:${type}`)) {
    return NextResponse.json(
      { message: 'Recebemos vários pedidos seguidos. Tenta daqui a um minuto.' },
      { status: 429 },
    );
  }

  const { values, errors } = validateEnquiry(type, payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: 'Verifica os campos assinalados.', errors }, { status: 422 });
  }

  const config = getEnquiryConfig();
  if (!config) {
    // Honest failure: nothing was recorded, so say so and give a way through.
    return NextResponse.json(
      {
        message: `O envio de formulários ainda não está ligado. Escreve-nos para ${SITE.email} e respondemos no próprio dia.`,
      },
      { status: 503 },
    );
  }

  const body = JSON.stringify({ type, submittedAt: new Date().toISOString(), values });

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.secret
          ? {
              // HMAC over the body, so the receiver can prove it came from us
              // and that nothing was altered in transit.
              'X-Ophelia-Signature': `sha256=${createHmac('sha256', config.secret)
                .update(body, 'utf8')
                .digest('hex')}`,
            }
          : {}),
      },
      body,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: `Não conseguimos enviar o teu pedido. Escreve-nos para ${SITE.email}.` },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { message: `Não conseguimos enviar o teu pedido. Escreve-nos para ${SITE.email}.` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, message: 'Recebemos o teu pedido. Respondemos em breve.' });
}
