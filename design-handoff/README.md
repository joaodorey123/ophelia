# Handoff: Ophelia — online store (loja, diário, quem somos, contacto)

## Overview

Ophelia is a small bakery / brunch spot / grocer in Estoril, Portugal ("pastelaria · brunch · mercearia", trading since 2019). This package contains the complete design for their online store, in Portuguese:

- **Início** (home) — photo hero, collections, house favourites, story teaser, reviews, latest diary posts, newsletter
- **Produtos** (shop) — 27 SKUs in 6 categories with client-side category filtering
- **Product detail** — gallery, size/quantity picker, handwritten-card add-on, accordions, suggested products
- **Quem somos** (about) — story, 2019–2022 timeline, taped photo grid, closing quote
- **Diário** (blog) — 6 uniform article cards → uniform article pages
- **Contacto** — enquiry form with subject select + shop info panel
- **Cart drawer** and a **full checkout** (delivery vs. pickup, Mon–Thu date picker, gift card + message, MB WAY / Multibanco / card, promo code, order confirmation)
- **Search overlay** across products

The visual signature is **taped-down photographs**: every feature photo sits on a white paper mount with realistic tape strips over the corners, and its edges are roughened by an SVG displacement filter so it reads as a torn print. There are four distinct tape types (below) — do not collapse them into one.

## About the design files

The files in `design/` are **design references created in HTML** — a prototype showing the intended look and behaviour. They are **not production code to copy directly**.

`design/Loja Ophelia.dc.html` is written for a proprietary streaming-template runtime (`support.js`, `<x-dc>`, `<sc-for>`, `<sc-if>`, `{{ holes }}`). Treat that markup as a *specification of structure and styling*, not as a framework to port. All styling is inline on purpose (a constraint of that runtime) — in the real build, move it into whatever the codebase uses (CSS modules, Tailwind, styled-components, SwiftUI modifiers…).

**The task:** recreate these designs in the target codebase's existing environment, using its established patterns, router, component library and styling approach. If no codebase exists yet, choose an appropriate stack — a React/Next.js or Astro storefront suits this content well (mostly static catalogue + a client-side cart) — and implement the designs there.

To view the reference: open `design/Loja Ophelia.dc.html` in a browser (it self-boots via `support.js`; `assets/` and `photos/` must stay siblings of it).

## Fidelity

**High-fidelity (hifi).** Colours, typography, spacing, copy, interaction and animation are all final and should be reproduced faithfully. Exact values are in **Design tokens** and per-screen below. Every string of Portuguese copy in this package is final client copy (with the exceptions flagged in **Open items**) — do not paraphrase or re-translate it.

---

## Global chrome

### Announcement bar
- Height `38px`, background `#1E2F52`, text `#F6F1E7`, `11.5px` Jost 300, `letter-spacing: .16em`, lowercase.
- Three messages, `gap: 80px`, `padding-right: 80px`, `white-space: nowrap`:
  1. `envios para todo o portugal · segunda a quinta`
  2. `torramos o nosso café todos os dias na loja`
  3. `encomendas de bolos com 48h de antecedência`
- Infinite marquee: the strip is duplicated twice inside a `width: max-content` flex track animated `translateX(0 → -50%)`, `38s linear infinite`. Both halves must be identical and content-sized, or the loop jumps.
- Toggleable (see **Configurable props**).

### Header
- `position: sticky; top: 0`, `background: rgba(251,248,243,.94)`, `backdrop-filter: blur(10px)`, bottom border `1px solid rgba(30,47,82,.1)`.
- Row 1: `height: 96px`, `max-width: 1360px`, `padding: 0 34px`, three-column grid `1fr auto 1fr`.
  - Left: search button — 15px magnifier stroke icon (`stroke-width: 1.3`) + label `pesquisar`, `11.5px`, `letter-spacing: .14em`, `opacity: .7` → `1` on hover.
  - Centre: `assets/logo-azul.png` at `height: 52px`, and under it `pastelaria · brunch · mercearia` — `8.5px`, `letter-spacing: .44em`, uppercase, `#556790`, `margin-top: 6px`.
  - Right: `contacto` text link + basket button (`assets/icon-cesto.png`, `height: 26px`) with the item count beside it at `11.5px`.
- Row 2: nav, `height: 48px`, top border `rgba(30,47,82,.08)`, centred, `gap: 40px`, links `13px`, `letter-spacing: .1em`, lowercase: `início · produtos · quem somos · diário · contacto`. Active route gets a `1px solid #1E2F52` bottom border (`padding-bottom: 3px`); inactive is `transparent` — the border is always present so nothing shifts. `produtos` stays active on product pages; `diário` stays active on article pages.

### Newsletter band (all routes except checkout)
- Background `#1E2F52`, text `#F6F1E7`, `margin-top: 96px`, inner `max-width: 660px`, `padding: 88px 34px`, centred.
- Kicker `a carta da ophelia` — `9.5px`, `letter-spacing: .42em`, uppercase, `opacity: .85`.
- Heading in Beth Ellen, `clamp(27px, 3.4vw, 40px)`, `line-height: 1.4`: `receitas e novidades,` / `uma vez por mês.`
- Inline email field + `subscrever →` button on a single `1px solid rgba(246,241,231,.4)` bottom rule.

