# Integrations

Two things the storefront needs from outside Shopify. Both are built, and both fail honestly until
they are configured — no form shows "obrigada!" for a message nobody received.

---

## 1. Enquiry delivery

Powers three forms:

| Form | Type | Fields |
| --- | --- | --- |
| `/contacto` | `contacto` | nome, email, assunto, mensagem |
| Footer | `newsletter` | email |

### Configure

```bash
OPHELIA_ENQUIRY_WEBHOOK_URL="https://…"
OPHELIA_ENQUIRY_WEBHOOK_SECRET="a-long-random-string"   # optional
```

`POST /api/enquiry` validates the submission, then forwards it as JSON:

```json
{
  "type": "evento",
  "submittedAt": "2026-09-04T09:00:00.000Z",
  "values": { "nome": "…", "email": "…", "mensagem": "…" }
}
```

The secret, if set, is sent as an `X-Ophelia-Signature` header. Verify it at the receiving end.

### What to point it at

Any endpoint that accepts a JSON POST works. In rough order of effort:

1. **Zapier / Make webhook** → email to `info@callmeophelia.com` or a row in a sheet. No code.
2. **Resend, Postmark or SendGrid**, behind a small serverless function that formats the email.
3. **Shopify Flow** with a webhook trigger, if the enquiries should live beside orders.

### Behaviour when unset

The route answers `503` with:

> O envio de formulários ainda não está ligado. Escreve-nos para info@callmeophelia.com e
> respondemos no próprio dia.

The form shows that message in its error state and the visitor still has a working way to reach the
business. This is deliberate: a form that silently discards a wedding enquiry is worse than no form.

### Validation and abuse

- Required fields, email shape and the 10-unit minimum are checked in the browser for immediate
  feedback **and again on the server**, which is the authority.
- A hidden honeypot field (`website`) absorbs naive bots; a filled one returns `202` and forwards
  nothing.
- A best-effort throttle allows 5 submissions per IP per minute. **It is in-memory**, so it only
  protects a single serverless instance. For real protection put a durable store behind it — Vercel
  KV or Upstash Redis — in `app/api/enquiry/route.ts`, or a WAF rate-limit rule in front of it.

---

## 2. Sticker upload (Personalizadas)

The design calls for customers to send an image, drawing or logo for the personalised cookie
sticker, with a preview and an approval step (`design-handoff/README.md` → Known gaps, item 3).

**Not implemented, and not faked.** The page describes the real process — describe the idea in the
form, then send the file by email — and says plainly that direct upload arrives when the storage
service is connected.

To build it:

1. Add a storage provider (Vercel Blob, S3 + presigned PUT, Cloudinary). The browser must never
   hold a long-lived credential — issue a short-lived, single-use upload URL from a route handler.
2. Restrict by MIME type and size server-side (`image/png`, `image/jpeg`, `image/svg+xml`, `application/pdf`;
   10 MB is a sensible ceiling). Treat SVG as untrusted — sanitise or rasterise it before display.
3. Add the resulting URL to the enquiry payload, add the field to `ENQUIRY_FIELDS.contacto` in
   `lib/forms/enquiry.ts`, and render it in `components/forms/EnquiryForm.tsx`.
4. The approval step ("Aprovas a prova final") is a human loop today. If it should become a screen,
   it needs a design pass first.

---

## 3. Cache revalidation

`POST /api/revalidate` purges the product and collection cache tags. Wire it to Shopify webhooks —
see [SHOPIFY.md](SHOPIFY.md) §6. Without it, catalogue changes appear within 15 minutes rather than
immediately.

---

## 4. Analytics and consent

Neither is installed. The client's cookie policy describes a consent banner
("pode aceitar, recusar ou personalizar o uso de cookies através do banner de consentimento"), so
**a consent mechanism is a legal commitment already made in the published policy** and should be
added before launch. Whatever is chosen must:

- Load no non-essential script before consent.
- Let the visitor change their choice later, as the policy promises.
- Keep working with JavaScript-dependent scripts absent — nothing on this site requires them.

Shopify's own analytics covers checkout and orders without any script here.
