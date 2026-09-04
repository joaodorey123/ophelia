# Handoff: Ophelia — Premium Ecommerce (Homepage, Cookies, PDP, Quem Somos, Cart)

## Overview

Ophelia is a Portuguese family-run food, dessert, gifting and lifestyle brand (Guarda → Estoril).
This bundle covers the storefront core: an editorial **Homepage**, the **Cookies** category, a fully
configurable **cookie product page**, the editorial **Quem Somos** story page, plus a **cart drawer**
with cross-sell, all in Portuguese (pt-PT). Positioning line: *"As melhores memórias constroem-se à
volta de uma mesa."* — the site must read as a brand world, not a template store.

## About the Design Files

The files in this bundle are **design references created in HTML** — a prototype showing intended
look, copy and behaviour. They are **not production code to copy**. The task is to **recreate these
designs in the target codebase's own environment** (Next.js + a commerce backend, Shopify Hydrogen,
Vue, etc.) using its established patterns, component library, routing and state management. If no
codebase exists yet, choose the appropriate stack (a headless commerce front end is the natural fit)
and implement the designs there.

`Ophelia.dc.html` is a single-file prototype: all four pages, both viewport modes and the cart live
in one component with an internal `page` state. **In production these are real routes** (see Routing).

## Fidelity

**High-fidelity (hifi).** Colours, typography, spacing, radii, copy and interaction states are final
and should be reproduced faithfully. Two deliberate exceptions:

- **Photography is not final.** Every image area is an empty drop slot with a caption describing the
  intended shot (see Assets → Photography brief). Art direction is defined; the images are not.
- **Checkout, search, account, wishlist, Mercearia, Presentes/gift builder and Eventos pages are out
  of scope** in this bundle. Their entry points exist and are specified below as stubs.

---

## Design tokens

Base layer is the project's **Organic** design system (`design-system/styles.css`), re-tinted to the
Ophelia identity. Import the stylesheet (or port these tokens) — do not re-derive values by eye.

### Colour

| Token | Value | Use |
| --- | --- | --- |
| `ophelia-blue` (accent) | `#1B3160` | Primary buttons, headings on cream, nav, badges, prices, selected states |
| `blue-deep` | `#142545` | Button hover, footer ground, toast |
| `blue-press` | `#0E1B33` | Button pressed |
| `cream` (bg) | `#FBF6EE` | Page ground, text on blue |
| `sand` (surface) | `#F1E7D6` | Alternating sections, cards on cream, image placeholders |
| `ink` (text) | `#201E1D` | Body copy, product titles |
| `terracotta` (accent-2) | `#C67139` | Kickers, "Novo" badge, numerals, gift-message text, link hover |
| Hairline | `rgba(27,49,96,.14)` | Header border, card borders |
| Divider | `rgba(27,49,96,.15–.16)` | Section rules |
| Muted ink | `rgba(32,30,29,.5 / .55 / .6 / .65 / .72 / .75)` | Meta, captions, body on cream |
| Muted cream | `rgba(251,246,238,.7 / .82 / .85 / .9)` | Body on blue |
| Scrim | `rgba(20,37,69,.42)` + `backdrop-filter: blur(2px)` | Cart overlay |
| Hero scrim | `linear-gradient(180deg, rgba(20,37,69,.28) 0%, rgba(20,37,69,0) 38%, rgba(20,37,69,.72) 100%)` | Hero legibility |

Only two section grounds are used per page (cream + one of sand/blue). Blue is a punctuation colour,
never the whole page.

### Typography

- Display: **Caprasimo** 400 (the only display face). `line-height: 1.02–1.15`, `letter-spacing: -.02em` on the largest sizes.
- UI/body: **Figtree** 400/600/700.
- Fluid display sizes use `clamp()` against the **container** (`cqw`), because the prototype renders
  the phone view in a 430px shell. In production use viewport units/media queries — the intent is:

