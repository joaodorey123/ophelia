import { expect, test, type Page } from '@playwright/test';

import { PRIVATE_ROUTES, PUBLIC_ROUTES } from './routes';

async function head(page: Page) {
  return page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? null,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null,
    ogType: document.querySelector('meta[property="og:type"]')?.getAttribute('content') ?? null,
    twitter: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') ?? null,
    lang: document.documentElement.lang,
  }));
}

test.describe('indexable pages', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has complete, indexable metadata`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const meta = await head(page);

      expect(meta.title, 'title').toBeTruthy();
      expect(meta.description, 'description').toBeTruthy();
      expect(meta.canonical, 'canonical').toContain(route === '/' ? '/' : route);
      expect(meta.robots, 'robots').toContain('index');
      expect(meta.robots).not.toContain('noindex');
      expect(meta.ogTitle, 'og:title').toBeTruthy();
      expect(meta.ogImage, 'og:image').toMatch(/^https?:\/\//);
      expect(meta.twitter, 'twitter:card').toBe('summary_large_image');
      expect(meta.lang).toBe('pt-PT');
    });
  }

  test('titles and descriptions are unique across the site', async ({ page }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();

    for (const route of PUBLIC_ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const meta = await head(page);
      const clashTitle = titles.get(meta.title);
      expect(clashTitle, `${route} shares its title with ${clashTitle}`).toBeUndefined();
      titles.set(meta.title, route);

      const clashDescription = descriptions.get(meta.description ?? '');
      expect(
        clashDescription,
        `${route} shares its description with ${clashDescription}`,
      ).toBeUndefined();
      descriptions.set(meta.description ?? '', route);
    }
  });
});

test.describe('non-indexable pages', () => {
  for (const route of PRIVATE_ROUTES) {
    test(`${route} is excluded from the index`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const meta = await head(page);
      expect(meta.robots, route).toContain('noindex');
    });
  }

  /*
   * Query strings must never fork a page into several indexable URLs. The
   * handoff has no sort control, but paging carries a Shopify cursor, and a
   * cursor in a canonical would put an unbounded number of near-duplicate URLs
   * into the index.
   */
  test('query strings do not fork the canonical URL', async ({ page }) => {
    for (const url of [
      '/comprar/cookies?cursor=abc123',
      '/comprar/cookies?utm_source=instagram',
    ]) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const meta = await head(page);
      expect(meta.canonical, url).toMatch(/\/comprar\/cookies$/);
    }
  });
});

test.describe('document structure', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has exactly one h1 and an ordered heading tree`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const headings = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({
          level: Number(h.tagName[1]),
          text: (h.textContent ?? '').trim().slice(0, 50),
        })),
      );

      const h1s = headings.filter((h) => h.level === 1);
      expect(h1s.length, `${route} h1 count`).toBe(1);

      let previous = 0;
      for (const heading of headings) {
        if (previous !== 0) {
          expect(
            heading.level - previous,
            `${route} jumps from h${previous} to h${heading.level} at "${heading.text}"`,
          ).toBeLessThanOrEqual(1);
        }
        previous = heading.level;
      }
    });

    test(`${route} uses semantic landmarks`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('header').first()).toBeVisible();
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('footer').first()).toBeVisible();
    });
  }
});

test.describe('structured data', () => {
  async function jsonLd(page: Page) {
    return page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .flatMap((s) => {
          const parsed = JSON.parse(s.textContent ?? 'null');
          return Array.isArray(parsed) ? parsed : [parsed];
        })
        .filter(Boolean),
    );
  }

  test('every page carries Organization and WebSite', async ({ page }) => {
    await page.goto('/');
    const types = (await jsonLd(page)).map((node) => node['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');
  });

  test('a product page carries Product, Offer and BreadcrumbList matching the page', async ({
    page,
  }) => {
    await page.goto('/produto/ophelia-cookies-ny');
    const nodes = await jsonLd(page);
    const product = nodes.find((node) => node['@type'] === 'Product');
    expect(product).toBeTruthy();
    expect(nodes.some((node) => node['@type'] === 'BreadcrumbList')).toBe(true);

    // The schema price must be the price the customer is shown. Prices render
    // in the handoff's Portuguese format, "30,00 EUR" with a comma decimal.
    const shown =
      (await page.locator('main').getByText(/\d+,\d{2}\s*€/).first().textContent()) ?? '';
    const shownCents = shown.replace(/[^\d,]/g, '').replace(',', '');
    const low = Number(product.offers.lowPrice ?? product.offers.price);
    expect(shownCents).toBe(String(Math.round(low * 100)));

    expect(product.brand.name).toBe('Ophelia');
    expect(product.offers.offers?.[0]?.availability).toContain('schema.org/');
  });

  test('a collection page carries an ItemList of its products', async ({ page }) => {
    await page.goto('/comprar/cookies');
    const list = (await jsonLd(page)).find((node) => node['@type'] === 'ItemList');
    expect(list).toBeTruthy();
    const cards = await page.locator('main article').count();
    expect(list.numberOfItems).toBe(cards);
  });

  test('no page fabricates ratings or reviews', async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const raw = JSON.stringify(await jsonLd(page));
      expect(raw, route).not.toMatch(/aggregateRating|ratingValue|reviewCount/);
    }
  });
});
