# Ophelia — storefront

A production Next.js storefront for **Ophelia**, a Portuguese family food, dessert and gifting
brand (Guarda → Estoril), built from the Claude Design handoff preserved in
[`design-handoff/`](design-handoff/) and architected to run on **Shopify** as the commerce source
of truth.

> As melhores memórias constroem-se à volta de uma mesa.

---

## What this is

- **Next.js 16 App Router**, React 19, TypeScript in strict mode.
- **Server components by default.** Client components only where an interaction needs one: the
  cart, the mobile menu, product option selection, the forms and the search field.
- **Shopify Storefront API** behind a typed service layer. No GraphQL in a component, anywhere.
- **Shopify checkout.** Payment is never collected in this application.
- **CSS Modules** over a token layer ported verbatim from the handoff. No UI framework — the design
  is bespoke and a framework would change what it looks like.

Everything visible is either the approved design or the client's own copy. Where the business has
not supplied something — product photography, a form endpoint, the apron's price — the gap is
visible in the UI and listed in [Known gaps](#known-gaps) rather than filled in with an invention.

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

With no Shopify credentials the storefront runs on the **local development catalogue** (see
[Commerce](#commerce)) and says so in a banner on every page. Everything works except checkout,
which is disabled with an explanation rather than simulated.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end, responsive and accessibility suite (Playwright) |
| `npm run check` | Typecheck + lint + unit tests |

---

## Testing

```bash
npm run check        # typecheck, lint, 99 unit tests
npm run test:e2e     # builds, boots, then runs the browser suite
```

**Unit tests** (`tests/unit/`, Vitest) cover the rules the handoff states exactly: Portuguese money
formatting, variant and option resolution, catalogue data integrity, every cart rule, enquiry
validation, SEO metadata and structured data, and Shopify webhook signature verification.

**Browser tests** (`tests/e2e/`, Playwright) run against a production build on the local catalogue,
so they need no Shopify credentials:

| Spec | Covers |
| --- | --- |
| `responsive.spec.ts` | Every route at 375/390/430/768/1024/1280/1440/1920 — no horizontal scroll, no element out of bounds, 44px phone tap targets |
| `navigation.spec.ts` | Status codes, real 404s, no placeholder links, every internal link resolves, sitemap and robots |
| `seo.spec.ts` | Unique titles and descriptions, canonicals, robots directives, one h1 and an ordered heading tree per page, JSON-LD matching the page |
| `cart.spec.ts` | Variant selection, quantity bounds, gift card and message, line merging, rapid stepping, persistence, checkout handoff |
| `forms.spec.ts` | Labels, validation, error announcement, loading, server and network failure, honest 503 |
| `a11y.spec.ts` | axe (WCAG 2.1 A/AA) on every route plus the open drawer and menu, focus trap, Escape, scroll lock, reduced motion |

The suite runs both a desktop (1440) and a phone (390) project, since the handoff designs those two
states.

---

## Repository layout

```
app/                    Routes, metadata, sitemap, robots, API handlers
components/
  cart/                 Cart provider, drawer, line item, checkout button
  forms/                Accessible enquiry form
  layout/               Header, mobile menu, footer, announcement, notices
  product/              Product cards, gallery, buying panel
  seo/                  JSON-LD renderer
  ui/                   Button, type, image slot, breadcrumbs, watercolour
lib/
  cart/                 Cookie handling, cart reads, server actions
  catalogue/            Local development catalogue (data + adapter)
  commerce/             Domain types, config, adapter selection, cross-sell
  content/              Client-supplied copy (story, shipping)
  customer/             Shopify Customer Account API (OAuth, session, reads)
  seo/                  Metadata factory, structured data
  shopify/              Storefront API client, fragments, queries, transforms
  format.ts             Portuguese money formatting
  navigation.ts         Route map and nav configuration
  product.ts            Variant and option helpers
styles/                 Design tokens, shared section scaffolding
tests/                  Unit tests, browser suite, shared fixtures
public/brand/           Brand artwork (web copies) and generated icons
design-handoff/         The original Claude Design handoff, unmodified
docs/                   Shopify setup, integrations, design decisions
```

---

## Routes

| Route | Screen |
| --- | --- |
| `/` | Homepage — six designed sections, in the handoff's fixed order |
| `/comprar/[colecao]` | Collection. `cookies`, `mercearia`, `presentes`, `lifestyle` |
| `/produto/[handle]` | Product page |
| `/quem-somos` | The Ophelia story |
| `/eventos` | Events positioning + enquiry form |
| `/personalizadas` | Custom cookies + enquiry form |
| `/carrinho` | Full cart page |
| `/pesquisa` | Search |
| `/conta`, `/conta/encomendas` | Customer account (Shopify-authenticated) |
| `/conta/entrar`, `/conta/callback`, `/conta/sair` | OAuth handlers |
| `/envios-e-devolucoes`, `/termos-e-privacidade` | Client legal copy |
| `/sitemap.xml`, `/robots.txt` | Generated |
| `/api/enquiry`, `/api/revalidate` | Form delivery, Shopify webhook target |

Collection and product URL shapes follow the handoff's own routing table
(`design-handoff/README.md` → Routing), not a generic convention.

---

## Commerce

Two adapters implement one interface (`lib/commerce/types.ts`):

| Adapter | When | Checkout |
| --- | --- | --- |
| `lib/shopify/adapter.ts` | `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_ACCESS_TOKEN` set | Shopify hosted checkout |
| `lib/catalogue/adapter.ts` | Otherwise, or with `OPHELIA_FORCE_LOCAL_CATALOGUE=true` | **Disabled**, with an explanation |

Pages call `catalogue()` and `cartSource()` from `lib/commerce`; they never import an adapter.
Switching to a real store is entirely a matter of environment variables — see
[docs/SHOPIFY.md](docs/SHOPIFY.md).

**The local catalogue is development data, not production data.** It is built from the client's own
"Ophelia — PRODUTOS SITE" document and the handoff's price table, it is isolated to
`lib/catalogue/`, and the storefront labels itself while using it.

### Cart

Shopify's Cart API, with the cart id in an httpOnly cookie. Mutations run through server actions in
`lib/cart/actions.ts` and are serialised client-side so rapid quantity changes cannot race. The
handoff's cart rules are implemented as specified: line identity is merchandise + gift message,
stepping below 1 removes the line, the ceiling is 99, the personalised card is its own €4 line with
the message also attached to the cookie line, and Total equals Subtotal until real shipping rates
exist.

---

## SEO

- Per-page `generateMetadata` through one factory (`lib/seo/metadata.ts`): title, description,
  canonical, Open Graph, Twitter, robots.
- JSON-LD for Organization, WebSite, BreadcrumbList, Product + Offer and ItemList. There are
  deliberately **no ratings or reviews** — Ophelia has not supplied any, and inventing them would
  be both dishonest and a policy breach.
- Dynamic `sitemap.xml` covering pages, collections and products; cart, search and account are
  excluded and carry `noindex`.
- `robots.txt` allows the public site and disallows transactional routes. Preview deployments
  disallow everything so a staging URL never competes with production.
- Sorted collection views use `rel="nofollow"` links and canonicalise back to the unsorted URL, so
  a collection has exactly one indexable address.
- Product information is server-rendered, and every important destination is a real `<a href>`.

---

## Accessibility

- Semantic landmarks, one `h1` per page, ordered headings.
- Skip link, visible `:focus-visible` rings (recoloured on blue grounds).
- The cart drawer is a real dialog: focus moves in, is trapped, Escape and the scrim close it, body
  scroll is locked, and focus returns to the control that opened it.
- Forms have labels, `aria-invalid`, `aria-describedby` error text, an announced status region, and
  focus moves to the first invalid field.
- Live regions announce cart additions and quantity changes.
- 44px minimum hit targets on phone.
- `prefers-reduced-motion` disables the hero fade, drawer slide and toast — which the prototype
  asked for but did not implement.

---

## Performance

- Server components by default; client JavaScript is limited to the interactive parts.
- Catalogue reads are cached with tags and revalidated on a 15-minute window, or immediately via
  `POST /api/revalidate` from a Shopify webhook. Cart and customer reads are `no-store` and are
  never shared between visitors.
- `next/font` self-hosts Caprasimo and Figtree, so there is no render-blocking font request.
- `next/image` with explicit `sizes` per layout; hero and first-row cards are `priority`.
- Brand artwork in `public/brand/` is the web copy — resized and quantized from the originals,
  which remain untouched in `design-handoff/assets/`.

Pages render on demand rather than statically, because the layout reads the cart cookie. The
underlying Shopify data is cached, so a request assembles cached data rather than refetching it.

---

## Known gaps

These need the business, not the code.

1. **All product photography.** Every image is an unfilled slot that keeps its designed dimensions,
   radius and crop, and shows the intended shot as a caption. Shopify product images appear
   automatically once uploaded. The brief is in `design-handoff/README.md` → Assets.
2. **Shopify store.** Not yet connected — see [docs/SHOPIFY.md](docs/SHOPIFY.md).
3. **Form delivery.** `OPHELIA_ENQUIRY_WEBHOOK_URL` is unset, so the Eventos, Personalizadas and
   newsletter forms return an honest failure and point at `info@callmeophelia.com`. See
   [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).
4. **Sticker upload** for Personalizadas. The flow is described in the UI; the storage integration
   is specified in `docs/INTEGRATIONS.md` and not pretended to work.
5. **Avental da Ophelia** is listed in both the handoff and the client's document with its price
   marked TBC, so it is not in the catalogue. Add it in Shopify once priced.
6. **Undesigned screens.** `/carrinho`, `/pesquisa`, `/eventos`, `/personalizadas` and the account
   area were not in the handoff. They are built in the approved visual language and should get a
   design pass. See [docs/DESIGN-NOTES.md](docs/DESIGN-NOTES.md).

---

## Deployment

[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) covers GitHub and Vercel. In short: no secrets are
committed, `.env.example` documents every variable, the production build passes, and there are no
filesystem or localhost assumptions.

---

## Documentation

| Document | Contents |
| --- | --- |
| [docs/SHOPIFY.md](docs/SHOPIFY.md) | Store setup, products, options, metafields, collections, webhooks, customer accounts |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | Form delivery, file upload, rate limiting |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub and Vercel |
| [docs/DESIGN-NOTES.md](docs/DESIGN-NOTES.md) | Where the implementation departs from the prototype, and why |
| [design-handoff/README.md](design-handoff/README.md) | The original design contract — unmodified |
