# Design notes

Where the implementation departs from the prototype in `design-handoff/`, and why. The handoff is
the visual and UX contract; everything below is a deliberate, reviewable decision, not drift.

---

## Deliberate departures

### 1. Stub links now go to real destinations

The prototype's navigation pointed everything at the nearest built page — Mercearia, Presentes and
Eventos all landed on Cookies or Home, because those screens did not exist. They now go where their
labels say. Same for the footer's Lifestyle, Envios e devoluções and Termos e privacidade.

### 2. "Criar presente" is now "Ver os presentes"

The homepage gifting CTA read **Criar presente**, which promises a gift configurator. The gift
builder is explicitly out of scope, so the label would be a promise the site cannot keep. The
button keeps its position, styling and prominence and links to `/comprar/presentes`; only the words
changed. **Revert the label the day a configurator is designed and built** — not before.

### 3. Eventos is in the mobile menu

The prototype's mobile menu listed four items (Cookies, Mercearia, Presentes, Quem Somos) while the
desktop nav listed five. Eventos is now a real page with an enquiry form, and leaving it
unreachable on phones would put a whole section behind a desktop-only door. The handoff's own text
describes the mobile menu as mirroring the nav, so this reads as a prototype oversight.

### 4. "Lista de desejos" removed from the mobile menu

The prototype showed a static line, `Procurar · Conta · Lista de desejos`. Search and account are
real routes and are now links. A wishlist does not exist anywhere in the design or the brief, so
rather than link to nothing, the word is gone. Restore it when a wishlist is designed.

### 5. Container queries became viewport queries

The prototype sized type and spacing against its container (`cqw`) because it rendered the phone
view inside a 430px shell. In production the container **is** the viewport, so every `Ncqw` became
`Nvw` with the same clamp bounds (`styles/tokens.css`). Endpoints match the handoff's size table
exactly; intermediate widths differ by a few pixels, which is inherent to the translation.

### 6. Checkout, gallery, motion

- "Continuar para pagamento" closed the drawer in the prototype. It now redirects to Shopify's
  checkout — or, without Shopify, explains why it cannot.
- Gallery thumbnails were presentational. They now cross-fade the main image, as the handoff asked
  production to implement.
- `prefers-reduced-motion` disables the hero fade, drawer slide and toast. The handoff asked for
  this and noted the prototype did not do it.

### 7. Product pages carry ingredients

Not in the prototype, but the client's product document supplies a full ingredient list per SKU,
and this is food sold online. The block sits under the shipping note in the same type scale and is
omitted entirely when the metafield is unset.

### 8. The hero's height cap now holds

The handoff sets the hero to `min-height: 74cqw; max-height: 820px`. In CSS a `min-height` always
wins over a `max-height`, so the cap never applied: at a 1440px viewport the prototype's hero stood
1066px tall and pushed the buttons and the whole second section below the fold. The written spec is
unambiguous about the intent, so the implementation uses `min-height: min(74vw, 820px)` — 74% of the
viewport width on narrow screens, capped at 820px on wide ones, which is what the contract says.

This is the one place where the prototype's rendered behaviour and its documentation disagree.

### 9. Two contrast corrections to the palette

Measured against WCAG 2.1 AA, two parts of the approved palette fail for the text they carry. Both
are corrected with **added tokens**, not by editing the brand colours — reverting is a two-line
change in `styles/tokens.css`.

**Terracotta.** `#C67139` measures **3.35:1 on cream** and **2.94:1 on sand**: under AA for text,
and on sand under even the 3:1 large-text floor. The handoff is aware of the risk — *"Body copy is
never set in terracotta or blue at paragraph size on cream (contrast)"* — but still sets kickers
(11px), the `01/02/03` numerals (20px), the gift message (12px) and the category badge in it.

- `--oph-terracotta-ink: #a0521f` — **5.24:1 on cream, 4.61:1 on sand**. Used for terracotta text
  under 24px and for the badge fill.
- `--oph-terracotta-light: #e3a171` — **5.80:1 on blue, 6.96:1 on blue-deep**. Used for the footer
  link hover, where going darker would make things worse.
- `--oph-terracotta: #c67139` — **unchanged**, and still carries the Quem Somos chapter years
  (30–52px), where 3.35:1 clears the large-text threshold.

**The muted ink scale.** The three lightest levels carry meta lines, breadcrumbs and captions at
10.5–12.5px and measure 3.18:1, 3.69:1 and 4.30:1 on cream. The six tiers and their hierarchy are
kept; the floor is raised so every tier passes on both grounds (≥4.85:1 on cream, ≥4.64:1 on sand):

| Token | Handoff | Now | On cream |
| --- | --- | --- | --- |
| `--oph-ink-50` | .50 | .64 | 4.85:1 |
| `--oph-ink-55` | .55 | .66 | 5.22:1 |
| `--oph-ink-60` | .60 | .68 | 5.55:1 |
| `--oph-ink-65` | .65 | .70 | 5.90:1 |
| `--oph-ink-72` | .72 | .72 | 6.36:1 |
| `--oph-ink-75` | .75 | .75 | 6.99:1 |

Token names keep the handoff's numbering so the mapping back to the design stays readable. The
blue and cream pairings all pass comfortably and were not touched: ink on cream 15.4:1, blue on
cream 11.8:1, cream on blue 11.8:1, cream on blue-deep 14.1:1.

**This is the one place the implementation changes an approved colour value**, and it is flagged
here for sign-off rather than made quietly.

---

## Defects found by the QA pass

Each of these was a real bug in the first implementation, found by the browser suite and fixed.
They are recorded here because several of them were invisible in a screenshot.