### Footer
- Background `#F3F0E9`, top border `rgba(30,47,82,.1)`, `padding: 76px 34px 30px`, four auto-fit columns `minmax(190px, 1fr)`, `gap: 48px`.
- Col 1: logo at `46px` + `Pastelaria, brunch e mercearia. Feito por nós, todos os dias, no Estoril.` (`12.5px`, `line-height: 1.9`, `#42537A`, `max-width: 26ch`).
- Col 2 **a loja**: todos os produtos · cookies · mercearia · café, chai & matcha · bolos por encomenda (each jumps to the shop pre-filtered to that category).
- Col 3 **a casa**: quem somos · o diário · contacto · eventos & catering · presentes corporativos (last three → contacto).
- Col 4 **envios & ajuda** (static text): Envios de segunda a quinta · Entrega até 2 dias úteis · Portugal continental · info@callmeophelia.com
- Column headings: `10px`, `letter-spacing: .26em`, uppercase, `#556790`, `margin-bottom: 16px`. Links `13px`.
- Bottom rule row, `11px`, `#556790`: left `© 2026 Ophelia · Termos e condições · Política de privacidade`, right `Estoril, Portugal · @callmeophelia`.

### Toast
Fixed, `bottom: 34px`, centred, `#1E2F52` on `#F6F1E7` text, `padding: 15px 26px`, `12px`, `letter-spacing: .1em`, shadow `0 8px 30px rgba(30,47,82,.3)`, `ophFade .3s`. Fires on add-to-cart with the text `<product name> no cesto` and clears after **2200ms**.

---

## The tape effect (the thing to get right)

Every taped photo is a three-layer construction:

1. **Outer wrapper** — `position: relative`, `padding: 12–18px` (the padding is what gives the tape room to hang off the mount).
2. **White paper mount** — `background: #fff`, `padding: 7–10px`, `box-shadow: 0 3px 16px rgba(30,47,82,.08)` (small) or `0 6px 28px rgba(30,47,82,.1)` (large), `z-index: 2`.
3. **The photo** — `object-fit: cover`, with `filter: url(#ophDeckle)` or `url(#ophDeckle2)` to rough up the edges.
4. **Tape strips** — absolutely positioned, `z-index: 3`, overlapping the mount corners, each rotated a few degrees.

### The deckle-edge filters
Two inline SVG filters live in a `width: 0; height: 0` SVG at the top of the document. Alternate between them on adjacent photos so no two torn edges look identical:

```html
<filter id="ophDeckle">
  <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="7" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="ophDeckle2">
  <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed="19" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

### The four tape types

**1 · Kraft washi** — plain warm paper tape. Used on collection cards, shop-adjacent mounts.
```css
background: rgba(232,222,199,.82);           /* .72–.85 depending on placement */
box-shadow: 0 1px 3px rgba(30,47,82,.16);
transform: rotate(-5deg);                     /* ±3–7deg */
/* size 70–112px × 20–30px */
```

**2 · Torn masking tape** — kraft with a genuinely ragged top and bottom edge, via clip-path. Used on the home story photo, product hero, contact photo, sobre photo grid.
```css
background: #EDE3D0;
clip-path: polygon(0% 24%,4% 4%,11% 19%,19% 2%,28% 21%,37% 5%,46% 23%,55% 6%,64% 21%,
                   73% 3%,82% 20%,91% 5%,100% 21%,98% 79%,90% 96%,81% 77%,72% 95%,
                   63% 78%,54% 96%,45% 77%,36% 95%,27% 79%,18% 96%,9% 78%,2% 95%);
/* no box-shadow — the torn silhouette carries it */
```

**3 · Striped blue washi** — patterned decorative tape. Used on review cards, article hero, some card bottoms.
```css
background: repeating-linear-gradient(90deg,
  rgba(196,209,227,.9) 0 7px,
  rgba(243,237,224,.92) 7px 14px);
box-shadow: 0 1px 2px rgba(30,47,82,.12);
```

**4 · Clear scotch tape** — translucent with a diagonal sheen and pinched ends. Used on the home hero banner and the sobre portrait.
```css
background: linear-gradient(115deg,
  rgba(255,255,255,.52) 0%, rgba(214,225,238,.46) 38%,
  rgba(255,255,255,.62) 58%, rgba(210,222,237,.42) 100%);
clip-path: polygon(7% 0,100% 0,93% 50%,100% 100%,7% 100%,0 50%);
box-shadow: 0 1px 3px rgba(30,47,82,.1);
```

Rules of thumb: one or two strips per photo, never symmetric, always at opposing corners (top-left + bottom-right), rotations between `-7deg` and `+5deg`, and vary the type between neighbouring photos.

---

## Screens

### 1 · Início (home) — `screenshots/01–06`

**Hero.** `height: 74vh; min-height: 520px`, `photos/e02.jpg` full-bleed `object-fit: cover` on `#E8E3DA`. Gradient veil `linear-gradient(180deg, rgba(30,47,82,.1) 0%, rgba(30,47,82,0) 34%, rgba(30,47,82,.24) 100%)`. A taped card floats at `bottom: 52px`, `left: 50%`, `translateX(-50%)`, `width: min(560px, 86vw)`:
- Card `background: #F7F2E7`, `padding: 30px 40px 34px`, centred, `box-shadow: 0 8px 30px rgba(30,47,82,.14)`.
- Two **clear scotch** strips, top-left `-15px/-26px` at `-7deg` and bottom-right `-15px/-26px` at `-6deg`, `112–118 × 30px`.
- Kicker `estoril · desde 2019` — `9.5px`, `letter-spacing: .4em`, uppercase, `#4A5C85`.
- Title `a loja da ophelia` — Beth Ellen, `clamp(40px, 5.6vw, 68px)`, `line-height: 1.24`.
- Link `ver tudo` — `11.5px`, `letter-spacing: .2em`, uppercase, `1px` underline, → shop.