| Role | Desktop | Mobile |
| --- | --- | --- |
| Hero H1 | 78px | 30–34px |
| Page H1 (category, PDP, Sobre) | 52–80px | 28–32px |
| Section H2 | 42–60px | 24–28px |
| Card title H3 | 20px (favourites) / 23px (category) / 16px (small cards) | same |
| Body large | 17–19px | 14–15px |
| Body | 15px / 13.5px | same |
| Kicker / eyebrow | 11px, `letter-spacing: .22em`, uppercase | same |
| Meta / label | 10.5–12.5px, `letter-spacing: .14–.18em`, uppercase | same |
| Price (PDP) | 24px | 20–24px |
| Nav link | 13px, `letter-spacing: .04em` | 30px (Caprasimo, mobile drawer) |
| Announcement bar | 11.5px, `letter-spacing: .11em`, uppercase | same |

Body copy is never set in terracotta or blue at paragraph size on cream (contrast) — use `ink` at
72–75% opacity.

### Spacing, radius, elevation

- Section padding: `7cqw 6cqw` (≈ desktop 96px vertical / 80px horizontal at 1440; mobile 30px/26px). Narrow bands (shipping, footer top) `5–6cqw`.
- Grid gaps: 20px (small cards), 26px (favourites), 30px (category), 14–16px (galleries), `3–5cqw` between editorial columns.
- Radii: `999px` pills (buttons, chips, inputs, badges), 28px large media/containers, 22–26px cards, 18px size selector, 14–16px thumbnails.
- Shadows: cart drawer `-20px 0 60px rgba(20,37,69,.28)`; toast `0 12px 30px rgba(20,37,69,.35)`; menu card `0 12px 32px rgba(0,0,0,.3)`. No shadows on product cards.
- Sticky header uses `rgba(251,246,238,.93)` + `backdrop-filter: blur(12px)`.

### Interaction states (global)

- Buttons: `transition: filter .18s ease`; hover `filter: brightness(.93)`; active `brightness(.86)`; disabled `opacity: .45`, `cursor: not-allowed`.
- Links: `#1B3160` → hover `#C67139`, no underline (footer/nav); the "Ver tudo" link keeps a 1px bottom rule.
- Inputs/textarea: border `rgba(27,49,96,.25)` → focus border `#1B3160`.
- Keyboard focus: `outline: 2px solid #1B3160; outline-offset: 2px` (`:focus-visible` only).
- Selected option pills (flavour/size): fill `#1B3160`, text `#FBF6EE`, border `#1B3160`; unselected: transparent fill, border `rgba(27,49,96,.28)`, text `#201E1D`; `transition: all .18s ease`.
- Animations: hero content `ophFade` 900ms ease (opacity + 14px rise); drawer `ophDrawer` 320ms `cubic-bezier(.22,.8,.28,1)` slide from right; toast `ophToast` 2.4s (fade/rise in, hold, fade out). Nothing else animates — motion is deliberately restrained.

---

## Routing

The prototype switches an internal `page` value. Production routes:

| Prototype state | Route | Screen |
| --- | --- | --- |
| `home` | `/` | Homepage |
| `cookies` | `/comprar/cookies` | Cookies category |
| `produto` + `pid` | `/produto/<slug>` | Product page |
| `sobre` | `/quem-somos` | Quem Somos |
| — | `/carrinho` | Full cart page (**not designed** — drawer is; see Gaps) |

Navigating between pages resets scroll to top, closes the mobile menu, and resets quantity to 1
(and flavour/size to the first option when the product changes).

**Stub links that must be wired to real destinations:** Mercearia, Presentes, Eventos, Lifestyle,
Procurar, Conta, Lista de desejos, Envios e devoluções, Termos e privacidade, newsletter submit,
"Criar presente", "Falar sobre o meu evento", "Continuar para pagamento". In the prototype these
point at the nearest built page; they are **not** designed screens.

---

## Screens

