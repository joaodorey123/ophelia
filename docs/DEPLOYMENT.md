# Deployment

## GitHub

The repository is ready to push:

- `.gitignore` excludes `node_modules`, `.next`, `.env`, `.env.local` and `.vercel`.
- **No secrets are committed.** `.env.example` documents every variable with no values.
- `package-lock.json` is committed, so installs are reproducible.

```bash
git init
git add .
git commit -m "Ophelia storefront"
git branch -M main
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main
```

The original design handoff lives in `design-handoff/` and is committed unmodified — it is the
visual contract, and future work should be checked against it.

---

## Vercel

1. **Import the repository.** Vercel detects Next.js; the defaults are correct (build
   `next build`, output `.next`, install `npm install`).
2. **Set environment variables** for Production and Preview, from `.env.example`:

   | Variable | Scope | Required |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | Production | Yes — canonicals, sitemap, Open Graph |
   | `SHOPIFY_STORE_DOMAIN` | Both | For real products |
   | `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Both | For real products |
   | `SHOPIFY_STOREFRONT_API_VERSION` | Both | Optional, defaults to `2025-07` |
   | `SHOPIFY_CUSTOMER_ACCOUNT_*` | Both | Only for customer accounts |
   | `OPHELIA_ENQUIRY_WEBHOOK_URL` | Both | For working forms |
   | `OPHELIA_REVALIDATION_SECRET` | Production | For instant catalogue updates |

   Everything without a `NEXT_PUBLIC_` prefix stays server-side. Do not add that prefix to a
   Shopify token.

3. **Add the domain** and set `NEXT_PUBLIC_SITE_URL` to match it exactly, without a trailing slash.
4. **Deploy.**

### Preview deployments

`robots.ts` disallows everything when `VERCEL_ENV=preview`, so a preview URL never competes with
production in the index. `NEXT_PUBLIC_SITE_URL` may be left unset on previews — the app falls back
to the Vercel deployment URL so canonicals stay coherent.

### After the domain is live

- Update `SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI` and the callback URI registered in Shopify.
- Point the Shopify revalidation webhooks at the production domain.
- Submit `https://<domain>/sitemap.xml` in Google Search Console.

---

## Runtime notes

- No filesystem writes, no `localhost` assumptions, no development-only APIs in the production
  path.
- Routes render on demand because the layout reads the cart cookie. Shopify data underneath is
  cached with tags, so a request assembles cached data rather than refetching it.
- `/api/enquiry` and `/api/revalidate` run on the Node.js runtime.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`) are set in `next.config.ts`. A Content-Security-Policy is **not** set —
  add one once the analytics and consent choices from `INTEGRATIONS.md` §4 are made, so it can be
  written against the real script inventory instead of a guess.

---

## Pre-launch checklist

- [ ] Shopify connected — the terracotta preview banner is gone
- [ ] Products, options, metafields and the five collections created (`docs/SHOPIFY.md`)
- [ ] Product photography uploaded with real `alt` text
- [ ] A test order completes through Shopify checkout
- [ ] `OPHELIA_ENQUIRY_WEBHOOK_URL` set, and a test enquiry arrives
- [ ] Revalidation webhooks registered and firing
- [ ] `NEXT_PUBLIC_SITE_URL` matches the live domain; canonicals are correct
- [ ] Cookie consent mechanism added, as the published policy promises
- [ ] Avental priced and added, or removed from the plan
