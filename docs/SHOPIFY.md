# Shopify setup

Everything the storefront actually needs, and nothing it does not. Where a value is a decision
rather than a requirement, it says so.

---

## 1. Storefront API credentials

Shopify admin → **Settings → Apps and sales channels → Develop apps → Create an app**.

Under **Configuration → Storefront API**, grant:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_product_tags`
- `unauthenticated_read_collection_listings`
- `unauthenticated_write_checkouts` and `unauthenticated_read_checkouts` (the Cart API)

Install the app, then copy the **Storefront API access token**.

```bash
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"   # the myshopify domain, not the custom one
SHOPIFY_STOREFRONT_ACCESS_TOKEN="…"
SHOPIFY_STOREFRONT_API_VERSION="2025-07"
```

The token is read on the server only. It never gains a `NEXT_PUBLIC_` prefix and never reaches the
browser.

---

## 2. Product options

The product page reads two options by name. Spelling and casing matter.

| Option | Products | Values |
| --- | --- | --- |
| `Sabor` | Ophelia Cookies only | Tradicional, Red Velvet, Cacau, Limão |
| `Tamanho` | Every product | The box size or weight, e.g. `4 unidades`, `300 g`, `250 g · em grão` |

Rules the storefront relies on:

- **Every product needs a `Tamanho` option**, even single-size ones. The design keeps the size grid
  visible for consistency, and a one-card grid is the intended result.
- **Variant order is the merchant's intent.** The first variant is the default shown on pantry and
  cross-sell cards. Café da Ophelia must therefore list `250 g · em grão` (€18) **before**
  `250 g · em pó` (€8) — the design's cross-sell reads "Café €18".
- Option values are shown verbatim. Write them exactly as they should appear on the page.

---

## 3. Editorial metafields

Namespace `ophelia`, all of type **single line text** except `ingredients`
(**multi line text**). All are optional — an unset metafield simply omits its block.

| Key | Type | Used for |
| --- | --- | --- |
| `kicker` | single line text | The uppercase eyebrow above a title, e.g. `Cookies · o clássico` |
| `badge` | single line text | The pill over a card image, e.g. `Novo`, `Personalizável` |
| `short_description` | single line text | The one-line description on category cards |
| `ingredients` | multi line text | The client's ingredient list, verbatim |

Create them under **Settings → Custom data → Products → Add definition**, and tick
**Storefronts** under access so the Storefront API can read them.

The values for the current catalogue are in `lib/catalogue/data.ts`, taken from the client's
"Ophelia — PRODUTOS SITE" document.

---

## 4. Collections

Create these handles. The first four are navigation destinations; the fifth is a merchandising
device and is deliberately excluded from the sitemap.

| Handle | Title | Contents |
| --- | --- | --- |
| `cookies` | As famosas Cookies da Ophelia | The five cookie SKUs |
| `mercearia` | Mercearia da Ophelia | Azeite, méis, doces, granola, café |
| `presentes` | Presentes da Ophelia | The gift-appropriate products |
| `lifestyle` | Lifestyle | Vela aromática, and the avental once priced |
| `complementos` | Fica ainda melhor com… | Café, Granola, Mel de Rosmaninho, Vela |

`complementos` powers both "Fica ainda melhor com…" on the product page and "Ainda falta alguma
coisa?" in the cart drawer. The design fixes this set — *"Escolhido por nós, não por um algoritmo"* —
so it is a curated collection, **not** Shopify's algorithmic product recommendations. Keep it to
four products; the drawer shows at most three, excluding whatever is already in the cart.

Collection **description** text is rendered as the page's lead paragraph, so write it for the page.

---

## 5. Products

| Handle | Sizes and prices |
| --- | --- |
| `ophelia-cookies` | 4 un €17 · 8 un €32 · 12 un €48, in each of four flavours |
| `ophelia-cookiebrownie` | 4 un €20 · 8 un €40 · 12 un €57 |
| `ophelia-cookie-banoffee` | 4 un €20 · 8 un €40 · 12 un €57 — badge `Novo` |
| `pack-especial-de-cookies` | 3 un €18 · 6 un €30 · 9 un €43 |
| `cookies-personalizadas` | 10 un €35 · 25 un €87 · 35 un €122 · 50 un €175 — badge `Personalizável` |
| `granola-da-ophelia` | 300 g €8 · 600 g €14 |
| `cafe-da-ophelia` | 250 g em grão €18 · 250 g em pó €8 |
| `mel-de-rosmaninho`, `mel-de-carvalho` | 300 ml €7,80 |
| `azeite-da-ophelia` | 500 ml €13,90 · 750 ml €19,90 |
| `doce-de-alperce-e-amendoa`, `doce-de-maca-e-vinho-do-porto`, `doce-de-pera-e-gengibre`, `doce-de-morango-com-baunilha` | 225 ml €4,85 |
| `vela-aromatica` | €18 |
| `cartao-personalizado` | €4 |

The handles above are what the storefront links to directly:

- `cartao-personalizado` is required — the product page's "Adicionar cartão personalizado + €4"
  panel adds it as its own line. If the product is absent the panel is omitted entirely rather
  than showing a price nothing can fulfil.
- `cookies-personalizadas` is what `/personalizadas` links to.
- The homepage features `ophelia-cookies`, `ophelia-cookiebrownie`, `ophelia-cookie-banoffee`,
  `granola-da-ophelia`, and in the Mercearia band `azeite-da-ophelia`, `mel-de-rosmaninho`,
  `doce-de-pera-e-gengibre`, `doce-de-maca-e-vinho-do-porto`.

Two catalogue notes to settle with the client:

- **Avental da Ophelia** has no price in either the handoff or the client's document, so it is not
  in the storefront. Price it and add it to `lifestyle`.
- The client's document also lists **Cookies NY** (6/8/12 un at €30/€40/€60) and Chai/Matcha
  entries whose copy and pricing are duplicated from the coffee entry. None of these appear in the
  approved design, so none are implemented. Confirm before adding.

### Product images

Upload to Shopify and they appear automatically — the storefront renders the featured image on
cards and the full gallery on the product page. Until then, every slot keeps its designed
dimensions and shows the intended shot as a caption. Aspect ratios from the handoff: hero ~21:9,
category and favourite cards 3:4, mercearia 4:5, product main and thumbnails 1:1, story rows 4:3.

Write real `alt` text on each image in Shopify; the storefront uses it verbatim.

---

## 6. Webhooks (cache invalidation)

Set a shared secret:

```bash
OPHELIA_REVALIDATION_SECRET="a-long-random-string"
```

Then in **Settings → Notifications → Webhooks**, add JSON webhooks pointing at
`https://<your-domain>/api/revalidate` for:

- `products/create`, `products/update`, `products/delete`
- `collections/create`, `collections/update`, `collections/delete`

Send the secret in an `X-Ophelia-Revalidate-Secret` header, or append `?secret=…` to the URL. The
handler compares it in constant time and purges the product and collection cache tags. Without
this, changes appear within the 15-minute revalidation window instead of immediately.

---

## 7. Customer accounts (optional)

The `/conta` area is inert until these are set; it renders a documented "not configured" state
rather than a fake sign-in.

Shopify admin → **Settings → Customer accounts**. Choose **new customer accounts**, then open
**Customer Account API** and:

1. Copy the **Customer Account API endpoint** and the **Client ID**.
2. Add `https://<your-domain>/conta/callback` as a **callback URI** — it must match
   `SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI` exactly, including scheme and trailing path.
3. Add `https://<your-domain>` as a **logout URI**.

```bash
SHOPIFY_CUSTOMER_ACCOUNT_API_URL="https://shopify.com/<shop-id>/account"
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID="…"
SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI="https://<your-domain>/conta/callback"
```

The flow is OAuth 2.0 with PKCE, as a public client: there is no client secret, the code verifier
never leaves the server, and tokens are held in httpOnly cookies. No password is ever handled by
this application.

---

## 8. Checkout, shipping and payments

Checkout is Shopify's. The cart's `checkoutUrl` is where "Continuar para pagamento" sends the
visitor, and this application collects no payment details.

Configure in Shopify itself:

- **Shipping rates.** The design shows "Envio — Calculado no pagamento" and renders Total equal to
  Subtotal. That is intentional and matches reality until rates exist; once they do, Shopify's
  checkout applies them.
- **Payment methods.** The client's terms name MasterCard, Visa, American Express, Multibanco and
  PayPal.
- **Dispatch rules.** Monday–Thursday, with orders after 12:00 Thursday shipping the following
  Monday. This is copy in the storefront, not logic — if it should gate ordering, that is a Shopify
  configuration or app decision.

---

## 9. Verifying the connection

```bash
npm run build && npm start
```

The terracotta "Pré-visualização" banner disappears once Shopify is connected. If it does not,
either `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is missing, or
`OPHELIA_FORCE_LOCAL_CATALOGUE` is still `true`.