### 1. Global chrome

**Announcement bar** — blue `#1B3160`, cream text, centred, 9px/16px padding:
"Enviamos de segunda a quinta-feira · Receba a sua encomenda até 2 dias". Toggleable (prop).

**Desktop header** — sticky, `z-index: 40`, cream 93% + blur, 1px bottom hairline. Inner max-width
1360px, padding 14px 40px, 3-column grid `1fr auto 1fr`: left nav (Cookies, Mercearia, Presentes,
Eventos, Quem Somos — 13px, gap 26px), centred wordmark (`logo-azul.png`, 52px tall), right utilities
(Procurar, Conta as 12.5px uppercase labels; cart button = basket icon 34px + count pill 22px blue
circle with cream 11px numeral). Cart button has `aria-label="Abrir o cesto"`.

**Mobile header** — sticky, 10px/16px padding, three zones: 44×44 hamburger (three 1.5px blue rules,
`aria-expanded`), 40px wordmark, 44×44 cart button with 19px count badge offset `-2px/-2px`. All hit
targets ≥44px.

**Mobile menu** — full-width blue panel below the header (`z-index: 39`), links set in Caprasimo 30px
cream with 8px vertical padding, a 1px cream-25% rule, then a 12px uppercase line
"Procurar · Conta · Lista de desejos". Opens/closes on hamburger; closes on navigation, on cart open
and on `Escape`.

**Footer** — ground `#142545`, cream-85% text, padding `6cqw 6cqw 3cqw`, 4-column auto-fit grid
(min 200px, gap 34px): brand (white wordmark 86px + 13.5px blurb), "Comprar" links, "Ophelia" links,
newsletter (13.5px copy, pill email input on transparent with cream-30% border + cream pill
"Subscrever" button, 44px min height). Bottom bar: 1px cream-18% rule, 11.5px 70%-opacity row with
"© 2026 Ophelia · Estoril, Portugal" and the brand line.

**Watercolour motif** (brand signature, toggleable): `flowers-frame.png` across the hero base at
`opacity .5`, `mix-blend-mode: screen`; `flowers-bg.png` as a 34–38% wide bleed at `opacity .28–.3`
behind section headers, and full-bleed `object-fit: cover` at `opacity .35` behind the Sobre opening;
`cesto.png` as the cart icon, the gifting section mark (72px) and the empty-cart illustration (110px);
`menu.png` as a photographed prop in the Sobre closing band (180px, radius 10px, drop shadow).

### 2. Homepage (`/`)

Order of sections — the emotional narrative matters, do not reorder:

1. **Hero** — full-bleed image, `min-height: 74cqw`, `max-height: 820px`, content bottom-left, gradient
   scrim + watercolour frame. Kicker "Ophelia · Guarda · Estoril", H1 quote, 52ch supporting paragraph,
   two pills: primary cream→blue "Descobrir Ophelia" (→ Quem Somos), outlined cream "Comprar agora"
   (→ Cookies). Text block is `pointer-events: none` except the buttons, so the image slot stays reachable.
2. **Os favoritos da Ophelia** — kicker "A nossa curadoria", H2, "Ver tudo" link right-aligned.
   4-up auto-fit grid (min 240px, gap 26px). Card: 330px image (radius 24px, sand fallback, whole image
   is a button → PDP), optional badge pill top-left (blue, 10.5px uppercase), kicker / H3 title /
   "desde €X", then a bordered pill "Adicionar ao cesto" (adds the smallest size directly).
   Items: Ophelia Cookies, CookieBrownie, Cookie Banoffee (badge "Novo"), A Granola da Ophelia.
3. **As famosas Cookies da Ophelia** — blue band, two columns (auto-fit min 280px, gap `5cqw`):
   left copy + four flavour chips (outlined cream pills, static, not filters) + cream CTA
   "Ver todas as cookies"; right a 2×2 image mosaic (one 300px tall spanning two rows, two 142px).