**As nossas coleções.** `padding: 96px 34px 30px`, `max-width: 1360px`. Header row: h2 Beth Ellen `37px` + right-hand note `tudo feito por nós, em pequenas quantidades, na cozinha da loja.` (`12.5px`, `#4A5C85`, `max-width: 400px`). Grid `repeat(auto-fit, minmax(230px, 1fr))`, `gap: 44px 34px`. Six cards — cookies (`photos/g1.jpeg`), mercearia (`g3`), café, chai & matcha (`b05`), bolos (`n07`), casa & presentes (`e03`), ver tudo (`e04`) — each a taped `4/5` photo (kraft top-left, striped bottom-right) with `<name> →` in Cormorant Garamond `23px` and a `12px` `#4A5C85` note beneath. Clicking a card opens the shop filtered to that category.

**Os favoritos da casa.** `padding: 80px 34px 20px`. Header row: h2 Beth Ellen `37px` + `ver todos` link. Grid `repeat(auto-fill, minmax(238px, 1fr))`, `gap: 52px 30px`. Four products (`ny`, `granola`, `cafe-grao`, `azeite`) as the standard product card (see below).

**Story band.** `margin-top: 96px`, `background: #F3F0E9`, with `assets/bg-flowers.png` absolutely positioned full-cover at `opacity: .42; mix-blend-mode: multiply`. Two auto-fit columns `minmax(310px, 1fr)`, `gap: 64px`, `padding: 110px 34px`. Left: `photos/k05.jpg` square, taped with a **torn masking** strip at `left: 40%`. Right: kicker `quem somos`, h2 Beth Ellen `clamp(30px, 3.4vw, 42px)` reading `não somos uma empresa —` / `somos uma família.`, body paragraph (`14.5px`, `line-height: 1.95`, `#3E4F73`, `max-width: 44ch`), link `a nossa história`.

**O que dizem de nós.** `padding: 96px 34px 0`, centred h2, grid `repeat(auto-fit, minmax(270px, 1fr))`, `gap: 30px`. Cards: `#fff`, `padding: 38px 34px`, `box-shadow: 0 3px 18px rgba(30,47,82,.07)`, a **striped washi** strip at `top: -13px; left: 34px`, `-4deg`. Stars `★★★★★` at `13px`, `letter-spacing: .3em`, `#8F6B36`. Quote in Cormorant Garamond `20px` italic, `line-height: 1.55`. Attribution `10.5px`, `letter-spacing: .22em`, uppercase, `#4F6189`. Content in `data/reviews.json`.

**Do nosso diário.** `padding: 96px 34px 40px`, h2 + `ler tudo`, grid `repeat(auto-fit, minmax(280px, 1fr))`, `gap: 34px`. Three most recent posts: untaped `16/11` photo (scale-on-hover), kicker, title in Cormorant Garamond `23px`.

### 2 · Produtos (shop) — `screenshots/10–13`

- Centred intro block `max-width: 620px`: kicker `a loja`, h1 Beth Ellen `clamp(36px, 4.6vw, 54px)`, lede `Preparamos tudo sob encomenda. Enviamos de segunda a quinta para todo o Portugal continental.`
- Filter row: `margin: 50px 0 14px`, centred, `gap: 11px`. Pills `11px`, `letter-spacing: .16em`, uppercase, `padding: 10px 18px`, `border-radius: 2px`, `transition: all .25s`. Selected = `background: #1E2F52`, `color: #F6F1E7`, `border-color: #1E2F52`; unselected = `background: #fff`, `border: 1px solid rgba(30,47,82,.24)`, `color: #1E2F52`. Categories: `tudo · cookies · mercearia · café, chai & matcha · bolos · casa & presentes`.
- Count line under the pills, `11.5px`, `#556790`: `N produtos` (singular `1 produto`).
- Grid `repeat(auto-fill, minmax(250px, 1fr))`, `gap: 58px 30px`, `padding: 36px 0 40px`. Cards animate in with `ophFade .5s ease both`.

