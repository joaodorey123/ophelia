# Shopify setup

Everything the storefront actually needs, and nothing it does not. Where a value is a decision
rather than a requirement, it says so.

Run `npm run shopify:doctor` after any change here. It checks the whole chain — domain, token,
API version, collections, publishing, cart — and never prints the token.

---

## 1. The Headless sales channel

Install **Headless** from the Shopify App Store (Shopify's own app). It is the right channel for a
custom Next.js storefront: it issues the Storefront API tokens and it controls which products the
API can see.

The alternatives are worse fits — the **Hydrogen** channel only makes sense if you deploy Hydrogen
on Oxygen, and a hand-rolled custom app gives the same API with more setup and no publishing UI.

Once installed: **Settings → Apps and sales channels → Headless → Storefront API**.

Two tokens are issued:

| Token | Header | Use |
| --- | --- | --- |
| **Private** | `Shopify-Storefront-Private-Token` | **Preferred.** Higher rate limits, server-only. |
| Public | `X-Shopify-Storefront-Access-Token` | Fine, but rate-limited per IP. |

Every request this storefront makes is server-side, so use the private token. Set one of:

```bash
SHOPIFY_STOREFRONT_PRIVATE_TOKEN="…"   # preferred
SHOPIFY_STOREFRONT_ACCESS_TOKEN="…"    # fallback
```

When both are present the private one wins. Neither ever gains a `NEXT_PUBLIC_` prefix, and neither
reaches the browser.

### Scopes

The Headless channel's defaults are enough. What the storefront actually reads:

- `unauthenticated_read_product_listings` — products and collections
- `unauthenticated_read_product_tags` — the tag chip on shop cards
- `unauthenticated_write_checkouts` / `unauthenticated_read_checkouts` — the Cart API

**Not** `unauthenticated_read_product_inventory`. The storefront never shows a stock count —
`availableForSale` decides whether a variant can be bought — so `quantityAvailable` is deliberately
not queried. Asking for a field the token cannot read fails the *entire* request, which is exactly
how a working integration ends up rendering an error page.

---

## 2. API version

```bash
SHOPIFY_STOREFRONT_API_VERSION="2026-07"
```

Read this twice, because it is the failure that hides best:

**Shopify does not reject an unsupported version.** It silently serves an older one and mentions it
only in the `x-shopify-api-version` response header. A storefront can run for months on year-old
fields and nobody notices until a field is removed.

Two guards are in place:

- `lib/shopify/client.ts` compares the served version against the requested one and logs a warning
  once per process when they differ.
- `npm run shopify:doctor` fails on a mismatch.

Bump the version deliberately, then run `npm run build` and the doctor.

---

## 3. Publishing — the thing that looks like a bug and is not

A product can exist in Shopify, be **Active**, and still be invisible to this storefront. The
Storefront API only returns what is published to the channel the token belongs to.

For every product and every collection: open it in admin → **Publishing** → tick **Headless**.

When products are missing, work down this list before touching code:

1. Does the product exist in Shopify admin?
2. Is its status **Active** (not Draft or Archived)?
3. Is it published to the **Headless** channel?
4. Does the Headless storefront have the Storefront API scopes above?
5. Does the handle match the URL you are visiting?
6. Does `npm run shopify:doctor -- <handle>` resolve it?

`npm run shopify:doctor` answers 1–4 and 6 in one run. Never solve a missing product by putting it
in the front end.

---

## 4. Collections

The storefront reads its categories from Shopify. Nothing is hard-coded: the header, the footer's
"a loja" column, the home page band and the filter pills are all built from
`catalogue().getCollections()`, so a collection that does not exist can never produce a dead link —
and a collection you add appears everywhere without a deploy.

The design draws six cards. Five map to collections; "ver tudo" is the shop index. Create these
handles to light the band up:

| Handle | Title in the design |
| --- | --- |
| `cookies` | cookies |
| `mercearia` | mercearia |
| `cafe` | café, chai & matcha |
| `bolos` | bolos |
| `casa` | casa & presentes |

Editorial artwork for each card lives in `content/home.json` (`collections.cards`), keyed by handle.
A card whose collection is not published is not rendered; if none are, the whole band is omitted
rather than shown with a single stretched card.

**With no collections published, every `/comprar/<handle>` is a genuine 404 and the home page has no
categories.** That is the correct behaviour, not a bug — but it is also the most common reason a
fresh store looks broken.

---

## 5. Products, variants and the design

The design's per-product "size" picker is simply **Shopify variants**. Nothing is special-cased:
the buy panel renders one selector per Shopify option, labelled with the merchant's own option
name, and resolves the selection to a real variant.

| The design calls it | In Shopify it is |
| --- | --- |
| `escolhe as cookies` / `tamanho` / `serve` | The product's first option (`Quantidade`, `Tamanho`, …) |
| The tag chip on a shop card | The product's first tag, or the `ophelia.badge` metafield |
| `ingredientes` accordion | The `ophelia.ingredients` metafield |
| `desde 7,80 €` | A price range where min ≠ max |
| Suggested products | `productRecommendations(intent: RELATED)` |

Products with several options work: a combination Shopify does not sell renders inert rather than
silently falling back to another variant.

### The handwritten-card add-on

The "Juntar um cartão personalizado · 4,00 €" checkbox adds a **real Shopify line**, so Shopify can
actually charge for it. Create a product with the handle `cartao-personalizado`, one variant, priced
€4.00, published to Headless. The customer's message is attached to that line as the cart attribute
`Mensagem do cartão`, so it appears on the order in admin.

If that product is not published, the add-on is hidden. There is deliberately no fallback: a
checkbox that adds nothing to the order is worse than no checkbox.

The handle is configurable in `content/site.json` (`product.giftCardHandle`).

---

## 6. Checkout

Checkout is Shopify's, always. The storefront creates a cart through the Cart API, stores the cart
id in an httpOnly cookie, and sends the customer to the `checkoutUrl` Shopify returns. No payment
detail is ever collected here.

The design includes a bespoke checkout page — delivery vs pickup, a Mon–Thu date picker, MB WAY /
Multibanco / card, a promo field. **It is not implemented, deliberately.** It is a prototype mock
with no payment behind it, and reproducing it would mean either collecting card details outside
Shopify's PCI scope or showing a fake order confirmation. The cart drawer's design is preserved
exactly; `finalizar encomenda` hands off to Shopify. `/checkout` redirects to `/carrinho`.

What this means for the shop settings, since Shopify now owns these:

- **Free shipping over €60** is displayed by the cart drawer from `content/site.json`
  (`shipping.freeShippingFrom`). It is a *promise*: configure the matching shipping rate in
  Shopify → Settings → Shipping and delivery, or the customer will be charged at checkout for
  something the cart said was free.
- Mon–Thu dispatch, gift messages and delivery dates belong in Shopify's checkout settings or an
  order-notes app.

### Before launch

Remove the store password (**Settings → Preferences → Password protection**). While it is on,
`checkoutUrl` lands the customer on Shopify's password page instead of checkout. The doctor warns
about this.

---

## 7. Keeping the cache fresh

Catalogue reads are cached for 15 minutes and tagged, so a webhook can invalidate precisely.

```bash
OPHELIA_REVALIDATION_SECRET="…"   # Shopify's webhook signing secret
```

In Shopify admin → **Settings → Notifications → Webhooks**, add these pointing at
`https://<your-domain>/api/revalidate`:

- `products/create`, `products/update`, `products/delete`
- `collections/create`, `collections/update`, `collections/delete`

The route verifies Shopify's `X-Shopify-Hmac-Sha256` signature before purging anything. The same
secret also authorises a manual purge:

```bash
curl -X POST https://<your-domain>/api/revalidate \
  -H "X-Ophelia-Revalidate-Secret: $OPHELIA_REVALIDATION_SECRET"
```

---

## 8. When something is wrong

```bash
npm run shopify:doctor              # the whole chain
npm run shopify:doctor -- <handle>  # …plus one product
```

It reports, in order: domain, token (kind and length only — never the value), reachability,
currency, the API version actually served, collections, products published to Headless, the handle
you asked about, and whether the Cart API issues a checkout URL.

There is no fallback catalogue in production. If Shopify is misconfigured the pages fail with a
configuration error rather than quietly serving fixture data that looks like a working shop — which
is the failure mode that hides a broken integration until launch day.