4. **Mercearia da Ophelia** — sand band, header row (kicker/H2 + 38ch paragraph right), 4-up auto-fit
   grid (min 190px, gap 20px). Card: cream fill, radius 22px, 16px padding, 200px image (radius 14px),
   H3 16px, 12px size line, footer row price + bordered "Adicionar" pill (adds one unit).
   Items: Azeite 500ml €13,90 · Mel de Rosmaninho €7,80 · Doce de Pera e Gengibre €4,85 ·
   Doce de Maçã e Vinho do Porto €4,85.
5. **Gifting teaser** — cream, two columns: 360px min image (radius 28px) and copy with the basket
   mark, H2 "Cria o presente. Nós tratamos do resto.", 44ch paragraph, three combination lines
   (Pequeno mimo / Para o pequeno-almoço / Presente especial), blue pill "Criar presente" (stub).
6. **Shipping band** — blue, three auto-fit columns (min 220px): Expedição, Entrega, Encomendas
   grandes, each Caprasimo 19px + 13.5px copy at 82% opacity.

### 3. Cookies category (`/comprar/cookies`)

- **Header block** — kicker "Comprar · Cookies", H1 "As famosas Cookies da Ophelia", 56ch paragraph,
  watercolour bleed top-left.
- **Product grid** — auto-fit min 280px, gap 30px, 5 products. Card: 380px image button (radius 26px)
  with optional terracotta badge, H3 23px, description (`min-height: 44px` so cards align), then one
  sand chip per size reading `"4 unidades · €17"`, then blue pill "Escolher" → PDP.
  Products and prices are in the Data model below.
- **"É o presente perfeito."** — sand band, two columns: copy + numbered list (01/02/03 in Caprasimo
  terracotta 20px) and a 420px min image (radius 28px).
- **Personalizadas band** — blue, centred: kicker "Casamentos · Aniversários · Empresas · Batizados",
  H2 "Cookies personalizadas para o teu dia", 52ch paragraph carrying the price ladder, cream pill
  "Personalizar as minhas cookies" → PDP for `Cookies Personalizadas`.

### 4. Product page (`/produto/<slug>`)

Generic over any product; reachable for all 5 cookie SKUs plus Granola.

- **Breadcrumb** — 12px, 55% ink: `Ophelia · Cookies · <product>`.
- **Gallery** (left column, auto-fit min 320px, gap `4cqw`): 520px main image (radius 28px) + three
  120px thumbs in a 3-column grid (radius 16px). Thumbs are presentational in the prototype —
  production should swap the main image on click with a cross-fade.
- **Detail column** (max 560px, 22px stack):
  - kicker (product `kicker`), H1 title, price 24px blue, `long` description 15px/1.7.
  - **Sabor** — only when the product has flavours (Ophelia Cookies: Tradicional, Red Velvet, Cacau,
    Limão). Pills, single-select, first selected by default.
  - **Tamanho da caixa** — auto-fit min 120px grid of 18px-radius cards, each two lines (size label +
    price). Single-select, first selected by default; price and CTA total update immediately.
  - **Quantity + add** — pill stepper (40×40 −/+, value 15px, min 1, max 99) beside a blue pill
    "Adicionar ao cesto · €X" (`flex: 1 1 220px`, min-height 52px). The label total =
    (size price + card €4 if enabled) × quantity.
  - **Cartão personalizado** — sand panel radius 22px: checkbox (20px, `accent-color: #1B3160`),
    label "Adicionar cartão personalizado **+ €4**" (terracotta), 12.5px helper line. When checked, a
    3-row textarea appears, placeholder "Escreve a tua mensagem", `maxLength=120`.
  - **Shipping note** — hairline top, 13px, 65% ink, repeats the dispatch rule.