**Standard product card** (used on home, shop, suggestions):
- Photo `aspect-ratio: 3/4`, `object-fit: cover`, on `#F1EDE5`, `transition: transform .8s cubic-bezier(.2,.7,.2,1)`, hover `scale(1.045)`, wrapper `overflow: hidden`.
- Shop cards only: a tag chip at `top: 12px; left: 12px` — `9px`, `letter-spacing: .2em`, uppercase, `background: rgba(247,242,231,.94)`, `padding: 6px 10px` (e.g. `a mais pedida`, `torrado na loja`, `por encomenda`).
- Name — Cormorant Garamond `20px`, `line-height: 1.25`, `margin-top: 15px`.
- Price — `12.5px`, `#4A5C85`, `margin-top: 5px`. Multi-size products read `desde 7,80 €`; single-size read the flat price.
- Button `juntar ao cesto` — `10.5px`, `letter-spacing: .18em`, uppercase, `border: 1px solid rgba(30,47,82,.3)`, `padding: 9px 16px`, `align-self: flex-start`; hover fills `#1E2F52` / `#F6F1E7`. Adds size #1 × 1 and **opens the cart drawer**.

### 3 · Product detail — `screenshots/20–23`

`max-width: 1260px`. Breadcrumb `produtos / <category label>` at `11px`, `letter-spacing: .14em`, `#556790`. Two auto-fit columns `minmax(320px, 1fr)`, `gap: 64px`, `align-items: start`.

**Left — gallery.** Hero `aspect-ratio: 4/5` on a white mount inside `padding: 18px`, with a **torn masking** strip top-left (`-5deg`) and a **clear scotch** strip bottom-right (`+4deg`); `filter: url(#ophDeckle)`. Below: three square thumbnails, `gap: 12px`, `padding: 0 18px`; the active one carries a `1px solid #1E2F52` border, the others `transparent`.

**Right — buy panel.**
- Category kicker, h1 Beth Ellen `clamp(32px, 3.8vw, 46px)`, description `14.5px` / `line-height: 1.95` / `#3E4F73`.
- **Size picker** (`margin-top: 32px`): label (`escolhe as cookies` for cookies, `tamanho` for goods, `serve` for cakes) at `10.5px`, `letter-spacing: .24em`, uppercase, `#4A5C85`. Grid `repeat(auto-fit, minmax(112px, 1fr))`, `gap: 10px`. Each option `padding: 15px 10px`, centred: label `13px` + price Cormorant Garamond `19px`. Selected/unselected states identical to the filter pills.
- **Card add-on**: `background: #F3F0E9`, `padding: 17px 19px`, checkbox `accent-color: #1E2F52`, `15px`; `Juntar um cartão personalizado` + `escrito à mão por nós · 4,00 €`.
- **Quantity + add**: stepper `1px solid rgba(30,47,82,.24)`, `–`/`+` buttons `44 × 52px`, value `40px` wide. Primary button fills the rest (`min-width: 210px`, `height: 52px`), `#1E2F52` / `#F6F1E7`, `11.5px`, `letter-spacing: .22em`, uppercase, hover `#2C4370`, label `juntar ao cesto · <live total>` where the total is `size × qty + 4 if card`.
- **Accordions** — `ingredientes` (per-product), `envio`, `como vai embalado` (both constant, copy in the reference file). One open at a time, `ingredientes` open by default. Row `padding: 19px 2px`, title `12px`, `letter-spacing: .2em`, uppercase, `+`/`−` sign at `16px` `#4F6189`; body animates via `max-height 0 → 240px`, `transition: .35s ease`.

**Fica ainda melhor com.** `padding: 90px 0 30px`, h2 Beth Ellen `31px`, grid `repeat(auto-fill, minmax(230px, 1fr))`, `gap: 30px`, three hand-picked products per SKU (the `suggest` array in `data/products.json`).

### 4 · Quem somos — `screenshots/40–43`

- **Hero**: `height: 56vh; min-height: 380px`, `photos/e07.jpg`. Scrim `linear-gradient(180deg, rgba(24,38,66,.5) 0%, rgba(24,38,66,.67) 48%, rgba(24,38,66,.76) 100%)` — this depth is a **contrast requirement**, not decoration: the photo has pale walls and cream cushions, and a lighter wash drops the title under 4.5:1. Centred kicker `estoril · desde 2019` in `#FFFFFF` and h1 `quem somos` in Beth Ellen `clamp(40px, 5.6vw, 70px)`, `#FBF8F3`, both with `text-shadow: 0 1px 10px rgba(20,32,58,.7)` / `0 2px 18px rgba(20,32,58,.6)`. Measured: title 4.68:1, kicker 4.95:1 against the brightest pixel behind them.
- **Lede**: `padding: 88px 34px 0`, `max-width: 1180px`, Beth Ellen `clamp(24px, 2.9vw, 34px)`, `line-height: 1.62`, `max-width: 26ch`.
- **Two-column story**: `gap: 60px`, `margin-top: 50px`. Left: two paragraphs (`15px`, `line-height: 2.05`, `#3E4F73`). Right: `photos/k07.jpg` at `4/5`, taped with a **clear scotch** strip at `left: 34%`, `-4deg`.
- **Timeline**: four auto-fit columns `minmax(250px, 1fr)`, `gap: 38px`, `padding: 70px 34px 0`. Each: `border-top: 1px solid rgba(30,47,82,.2)`, `padding-top: 20px`, year in Cormorant Garamond `36px` `#556790`, title `14px`/`500`, body `13.5px`/`line-height: 1.9`. Content in `data/timeline.json` (2019 Guarda → 2020 kits → 2021 Estoril → 2022 shop opens).
- **Photo grid**: four columns `minmax(220px, 1fr)`, `gap: 22px`; columns 2 and 4 offset by `margin-top: 34px`. `e04` (kraft torn, top-left), `k10` (striped, bottom-right), `e03` (scotch, top-left), `k09` (striped, bottom-right) — alternating `ophDeckle` / `ophDeckle2`.
- **Closing quote band**: `background: #F3F0E9`, `assets/frame-flowers.png` pinned bottom full-width at `opacity: .85`, `padding: 96px 34px 260px` (the deep bottom padding is what keeps the type clear of the floral frame), centred, `max-width: 760px`. Beth Ellen `clamp(25px, 3vw, 36px)`, `line-height: 1.56`, plus a `13.5px` `#4A5C85` line.

