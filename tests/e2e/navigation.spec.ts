import { expect, test } from '@playwright/test';

import { ALL_ROUTES, PUBLIC_ROUTES } from './routes';

test.describe('routing', () => {
  for (const route of ALL_ROUTES) {
    test(`${route} responds 200`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), route).toBe(200);
    });
  }

  test('an unknown product returns a real 404, not a soft one', async ({ page }) => {
    const response = await page.goto('/produto/nao-existe');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Não encontrámos');
  });

  test('an unknown collection returns a real 404', async ({ page }) => {
    const response = await page.goto('/comprar/nao-existe');
    expect(response?.status()).toBe(404);
  });

  test('an unknown path returns a real 404', async ({ page }) => {
    const response = await page.goto('/nada-aqui');
    expect(response?.status()).toBe(404);
  });
});

test.describe('internal links', () => {
  test('no internal link is a placeholder or dead end', async ({ page, request }) => {
    const seen = new Set<string>();

    for (const route of ALL_ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).map((a) =>
          a.getAttribute('href'),
        ),
      );

      for (const href of hrefs) {
        expect(href, `placeholder link on ${route}`).not.toBe('#');
        expect(href, `placeholder link on ${route}`).not.toBe('');
        if (!href || !href.startsWith('/')) continue;
        seen.add(href.split('#')[0] as string);
      }
    }

    // Every internal destination must actually resolve.
    for (const href of seen) {
      const response = await request.get(href);
      expect(response.status(), `${href} is linked but does not resolve`).toBeLessThan(400);
    }
  });

  test('every primary nav item leads somewhere meaningful', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    const labels = ['Cookies', 'Mercearia', 'Presentes', 'Eventos', 'Quem Somos'];

    for (const label of labels) {
      const link = nav.getByRole('link', { name: label, exact: true });
      await expect(link).toHaveAttribute('href', /.+/);
    }
  });

  test('the active nav item is marked for assistive technology', async ({ page }) => {
    await page.goto('/comprar/cookies');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link', { name: 'Cookies', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('the gifting CTA goes to the Presentes collection, not a configurator', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'Ver os presentes' });
    await expect(cta).toHaveAttribute('href', '/comprar/presentes');
    await cta.click();
    await expect(page).toHaveURL(/\/comprar\/presentes$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Presentes');
  });

  test('breadcrumbs on a product page climb back to its collection', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies');
    const crumbs = page.getByRole('navigation', { name: 'Trilho de navegação' });
    await expect(crumbs.getByRole('link', { name: 'Ophelia' })).toHaveAttribute('href', '/');
    await expect(crumbs.getByRole('link', { name: 'Cookies' })).toHaveAttribute(
      'href',
      '/comprar/cookies',
    );
  });

  test('a category card reaches its product page', async ({ page }) => {
    await page.goto('/comprar/cookies');
    await page.getByRole('link', { name: 'Escolher Ophelia CookieBrownie' }).click();
    await expect(page).toHaveURL(/\/produto\/ophelia-cookiebrownie$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ophelia CookieBrownie');
  });

  test('robots.txt allows the public site and blocks transactional routes', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Allow: /');
    expect(body).toContain('Disallow: /carrinho');
    expect(body).toContain('Disallow: /conta');
    expect(body).toContain('Disallow: /api/');
    expect(body).toContain('Sitemap:');
  });

  test('the sitemap lists only indexable canonical URLs', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    const locs = Array.from(body.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1] as string);

    expect(locs.length).toBeGreaterThan(10);
    for (const route of PUBLIC_ROUTES) {
      expect(locs.some((loc) => loc.endsWith(route === '/' ? '/' : route)), `${route} missing`).toBe(
        true,
      );
    }
    for (const excluded of ['/carrinho', '/conta', '/pesquisa', '/api/', '/comprar/complementos']) {
      expect(locs.some((loc) => loc.includes(excluded)), `${excluded} must not be listed`).toBe(
        false,
      );
    }
    // Every listed URL must actually resolve.
    expect(new Set(locs).size, 'sitemap contains duplicates').toBe(locs.length);
  });
});
