# Ophelia — storefront

A production Next.js storefront for **Ophelia**, a bakery, brunch spot and grocer in Estoril
(trading since 2019), built from the Claude Design handoff preserved in
[`design-handoff/`](design-handoff/) and running on **Shopify** as the commerce source of truth.

> pastelaria · brunch · mercearia

---

## What this is

- **Next.js 16 App Router**, React 19, TypeScript in strict mode.
- **Server components by default.** Client components only where an interaction needs one: the
  cart, the header menu and search sheet, the buy panel, the gallery, the forms.
- **Shopify Storefront API** behind a typed service layer. No GraphQL in a component, anywhere.
- **Shopify checkout.** Payment is never collected in this application.
- **CSS Modules** over a token layer ported from the handoff's own token tables. No UI framework —
  the design is bespoke and a framework would change what it looks like.

Two sources of truth, kept apart on purpose:

| | Owner | Where it lives |
| --- | --- | --- |
| Products, prices, variants, stock, collections, cart, checkout | **Shopify** | `lib/shopify/`, behind `lib/commerce/` |
| Copy, editorial photography, the diary, theme numbers | **The client** | `content/*.json`, typed in `lib/content/` |

Nothing invented sits in either. Where the business has not supplied something, the gap is visible
in the UI and listed in [Known gaps](#known-gaps) rather than filled in.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the Shopify values
npm run shopify:doctor         # checks the integration end to end
npm run dev
```

Open <http://localhost:3000>.

To review the design without Shopify credentials, set `OPHELIA_FORCE_LOCAL_CATALOGUE=true` — see
[Commerce](#commerce).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser, responsive and accessibility suite (Playwright) |
| `npm run check` | Typecheck + lint + unit tests |
| `npm run shopify:doctor` | Diagnose the Shopify integration. Never prints the token. |

---

## Commerce

Everything the storefront knows about commerce goes through one entry point:

```ts
import { catalogue, cartSource } from '@/lib/commerce';

await catalogue().getProduct(handle);
await catalogue().getCollectionProducts(handle, { first: 24, cursor });
await catalogue().searchProducts(term);
await catalogue().getProductRecommendations(product);
await cartSource().addLines(cartId, lines);
```

Underneath sit two adapters producing identical domain types:

```
lib/commerce/          types, config, the entry point
  index.ts             catalogue() / cartSource()
  config.ts            the environment contract — read here and nowhere else
  types.ts             Product, ProductVariant, Collection, Cart, CartLine…
lib/shopify/           the real backend
  client.ts            the single place a Storefront request is made
  queries.ts           product, collection, search, recommendations, cart
  mutations.ts         cart create / add / update / remove
  transform.ts         GraphQL shapes → domain types
  adapter.ts           CatalogueSource + CartSource over Shopify
lib/catalogue/         the development fixture (not a fallback — see below)
```

No component has ever seen a GraphQL response.

### The fixture is not a fallback

`OPHELIA_FORCE_LOCAL_CATALOGUE=true` serves a typed fixture generated from the handoff's own
catalogue — 27 products across five collections — so the design can be reviewed and the browser
suite can run without credentials.

It is **not** a production fallback, and nothing falls back to it automatically:

- Reaching it requires the flag. If Shopify is misconfigured, pages fail with a configuration error
  rather than quietly serving fixture data that looks like a working shop.
- It has no cart and no checkout. A cart that cannot become an order is exactly the pretend commerce
  this project refuses to ship, so its cart operations fail loudly.
- It refuses to run on a production deployment (`VERCEL_ENV=production` throws).
- Every page says so, on every request, while it is on.

### Editorial content

Copy, editorial photography, the diary and the theme numbers live in `content/*.json`, described by
`lib/content/types.ts`. The storefront only reads them, so that module is the contract for the
editor tool that will write them. Products and prices are never in this layer.

---

## Testing

```bash
npm run check        # typecheck, lint, 81 unit tests
npm run test:e2e     # builds, boots, then runs 347 browser assertions
```

**Unit tests** (`tests/unit/`, Vitest) cover the rules the handoff states exactly: Portuguese money
formatting, variant and option resolution against real Shopify option names, fixture integrity,
enquiry validation, SEO metadata and structured data, and webhook signature verification.

**Browser tests** (`tests/e2e/`, Playwright) run against a production build on the fixture, so they
need no Shopify credentials:

| Spec | Covers |
| --- | --- |
| `responsive.spec.ts` | Every route at 375/390/430/768/1024/1280/1440/1920 — no horizontal scroll, nothing out of bounds, 44px phone tap targets |
| `navigation.spec.ts` | Status codes, real 404s, no dead links, every internal link resolves, redirects, sitemap and robots |
| `seo.spec.ts` | Unique titles and descriptions, canonicals unaffected by query strings, one h1 and an ordered heading tree, JSON-LD matching the page |
| `cart.spec.ts` | Variant resolution, quantity bounds, drawer, persistence, checkout hand-off — **needs a real store**, see below |
| `forms.spec.ts` | Labels, validation, error announcement, server and network failure, honest 503 |
| `a11y.spec.ts` | axe (WCAG 2.1 A/AA) on every route plus the drawer, menu and search sheet, focus trap, Escape, scroll lock, reduced motion |

The suite runs a desktop (1440) and a phone (390) project.

The cart suite is skipped by default because the fixture has no cart. Against a real store:

```bash
E2E_COMMERCE=shopify E2E_PRODUCT_HANDLE=<handle> npx playwright test cart
```

---

## Repository layout

```
app/                    Routes, metadata, sitemap, robots, API handlers
components/
  blog/                 Diary card
  cart/                 Cart provider, drawer, line, checkout button
  forms/                Accessible enquiry form
  layout/               Header, mobile menu, search sheet, footer, announcement
  product/              Product card, gallery, buying panel, filters
  seo/                  JSON-LD renderer
  ui/                   Button, type, taped photo, deckle filters, breadcrumbs
content/                Client-editable copy, photography and settings
lib/
  cart/                 Cookie handling, cart reads, server actions
  catalogue/            Development fixture (data + adapter)
  commerce/             Domain types, config, adapter selection
  content/              Typed readers for content/
  shopify/              Storefront client, queries, mutations, transform, adapter
  seo/                  Metadata and structured data
scripts/                shopify-doctor.mjs
tests/                  Unit (Vitest) and browser (Playwright) suites
design-handoff/         The design this is built from — reference, not code
```

---

## Routes

| Route | |
| --- | --- |
| `/` | Home |
| `/comprar` | Shop index ("tudo") |
| `/comprar/[colecao]` | A Shopify collection |
| `/produto/[handle]` | Product |
| `/carrinho` | Cart page (the drawer is the primary surface) |
| `/pesquisa` | Server-rendered Shopify search |
| `/quem-somos` | About |
| `/diario`, `/diario/[slug]` | Diary |
| `/contacto` | Contact |
| `/envios-e-devolucoes`, `/termos-e-privacidade` | Client's legal text |

URLs are Portuguese throughout, matching the handoff. `/blog`, `/contact`, `/produtos` and
`/checkout` redirect permanently to their canonical equivalents.

---

## Deviations from the handoff

Three, each deliberate:

1. **The bespoke checkout page is not implemented.** The handoff draws a full checkout — delivery
   vs pickup, a Mon–Thu date picker, MB WAY / Multibanco / card, a promo field — but it is a
   prototype mock with no payment behind it. Building it would mean collecting card details outside
   Shopify's PCI scope or showing a fake confirmation. Checkout is Shopify's; the cart drawer's
   design is preserved exactly. See [docs/SHOPIFY.md](docs/SHOPIFY.md#6-checkout).
2. **Category filtering is real URLs, not client state.** The prototype filtered an array in place.
   Each pill is a Shopify collection at its own URL, so categories are shareable, indexable and
   server-rendered. The interaction still feels instant through client-side navigation.
3. **A mobile navigation exists.** The handoff has none and explicitly asks production to add one.

Everything else — colours, type, spacing, the four tape types, the deckle filters, the copy — is
the handoff's.

---

## Known gaps

Carried from the handoff's own "Open items", still true:

- **Contact details are unconfirmed.** The address is `Estoril, Cascais (morada completa a
  confirmar)`; the hours and the absence of a phone number are placeholders. `content/contacto.json`.
- **The three reviews and all six diary articles are written copy**, not client-authored.
- **Cookie photography is reused** across several SKUs — there are two studio shots for six cookie
  products. Flagged and accepted by the client.
- **The Christmas panetone** needs seasonal availability logic.
- **The contact form needs a delivery endpoint.** Without `OPHELIA_ENQUIRY_WEBHOOK_URL` it returns
  an honest 503 and tells the visitor to email instead — it never fakes a success.

---

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In short: GitHub → Vercel, with the environment
variables from [`.env.example`](.env.example) set in the Vercel project. Never commit `.env.local`.