### 5 · Diário — `screenshots/50–53`

**Deliberately uniform.** There is no featured or hero article: all posts render as the same card in one grid, and every article opens the identical page. Keep it that way — the client edits and appends articles themselves.

- Intro `max-width: 600px`: kicker `o diário`, h1 Beth Ellen `clamp(34px, 4.4vw, 52px)` reading `receitas, épocas e presentes`, lede.
- Grid `repeat(auto-fill, minmax(290px, 1fr))`, `gap: 52px 32px`. Card: `16/11` photo (hover `scale(1.045)`), kicker `<kicker> · <date>` (`10px`, `letter-spacing: .26em`, uppercase, `#556790`), title Cormorant Garamond `24px`, excerpt `13px`/`line-height: 1.85`/`#42537A`, then `ler` at `10.5px`, `letter-spacing: .2em`, uppercase with a `1px` underline.
- **Article page**: `max-width: 760px`. Back link `← diário`. Kicker line, h1 Beth Ellen `clamp(30px, 4vw, 48px)`. Hero `16/11` on a white mount with a **striped washi** strip at `left: 38%`, `-3deg`, `filter: url(#ophDeckle)`. Excerpt as a standfirst — Cormorant Garamond `23px`, `line-height: 1.62`, `#2C3E63`. Body paragraphs `15px`, `line-height: 2.05`, `#3E4F73`, `margin-top: 24px`. Footer: `border-top`, `padding-top: 30px`, kicker · date on the left, `voltar ao diário` on the right.
- Six articles in `data/posts.json`, newest first; the first three also feed the home page. Fields: `id · kicker · date · img · title · excerpt · body[]`. Kickers in use: `receitas`, `épocas`, `presentes`.

### 6 · Contacto — `screenshots/60–61`

Two auto-fit columns `minmax(300px, 1fr)`, `gap: 56px`.
- **Form**, `gap: 24px`. Field labels `10.5px`, `letter-spacing: .22em`, uppercase, `#4A5C85`, `margin-bottom: 8px`. Text/email/select are underline-only (`border-bottom: 1px solid rgba(30,47,82,.25)`, no background, `padding: 10px 0`, `15px`); the message is a boxed `textarea` (`#fff`, `1px solid rgba(30,47,82,.2)`, `padding: 14px`, `rows: 5`, `resize: vertical`). Submit `#1E2F52` / `#F6F1E7`, `padding: 17px 40px`, `11.5px`, `letter-spacing: .22em`, uppercase.
- Subject options: `Encomenda de bolos · Cookies personalizadas · Eventos e catering · Presentes corporativos · Estado de uma encomenda · Outro assunto`.
- **Success state** replaces the form in place: `#F3F0E9` panel, `padding: 44px 38px`, centred, `obrigada!` in Cormorant Garamond italic `32px`, body copy, and an `enviar outra` link that resets it.
- **Right column**: `photos/e05.jpg` at `4/3`, taped with a **torn masking** strip; then five info rows, each `border-top: 1px solid rgba(30,47,82,.14)`, `padding: 18px 0`, label `10px`/`.26em`/uppercase/`#556790` and value `14.5px`, `line-height: 1.75`, `#2C3E63`, `white-space: pre-line`. Content in `data/contact.json`.

### 7 · Cart drawer — `screenshots/23`

- Veil `rgba(30,47,82,.34)` with `ophVeil .25s`; panel `width: min(430px, 100vw)`, full height, right-anchored, `background: #FBF8F3`, `box-shadow: -8px 0 40px rgba(30,47,82,.2)`, enters with `ophSlide .3s cubic-bezier(.2,.8,.2,1)`.
- Header `padding: 26px 28px`, bottom border, `o teu cesto (N)` at `11.5px`/`.24em`/uppercase, and a `×` close at `20px` `#42537A`.
- Lines: thumbnail `76 × 96px`, name Cormorant Garamond `18px`, size `11.5px` `#556790`, a `–`/`+` stepper (`30 × 30px`) and a `remover` link (`10.5px`, uppercase, `#556790`), line total right-aligned at `13.5px`. Separated by `1px solid rgba(30,47,82,.1)`.
- Empty state: centred, `padding: 70px 10px`, `o cesto está vazio` in Cormorant Garamond italic `26px` `#4F6189`, plus a `ver os produtos` link.
- Footer (only when filled): `background: #F3F0E9`, subtotal label + Cormorant Garamond `28px` amount, then a free-shipping nudge — `Faltam X,XX € para envio grátis.` or, once over the threshold, `Envio grátis — acima de 60,00 € é por nossa conta.` — then a full-width `finalizar encomenda` button.