- **"Fica ainda melhor com…"** — H2 + line "Escolhido por nós, não por um algoritmo.", auto-fit min
  200px grid of 4 cross-sell cards (cream fill, 1px `rgba(27,49,96,.14)` border, radius 22px, 180px
  image, price + bordered "Juntar" pill). Fixed curated set: Café €18, Granola 300g €8,
  Mel de Rosmaninho €7,80, Vela aromática €18.
- **Mobile only** — sticky bottom bar (`z-index: 35`, cream 96% + blur, hairline top): product name
  11px + live line total 15px on the left, blue "Adicionar ao cesto" pill filling the rest (48px).

### 5. Quem Somos (`/quem-somos`)

- **Opening** — centred, watercolour full-bleed at 35%: kicker, H1 "Não somos uma empresa — somos uma
  família.", 56ch paragraph.
- **Timeline** — six chapters, each a two-column row (auto-fit min 280px, gap `3cqw`, `3cqw` vertical
  padding, 1px top rule): left = year/label in Caprasimo terracotta (30–52px), H3 title, 46ch body;
  right = 300px image (radius 26px) with the design system's `.washed` treatment (desaturate/lift) —
  story imagery sits back, product imagery does not.
  Chapters: **Guarda** · **2019** · **Pandemia** · **Estoril** · **2022** · **Hoje** (copy in the file).
- **Closing band** — blue, centred: the menu card prop, H2 "Porque, para nós, as melhores memórias
  constroem-se à volta de uma mesa.", two pills — cream "Comprar as cookies" (→ Cookies) and outlined
  "Falar sobre o meu evento" (stub → Eventos).

### 6. Cart drawer

Right-hand drawer, `width: min(440px, 92%)`, cream ground, full height, viewport-anchored (fixed
overlay; in the prototype it is pinned inside the 430px phone shell so it never stretches the page).

- **Header** — 22px Caprasimo "O teu cesto" + 36px close button (`aria-label`), hairline bottom.
  `role="dialog"`, `aria-modal="true"`; body scroll is locked while open; `Escape` closes; clicking the
  scrim closes.
- **Empty state** — basket illustration 110px at 85% opacity, "O cesto ainda está vazio.", blue pill
  "Começar pelas cookies" → Cookies page.
- **Line item** — grid `74px 1fr auto`, gap 14px: 88px sand thumbnail (production: product image;
  the prototype shows a Caprasimo monogram), title 15px Caprasimo, variant line 12px 55% ink,
  optional gift message in terracotta italic quotes (`overflow-wrap: anywhere`), then a 30px pill
  stepper and a small underlined "Remover". Right column = line total 14px blue.
- **"Ainda falta alguma coisa?"** — shown only when the cart has items: up to 3 curated add-ons not
  already in the cart, each a sand row (radius 16px) with title · price and a bordered "Juntar" pill.
- **Summary** — hairline top, 20/24px padding: Subtotal, "Envio — Calculado no pagamento",
  Total 17px blue, blue pill "Continuar para pagamento" (52px, stub → checkout), then a centred
  11.5px dispatch reminder.

**Toast** — on every add: `#142545` pill, cream 13.5px, bottom-centre, fixed, `z-index: 70`, auto-dismiss
after 2.4s, copy `"<product> no cesto"`. Adds from the PDP also open the drawer; adds from cards do not.

---

## State management

| State | Type | Notes |
| --- | --- | --- |
| `page` | `'home' \| 'cookies' \| 'produto' \| 'sobre'` | Replace with the router |
| `pid` | product id | PDP subject |
| `flavour` | index | Resets to 0 on product change |
| `size` | index | Resets to 0 on product change |
| `qty` | 1–99 | Resets to 1 on navigation |
| `cardOn` / `cardMsg` | boolean / string ≤120 chars | Personalised card |
| `cart` | `{title, sub, price, qty, note?}[]` | Persist (localStorage/session) in production; the prototype does not |
| `cartOpen` / `menuOpen` | boolean | Mutually exclusive: opening the cart closes the menu |
| `toast` | string | Cleared by a 2.4s timer |
| `mobile` | boolean | **Prototype only** — production uses real breakpoints |