| Defect | Symptom | Fix |
| --- | --- | --- |
| **No animation ran at all** | CSS Modules scope `animation-name`, so `animation: ophFade …` inside a module resolved to a scoped name with no matching `@keyframes`. The hero fade, drawer slide and toast were silently dead. | The keyframes stay global; components apply `.oph-animate-fade` / `-drawer` / `-toast` utility classes. Guarded by a test that asserts `getAnimations().length > 0`. |
| **The page scrolled sideways** | The top-right watercolour bleeds to `right: -6%`, and nothing clipped it — 86px of real horizontal scroll at 1440, 23px at 390. | Section wrappers clip their own overflow, as the prototype's shell did. |
| **Lost updates in the cart stepper** | Five rapid `+` clicks settled on 3 items, not 6: each click read `line.quantity` from the last render, so later responses overwrote earlier ones. | `stepLine(id, delta)` accumulates the target quantity in a ref and ignores a stale response when a newer click is outstanding. |
| **Heading levels skipped** | Collection and search pages went `h1` → `h3`, because the product card hardcoded `h3` for its homepage context. | Cards take a `headingLevel` prop; collections and search pass `2`. |
| **Duplicate SKUs** | The coffee's two 250 g variants generated the same SKU, which would have shipped in the Product structured data. | SKUs are built from an accent-folded slug plus the variant index. |
| **Soft 404s** | `notFound()` returned HTTP 200, because a root `loading.tsx` opened a Suspense boundary that flushed the response before the status could be set. | Removed the root loading file; 404s now return 404. |
| **Global cache purge on every add-to-cart** | `revalidatePath('/', 'layout')` threw away cached catalogue renders for every visitor whenever anyone added an item. | `refresh()`, which refreshes only the calling client's router cache. |
| **Contrast failures** | The "photography missing" caption measured 2.44:1 on sand; inline links in prose were distinguished by colour alone (1.85:1 against the surrounding ink). | Caption uses the muted-ink scale; links inside `p` and `address` carry an underline. The handoff scopes its "no underline" rule to the footer and nav. |
| **Sub-44px tap targets on phone** | Footer links (21px), sort chips (37px), the quantity stepper (40px), the mobile wordmark (40px) and "Ver tudo" (24px). | Phone-only minimums. "Ver tudo" keeps its 1px rule on an inner span so the rule stays tight to the text while the link grows. |
| **A live region that never updated** | The catalogue banner carried `role="status"`, so screen readers announced a static notice as a status change. | Removed the role. |

---

## Screens built without a design

These did not exist in the handoff. They are built in the approved visual language — the same
tokens, type scale, grids and component anatomy — and should get a design pass before launch.

| Screen | Built as |
| --- | --- |
| `/carrinho` | The drawer's anatomy in a two-column page layout, with a sticky summary panel |
| `/pesquisa` | A pill search field, the pantry-card grid for results, sand chips for suggestions |
| `/eventos` | The category header block, a sand two-column band, then the form |
| `/personalizadas` | The same, plus the price ladder as option-style cards |
| `/conta`, `/conta/encomendas` | Sand panels and bordered cards on the cream ground |
| 404 and error | The centred Quem Somos opening treatment, with the watercolour wash |
| `/envios-e-devolucoes`, `/termos-e-privacidade` | Long-form measure at 76ch, no decorative furniture |

---

## The missing photography

Every image is an **unfilled slot** that keeps its designed height, radius, crop and responsive
behaviour, and shows the intended shot as a caption over the sand ground — never a broken image,
never stock photography, never an invented Ophelia product.

The moment Shopify has product images, `ImageSlot` renders them and the captions disappear. Nothing
else has to change.

Aspect ratios from the handoff's photography brief: hero ~21:9, favourite and category cards 3:4,
mercearia 4:5, product main and thumbnails 1:1, story rows 4:3. Story imagery keeps the design
system's `.washed` treatment so it sits behind product imagery.

The only generated images in the repository are the Open Graph card and the favicons in
`public/brand/`, composed from supplied brand artwork — the wordmark and the wildflower border.
No product photography has been fabricated.

### One deliberate exception: the homepage hero

`public/photography/hero-cookie-jars.jpg` is a stock photograph (Pexels, photographer og_mpango),
placed in the hero slot at the client's explicit request after I flagged it as stock and recommended
against it — the shot shows a generic café's cookie jars, including a visible "Macadamia Cookies"
label that has nothing to do with Ophelia. It is **not** Ophelia product photography and does not
meet the "no stock photography" rule this document otherwise holds to everywhere else.

Treat it as a temporary placeholder, not as approved art direction: swap it for the real hero shot
from the photography brief above the moment one exists, and remove this note when that happens.

## Content provenance

Nothing on the site is invented. Every claim traces to something the client supplied:

| Content | Source |
| --- | --- |
| Product names, sizes, prices | Handoff data model + "Ophelia — PRODUTOS SITE" |
| Product descriptions, ingredients | "Ophelia — PRODUTOS SITE" |
| The Quem Somos story | "Ophelia — Quem somos" |
| Legal, shipping, returns, cookies | "Ophelia — TERMOS E CONDIÇÕES + POLÍTICAS DE PRIVACIDADE" |
| Company identity, address, contacts | The same document |
| Section copy, kickers, CTAs | The prototype, verbatim |

There are no reviews, ratings, certifications, awards, sustainability or nutritional claims
anywhere in the markup or the structured data, because the business has not made any.

### Conflicts left unresolved

The client's product document contains material the approved design does not:

- **Cookies NY** — 6/8/12 units at €30/€40/€60. Not in the design; not implemented.
- **Chai da Ophelia** and **Matcha da Ophelia** — both carry the coffee entry's description and
  price verbatim, evidently placeholders. Not implemented.
- **Avental da Ophelia** — price marked TBC in both sources. Not implemented.

All three need a decision from the client rather than a guess from the code.