### 8 · Checkout — `screenshots/30–33`

`max-width: 1200px`. h1 Beth Ellen `clamp(30px, 4vw, 46px)` + standing note `Enviamos de segunda a quinta. Pedidos após as 12h00 de quinta seguem na segunda seguinte.` The newsletter band is **hidden** on this route. Two columns `minmax(320px, 1fr)`, `gap: 60px`; the summary is `position: sticky; top: 170px`.

Section headings are numbered: `1 · entrega`, `2 · data`, `3 · um recado`, `4 · pagamento` — `11.5px`, `letter-spacing: .24em`, uppercase, `#4A5C85`, `margin-bottom: 20px`.

1. **Entrega** — two mutually exclusive buttons (`envio para casa` / `recolher na loja`), then a `1fr 1fr` field grid: nome, telefone, email (full width), and — only in `envio` mode — morada (full width), código postal, localidade.
2. **Data** — helper line `Preparamos e enviamos de segunda a quinta-feira.`, then four date tiles `repeat(auto-fit, minmax(120px, 1fr))`: weekday abbreviation (`10px`, `.18em`, uppercase, `opacity: .7`) over the date in Cormorant Garamond `20px`. **Only Mon–Thu are offered** — generate the next four qualifying weekdays from today and skip Fri/Sat/Sun.
3. **Um recado** — the same `#F3F0E9` card checkbox (`Cartão personalizado escrito à mão`, `+ 4,00 €`) plus a `rows: 3` textarea placeholdered `a mensagem que queres que escrevamos…`.
4. **Pagamento** — three rows, each `padding: 17px 20px`, name left / note right (`11.5px`, `#556790`): `MB WAY — pagamento imediato`, `Multibanco — referência por email`, `Cartão de crédito — Visa · Mastercard`. Selected row = `background: #EFF2F7`, `border-color: #1E2F52`; unselected = `#fff`, `border: 1px solid rgba(30,47,82,.16)`.
- Submit: full-width, `#1E2F52`, `padding: 20px`, `letter-spacing: .24em`, label `confirmar e pagar · <grand total>`.

**Summary aside.** `#fff`, `padding: 36px 32px`, `box-shadow: 0 4px 22px rgba(30,47,82,.07)`. Cart lines (`64 × 80px` thumbs, `<size> · <n> un.`), then the promo row (input + `aplicar`), the promo note (`Tens um código? Experimenta OPHELIA10.` → `Código OPHELIA10 aplicado — 10% de desconto.`), then four total rows and the grand total in Cormorant Garamond `30px` above a `1px solid rgba(30,47,82,.16)` rule.

**Confirmation.** Replaces the whole form: `max-width: 620px`, `#F3F0E9`, `padding: 60px 48px`, centred — logo at `44px`, `encomenda recebida` in Cormorant Garamond italic `34px`, body copy, and a `continuar a comprar` button that empties the cart and returns to the shop.

### 9 · Search overlay — `screenshots/62`

Full-width sheet dropped from the top over a `rgba(30,47,82,.32)` veil: `background: #FBF8F3`, `padding: 54px 34px 44px`, bottom border, `ophFade .3s`. The input is borderless except a bottom rule, **Cormorant Garamond `34px` weight 300**, autofocused, placeholder `procurar cookies, mel, café…`. Results are inline chips (`gap: 10px`, `margin-top: 26px`): `38 × 38px` thumbnail + `13px` name, `background: #fff`, `1px solid rgba(30,47,82,.14)`, `border-radius: 2px`. Matching is a case-insensitive substring over name + category + description, capped at 8; with an empty query it shows the first 6 products.

---

## Interactions & behaviour

- **Routing** — 8 routes: `home · shop · product · sobre · blog · post · contacto · checkout`. Every navigation closes the cart and the search overlay and scrolls to top. In the real build these must be **real URLs** (`/`, `/produtos`, `/produtos/:id`, `/quem-somos`, `/diario`, `/diario/:id`, `/contacto`, `/checkout`) — the prototype fakes it with state.
- **Category filter** — client-side, instant, no page change; cards re-enter with `ophFade`.
- **Add to cart** — lines are keyed `productId|sizeLabel`, so the same product in two sizes is two lines and a repeat add increments quantity. Adding with the card add-on ticked appends a separate `Cartão Personalizado` line at `4,00 €`. Every add fires the toast; card and detail adds also open the drawer.
- **Quantity** — floor of 1 in both the drawer and the detail stepper; `remover` deletes the line outright.
- **Shipping** — `4,90 €`, free at `60,00 €`+, always free for `recolher na loja`.
- **Promo** — `OPHELIA10` (case-insensitive) applies 10% off the subtotal; anything else silently does nothing. Grand total = `subtotal + shipping + card fee − discount`, floored at 0.
- **Accordions** — single-open; clicking the open one closes it.
- **Contact + checkout submit** — `preventDefault` and swap to a success state; no backend. Checkout also empties the cart.
- **Currency** — always `1.234,56 €` (comma decimal, space before `€`). Portuguese formatting throughout; dates are lowercase Portuguese (`28 agosto`), weekdays abbreviated `dom seg ter qua qui sex sáb`.
- **Hover** — photos `scale(1.045)` over `.8s cubic-bezier(.2,.7,.2,1)`; outline buttons fill navy over `.25s`; the primary navy button goes to `#2C4370`; header links go `opacity: .7 → 1`.
- **Responsive** — every grid is `auto-fit`/`auto-fill` with `minmax`, so the layout reflows down to a single column without media queries; type uses `clamp()`. Verify the header's three-column grid and the checkout two-column split at narrow widths — they'll want explicit mobile handling (hamburger nav) in production, which this prototype does **not** include.