**Cart rules (implement exactly):**

1. Line identity = `title + variant + gift message`. Adding an identical line increments quantity
   instead of appending a row.
2. Stepping a line below 1 removes the row. Quantity ceiling 99 per line.
3. The personalised card is added as **its own €4 line** ("Cartão personalizado · Escrito à mão"), and
   the message is also stored on the cookie line so the kitchen sees it in context.
4. Subtotal = Σ price × qty. Shipping is **not** calculated in the UI ("Calculado no pagamento"), so
   Total renders equal to Subtotal — keep it that way until real shipping rates exist.
5. Cross-sell suggestions exclude products already in the cart and cap at 3.
6. Money formatting is Portuguese: whole values render `€17`, decimals render `€7,80` (comma).

## Responsive behaviour

Two designed states: **desktop** (fluid to ~1440+, inner max-width 1360px on the header) and
**phone at 430px**. The prototype has no tablet state — everything between reflows through the same
auto-fit grids, which is intended.

- All product grids are `repeat(auto-fit, minmax(<min>, 1fr))`; the min values above are the contract
  (240/280/190/200px). Editorial two-column rows collapse to one column below ~600px.
- Phone-specific components: compact header, blue overlay menu, sticky PDP add-to-cart bar. The
  desktop header/nav is not shown on phone; the drawer becomes 92% width.
- Fluid type in the prototype is container-relative (`cqw`); reimplement as viewport-based `clamp()`
  or breakpoints using the size table above.
- Minimum hit target 44px on phone. Body copy never below 13px; slide/section captions never below 11px.

## Edge cases

- **Empty cart** — designed (see above). **Long gift message** — capped at 120 chars and wraps.
- **Products without flavours** — the Sabor block is omitted entirely (all SKUs except Ophelia Cookies).
- **Single-size products** — the size grid renders one card; keep it visible for consistency.
- **Personalizadas minimum** — enforced by offering only 10/25/35/50 as sizes; there is no free numeric
  entry. Any production quantity field must enforce ≥10.
- **Long product names** — cards allow two lines; the PDP H1 wraps with `text-wrap: pretty`.
- **Missing image** — slot falls back to `#F1E7D6` sand; never a broken-image icon.
- **Cart of many lines** — the item area scrolls independently; header and summary stay pinned.
- **Reduced motion** — respect `prefers-reduced-motion` by disabling `ophFade` / `ophDrawer` /
  `ophToast` (not implemented in the prototype).

## Data model (source of truth for prices)

Cookies — sizes/prices:

- **Ophelia Cookies** (flavours: Tradicional, Red Velvet, Cacau, Limão) — 4 un €17 · 8 un €32 · 12 un €48
- **Ophelia CookieBrownie** — 4 un €20 · 8 un €40 · 12 un €57 — "Não contém farinha."
- **Ophelia Cookie Banoffee** (badge "Novo") — 4 un €20 · 8 un €40 · 12 un €57
- **Pack Especial de Cookies** (Banoffee + CookieBrownie + Cheesecake) — 3 un €18 · 6 un €30 · 9 un €43
- **Cookies Personalizadas** (badge "Personalizável") — 10 un €35 · 25 un €87 · 35 un €122 · 50 un €175

Pantry / other:

- **A Granola da Ophelia** — 300 g €8 · 600 g €14
- **Café da Ophelia** — 250 g em grão €18 · 250 g em pó €8 (blend 70% Brasil / 30% Etiópia)
- **Mel de Rosmaninho** / **Mel de Carvalho** — 300 ml €7,80
- **Azeite da Ophelia** — 500 ml €13,90 · 750 ml €19,90
- **Doces** (Alperce e Amêndoa · Maçã e Vinho do Porto · Pera e Gengibre · Morango com Baunilha) — 225 ml €4,85
- **Vela aromática** €18 · **Cartão personalizado** €4 · **Avental da Ophelia** (100% algodão, tamanho único — price TBC)

