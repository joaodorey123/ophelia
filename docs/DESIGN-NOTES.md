# Design notes

Where the build interprets the handoff rather than transcribing it, and why. Anything not listed
here is the handoff's own value, taken verbatim.

The handoff itself is in [`design-handoff/`](../design-handoff/) — README, the HTML reference and
29 screenshots. It is the visual source of truth.

---

## The tape effect

The signature of this design is taped-down photographs, and the handoff is emphatic that the four
tape types are distinct materials and must not collapse into one.

`components/ui/TapedPhoto.tsx` builds the three-layer construction the handoff specifies: an outer
wrapper whose padding gives the tape room to hang off the mount, a white paper mount with its own
shadow, and the photograph carrying a deckle filter.

Placement is a prop, not a variant, because the handoff specifies a different corner, size and
rotation for every photograph on the site. The four materials are classes:

| Type | Where |
| --- | --- |
| `kraft` | Collection cards, the hero card's top strip |
| `torn` | Home story photo, product hero, contact photo, the sobre grid |
| `striped` | Review cards, the article hero |
| `scotch` | The hero card's bottom strip, the sobre portrait |

### The deckle filters

`components/ui/DeckleFilters.tsx` declares both `feTurbulence` / `feDisplacementMap` filters once
per document, verbatim from the handoff. Adjacent photographs alternate between them so no two torn
edges look identical.

They are dropped below 520px and under `prefers-reduced-motion`. A 6–7px displacement is invisible
on a phone, and the filter is the single most expensive thing on the page in Safari.

---

## Typography

Three faces, all self-hosted by `next/font` — no render-blocking request to Google, no layout shift
from a late swap.

| Face | Source | Use |
| --- | --- | --- |
| **Beth Ellen** | `app/fonts/BethEllen-Regular.ttf` (the client's file) | Display only, above ~24px |
| **Cormorant Garamond** | `next/font/google` | Product names, prices, standfirsts, italics |
| **Jost** | `next/font/google` | Everything else |

Beth Ellen is handwriting: `components/ui/Type.tsx` names each display size after where it appears
rather than an abstract ladder, because a generic xs–xl scale would round the handoff's per-screen
`clamp()` values to the wrong number. Line heights never go below 1.24.

`Display` inherits its colour rather than setting it. A heading on the navy newsletter band or over
a photo scrim needs its container's colour, and a colour set on the component would win over those
single-class overrides depending on stylesheet order — which is exactly how the newsletter heading
first rendered navy-on-navy.

---

## Colour and contrast

`styles/tokens.css` is a direct port of the handoff's token tables. Both ends of every stated range
are tokenised so a component picks one rather than inventing a third.

The sobre hero scrim is treated as a **contrast requirement, not decoration** — the handoff measures
the title at 4.68:1 and the kicker at 4.95:1 against the brightest pixel behind them. The kicker
therefore uses a dedicated `onScrim` tone (`#ffffff`) rather than the muted blue used elsewhere,
which would not clear 4.5:1 there.

---

## Grids

Every grid is the handoff's `auto-fit`/`auto-fill` with `minmax`, so the layout reflows to a single
column without media queries.

One change: the home page's collections band uses **`auto-fill`** where the handoff writes
`auto-fit`. How many collections exist is Shopify's decision, and `auto-fit` collapses its empty
tracks — with one collection published, a single 4/5 card stretched into a 1700px-tall billboard.
`auto-fill` keeps the card the size the design draws it at, whatever the count, and is identical
once all six cards are present.

---

## Mobile

The handoff designs a desktop only and explicitly asks production for a hamburger pattern
(`icon-menu.png` is supplied for it). What was added, all below 900px:

- The second header row becomes a left-anchored drawer: a real modal dialog with a focus trap,
  Escape to close, scroll lock and focus restoration.
- The `pesquisar` label collapses to its icon; the sheet itself is unchanged.
- Interactive controls grow to a 44px minimum. Where that would move a design element — the
  underlined text links — the rule moved to an inner span so the link box can grow while the
  underline stays exactly where the design draws it.
- The page gutter tightens from 34px to 20px.
- The footer's columns stack and its links take a 44px row. The handoff has no phone footer.

---

## Motion

The handoff's four keyframes are in `app/globals.css` unchanged: `ophFade`, `ophSlide`, `ophVeil`,
`ophMarquee`.

`prefers-reduced-motion` collapses durations rather than removing animations. Every animation here
starts from `opacity: 0` or an offset, so disabling them outright would leave content invisible.

The announcement marquee is the exception: it stops entirely and centres a single complete strip,
because a frozen marquee would clip a message mid-word.

---

## Where the design meets Shopify

| The design | Implementation |
| --- | --- |
| Category filter pills | Real `/comprar/<handle>` routes, so categories are shareable and indexable. Client-side navigation keeps it instant. |
| Size picker | One selector per Shopify option, labelled with the merchant's own option name. Resolves to a real variant. |
| `juntar ao cesto` on a card | Adds the first purchasable variant and opens the drawer, exactly as the handoff specifies. |
| Tag chip | The product's first Shopify tag, or the `ophelia.badge` metafield. |
| `ingredientes` accordion | The `ophelia.ingredients` metafield. Omitted when absent. |
| Handwritten-card add-on | A real Shopify product (`cartao-personalizado`). Hidden when it is not published — a checkbox that adds nothing to the order is worse than no checkbox. |
| Suggested products | `productRecommendations(intent: RELATED)`, falling back to best sellers on a young catalogue. |
| Collection cards | Editorial artwork from `content/home.json` over real Shopify collections. Cards whose collection is not published are not rendered. |

---

## What was not built

The bespoke checkout page. See the deviations section in the [README](../README.md) and
[SHOPIFY.md](SHOPIFY.md#6-checkout) — it is a prototype mock with no payment behind it, and
checkout belongs to Shopify.