### Animations
```css
@keyframes ophFade    { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
@keyframes ophSlide   { from { transform:translateX(100%) }            to { transform:none } }
@keyframes ophVeil    { from { opacity:0 }                             to { opacity:1 } }
@keyframes ophMarquee { from { transform:translateX(0) }               to { transform:translateX(-50%) } }
```

## State management

| State | Type | Notes |
|---|---|---|
| `route` | enum | one of the 8 routes |
| `cat` | enum | active shop filter, default `todos` |
| `productId` / `postId` | string | current detail record |
| `sizeIx` / `qty` / `galleryIx` / `withCard` | int / bool | detail-page selections; reset on every product open |
| `openPanel` | string | open accordion id, default `ing` |
| `cart` | array | `{key, id, name, img, sizeLabel, price, qty}` |
| `cartOpen` / `searchOpen` | bool | overlays |
| `query` | string | search text |
| `sent` / `orderDone` | bool | form success states |
| `shipMode` | `envio` \| `recolha` | |
| `dateIx` / `payId` / `coCard` | int / string / bool | checkout selections |
| `promo` / `promoApplied` | string / bool | |
| `toast` | string | cleared by a 2200ms timer |

No data fetching — the catalogue, articles, reviews, timeline and contact details are static. In production, `products` and `posts` want a CMS or markdown collection (the client will be adding articles), and only the cart and order submission need real server work: order creation, email confirmation, and a payment integration covering MB WAY, Multibanco references and cards (SIBS/Ifthenpay/Stripe are the usual Portuguese options).

## Design tokens

**Colour — surfaces**
| Token | Hex | Use |
|---|---|---|
| Page cream | `#FBF8F3` | body, search sheet, drawer |
| Panel beige | `#F3F0E9` | footer, story band, add-on cards, success panels |
| Hero card | `#F7F2E7` | taped hero card |
| Photo placeholder | `#F1EDE5` | image wells |
| Card white | `#FFFFFF` | cards, paper mounts, boxed inputs |
| Navy | `#1E2F52` | announcement, newsletter, primary buttons, ink |
| Navy hover | `#2C4370` | primary button hover |
| Payment selected | `#EFF2F7` | selected payment row |
| Photo fallback | `#E8E3DA` | behind hero images while loading |

**Colour — ink** (all verified ≥4.5:1 on cream and beige)
| Token | Hex | Use |
|---|---|---|
| Primary | `#1E2F52` | headings, links, body emphasis |
| Body dark | `#2C3E63` | standfirsts, contact values |
| Body | `#3E4F73` | paragraphs |
| Body soft | `#4A5B7F` | ledes, excerpts on white |
| Muted 1 | `#4A5C85` | prices, captions, section labels |
| Muted 2 | `#4F6189` | secondary labels, attribution |
| Muted 3 | `#42537A` | footer body, blog excerpts |
| Muted 4 | `#556790` | kickers, meta, column headings |
| Gold | `#8F6B36` | review stars |
| On navy | `#F6F1E7` | text on navy |
| On photo | `#FBF8F3` / `#FFFFFF` | hero type over scrims |
| Link hover | `#4A5F8A` | `a:hover` |

**Colour — borders & tape**
`rgba(30,47,82,.08 / .1 / .12 / .13 / .14 / .16 / .2 / .24 / .25 / .3)` — hairlines through to button outlines. Tape: `#EDE3D0`, `rgba(232,222,199,.72–.85)`, `rgba(196,209,227,.9)` + `rgba(243,237,224,.92)`, and the scotch gradient above. Scrims: `rgba(30,47,82,.32 / .34)` for veils, `rgba(24,38,66,.5–.76)` for the sobre hero.

**Typography**
| Family | Weights | Use |
|---|---|---|
| **Beth Ellen** (`assets/BethEllen-Regular.ttf`, `@font-face`, `font-display: swap`) | 400 | all large display titles — h1/h2, hero, newsletter |
| **Cormorant Garamond** (Google) | 300, 400, 500 + italics | product names, prices, numerals, standfirsts, italic accents |
| **Jost** (Google) | 300, 400, 500 | everything else — UI, body, labels, buttons, nav |

Beth Ellen is handwriting: it needs `line-height: 1.24–1.62` (never tight) and it is only used above ~24px. Below that, or anywhere legibility matters more than character, use Cormorant Garamond.