Shipping copy: dispatch Monday–Thursday; orders after 12:00 Thursday ship the following Monday; no
weekend dispatch; delivery up to 2 working days; large/corporate orders may need more preparation time.

## Assets

In `assets/` (client-supplied brand artwork, all PNG with transparency):

| File | Use |
| --- | --- |
| `logo-azul.png` (585×413) | Wordmark on light grounds |
| `logo-branco.png` | Wordmark on blue grounds (footer) |
| `flowers-bg.png` | Hydrangea watercolour — section washes |
| `flowers-frame.png` (2550×3300) | Wildflower border — hero and band bases |
| `cesto.png` | Basket — cart icon, gifting mark, empty state |
| `menu.png` | Watercolour menu card — Sobre closing prop |

Fonts: **Caprasimo** + **Figtree** (Google Fonts, loaded by the design-system stylesheet).
Icons: none drawn — Lucide at stroke-width 2.75 is the system's icon choice if any are needed.

**Photography brief (to be produced/licensed).** One cohesive campaign: warm natural light, editorial
food photography, tactile texture, blue-and-white Ophelia packaging present but never invented labels.
Each slot in the prototype carries its intended shot as its caption, e.g. hero "Mesa Ophelia — cookies,
bolos, mãos a servir"; "Cookie partida ao meio, creme a escorrer"; "Caixa azul Ophelia fechada com
fita"; "Cookies embaladas com autocolante"; per-chapter story shots (Guarda, mesa de evento, kit de
aniversário, cozinha, fachada da loja, retrato de família). Aspect ratios: hero ~21:9, favourite/
category cards 3:4, mercearia 4:5, PDP main 1:1, thumbs 1:1, story rows 4:3.

## Known gaps / next steps

Designed entry points exist, screens do not — these are the obvious next design tasks, in priority order:

1. **Presentes + "Criar presente" gift configurator** (the brief's standout UX: base box → cookies →
   mercearia → café → vela → cartão + message, with a live summary and total).
2. **Full cart page** (`/carrinho`) and checkout.
3. **Cookies Personalizadas customisation UI** — sticker upload (image/drawing/logo), preview, approval.
4. **Mercearia and Lifestyle category pages**, **Eventos** page + enquiry form (Nome, Email, Tipo de
   evento, Data, Número de pessoas, Localização, Mensagem → "Falar sobre o meu evento").
5. Search, account, wishlist; PDP gallery swap; `prefers-reduced-motion`; cart persistence;
   Termos e Privacidade page (client copy supplied separately as a DOCX).

## Files

| File | What it is |
| --- | --- |
| `Ophelia.dc.html` | The prototype: all four pages, cart drawer, phone view. Open in a browser. |
| `image-slot.js` | Runtime for the image drop slots (prototype tooling — do not port). |
| `design-system/styles.css` | Organic design-system tokens + component classes the design builds on. |
| `assets/*.png` | Brand artwork listed above. |

### Screenshots (`screenshots/`)

| File | State |
| --- | --- |
| `01` | Homepage — hero (desktop) |
| `02` | Homepage — Os favoritos + Cookies band |
| `03` | Homepage — Mercearia + gifting teaser |
| `04` | Cookies category |
| `05` | Product page — default (Ophelia Cookies, Tradicional, 4 un) |
| `06` | Product page — 12 un selected, price/CTA updated |
| `07` | Cart drawer — one line, cross-sell, summary |
| `08` | Quem Somos — opening |
| `09` | Quem Somos — timeline chapters |
| `10` | Phone (430px) — homepage |
| `11` | Phone — menu open |
| `12` | Phone — Quem Somos |

The prototype needs its runtime (`support.js`) to render; the most reliable way to view it is inside
the design project. Use this README as the implementation contract — it is self-sufficient.
