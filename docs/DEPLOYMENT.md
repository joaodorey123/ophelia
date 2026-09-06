# Deployment

`LOCAL → GITHUB → VERCEL`, with Shopify behind it.

---

## 1. GitHub

The repository is <https://github.com/joaodorey123/ophelia>. `main` is the deployed branch.

Before pushing anything:

```bash
npm run check      # typecheck + lint + unit tests
npm run build      # the production build Vercel will run
```

`.gitignore` covers `.env`, `.env.local`, `.env.*.local`, `node_modules/`, `.next/`, `.vercel` and
the Playwright artefacts. **No token, in any form, belongs in a commit.** If one is ever pushed,
rotate it in Shopify first and rewrite history second — a rotated token is safe, a deleted line in a
later commit is not.

---

## 2. Vercel

Import the GitHub repository. The defaults are correct: Next.js framework preset, `npm run build`,
Node 20+.

### Environment variables

Set every variable from [`.env.example`](../.env.example) in **Project → Settings → Environment
Variables**. The ones that matter per environment:

| Variable | Production | Preview |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.callmeophelia.com` | leave unset — the deployment URL is used |
| `SHOPIFY_STORE_DOMAIN` | the `*.myshopify.com` domain | same |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | the Headless private token | same |
| `SHOPIFY_STOREFRONT_API_VERSION` | `2026-07` | same |
| `OPHELIA_REVALIDATION_SECRET` | Shopify's webhook signing secret | — |
| `OPHELIA_ENQUIRY_WEBHOOK_URL` | the contact-form endpoint | optional |
| `OPHELIA_FORCE_LOCAL_CATALOGUE` | **never set** | **never set** |

Only `NEXT_PUBLIC_SITE_URL` is exposed to the browser. Everything else is server-only, and the
build fails loudly rather than silently shipping a token if that is ever confused.

`OPHELIA_FORCE_LOCAL_CATALOGUE=true` throws on a production deployment. That is intentional: the
fixture has no cart and no checkout, and a shop that cannot take an order must never look like one
that can.

### Build-time behaviour

`generateStaticParams` for products and collections is wrapped in a try/catch: if Shopify is
unreachable while Vercel is building, those pages render on demand instead of failing the build. A
temporary Shopify outage cannot break a deploy.

The sitemap degrades the same way — it serves the static pages rather than a 500.

---

## 3. Images

`next.config.ts` allows exactly one remote host, `cdn.shopify.com`. Product photography is
Shopify's; editorial photography and brand artwork ship from `/public`. Image optimisation is on
everywhere — nothing is disabled to make a picture appear.

If you later serve images from another host, add it to `images.remotePatterns` rather than turning
optimisation off.

---

## 4. Custom domain

Add the domain in Vercel, point DNS at it, then set `NEXT_PUBLIC_SITE_URL` to the canonical origin
(no trailing slash) and redeploy. Until you do, canonicals, Open Graph URLs, `sitemap.xml` and
`robots.txt` will point at the Vercel URL.

Preview deployments serve `Disallow: /` so a staging URL never competes with production in the
index.

---

## 5. After the first deploy

1. `npm run shopify:doctor` against the production values.
2. Check `https://<domain>/sitemap.xml` and `/robots.txt`.
3. Add the Shopify webhooks pointing at `https://<domain>/api/revalidate`
   (see [SHOPIFY.md](SHOPIFY.md#7-keeping-the-cache-fresh)).
4. Remove the Shopify store password, or checkout lands customers on the password page.
5. Configure the shipping rate that matches the free-shipping threshold the cart advertises.