Scale: display `clamp(24px→70px)` Beth Ellen · section h2 `31–37px` Beth Ellen · product name `20px` Cormorant · standfirst `23px` Cormorant · body `14.5–15px` / `line-height: 1.95–2.05` · secondary `12.5–13.5px` · label `10–11.5px` with `letter-spacing: .14em–.44em` uppercase.

**Spacing** — 4px-ish scale in use: `4 5 6 7 8 9 10 11 12 13 14 15 16 18 20 22 24 26 30 32 34 36 38 40 44 48 52 56 60 64 70 76 80 88 90 96 110px`. Page gutter `34px`; content `max-width: 1360px` (shop/home), `1260px` (product, contacto), `1180px` (sobre), `760px` (article).

**Radius** — essentially none: `2px` on pills and chips, `0` everywhere else. **Do not round the cards** — the flat paper edge is the point.

**Shadows** — `0 1px 2px rgba(30,47,82,.12)` (small tape) · `0 1px 3px rgba(30,47,82,.1–.16)` (tape) · `0 3px 16px rgba(30,47,82,.08)` (small mount) · `0 3px 18px rgba(30,47,82,.07)` (review card) · `0 4px 22–24px rgba(30,47,82,.07–.08)` (panels) · `0 6px 26–28px rgba(30,47,82,.1–.11)` (large mount) · `0 8px 30px rgba(30,47,82,.14)` (hero card) · `-8px 0 40px rgba(30,47,82,.2)` (drawer).

## Configurable props

Three values are exposed as tweakable props and should become configuration (env, CMS settings or theme options) rather than hard-coded literals:
- `showAnnouncement` — boolean, default `true`
- `freeShippingFrom` — default `60` €
- `shippingRate` — default `4.9` €

## Assets

All client-supplied, all in `design/`:
- `assets/logo-azul.png`, `assets/logo-branco.png` — navy and white script wordmarks
- `assets/bg-flowers.png` — watercolour floral background (used at `opacity: .42`, `mix-blend-mode: multiply`)
- `assets/frame-flowers.png` — watercolour floral bottom frame
- `assets/icon-cesto.png` — basket icon · `assets/icon-menu.png` — menu icon (**unused** — no mobile nav in this prototype; it's there for whoever builds one)
- `assets/BethEllen-Regular.ttf` — display face
- `photos/` — the client's photography, prefixed by shoot: `p##` packaged product · `e##` the shop interior · `k##` the kitchen · `m##` menu · `n##` Christmas catalogue · `a##` Easter · `b##` drinks · `c##` food · `g#` packaging renders (jars, boxes, cards)

Google Fonts are loaded from `fonts.googleapis.com` (Cormorant Garamond + Jost); Beth Ellen is a local `@font-face`. Self-host all three in production.

## Open items — must be confirmed before launch

These are **invented placeholders**, not client data:
1. **Contact details** — the address is `Estoril, Cascais (morada completa a confirmar)`; hours (`Terça a domingo · 9h00–18h00`, Monday closed) and the absence of a phone number are all unconfirmed. `data/contact.json`.
2. **Prices for the cakes (`bolos`) and the apron (`avental`)** — not in the client's product document; the six cookie boxes, mercearia, coffee/chai/matcha and granola prices **are** client-supplied and correct.
3. **The three reviews** are written copy, not real customer quotes. `data/reviews.json`.
4. **All six diary articles** are written copy in the client's voice, not client-authored.
5. **Cookie photography** — there are only two studio shots for six cookie SKUs, so `g1.jpeg` / `g2.jpeg` are reused across banoffee, red velvet, the pack especial and the personalizadas. Flagged and accepted by the client, but new photography would fix it.
6. **Christmas panetone** is listed in `bolos` as a December-only item — needs seasonal availability logic.
7. **No mobile navigation.** The desktop nav simply wraps. Design a hamburger/drawer pattern (`assets/icon-menu.png` is provided for it).
8. Legal pages (`Termos e condições`, `Política de privacidade`) are footer links with no destination — the client has the text in a separate document.

## Files

```
design_handoff_ophelia_store/
├── README.md                     ← this document
├── design/
│   ├── Loja Ophelia.dc.html      ← the full design reference (template + logic)
│   ├── support.js                ← runtime needed to open the reference in a browser
│   ├── assets/                   ← logos, florals, icons, display font
│   └── photos/                   ← the client's photography
├── data/
│   ├── products.json             ← 27 products: id, cat, name, tag, img, gallery,
│   │                               desc, sizeLabel, sizes[{label,price}], ing, suggest[]
│   ├── categories.json           ← 6 filter categories
│   ├── posts.json                ← 6 articles: id, kicker, date, img, title, excerpt, body[]
│   ├── reviews.json              ← 3 reviews
│   ├── timeline.json             ← 4 timeline entries
│   ├── contact.json              ← 5 contact info rows
│   └── payment-methods.json      ← 3 payment methods
└── screenshots/                  ← 29 full-width captures, numbered by screen
```

Inside `design/Loja Ophelia.dc.html`, the data lives at the top of the `<script data-dc-script>` block as `PRODUCTS`, `CATS`, `POSTS`, `REVIEWS`, `TIMELINE`, `CONTACT` and `PAY` — the same content as `data/*.json`, which is the copy to build against. The `POSTS` array carries a comment block documenting the article shape, because the client adds articles themselves.
