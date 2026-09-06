import { expect, test, type Page } from '@playwright/test';

import { ALL_ROUTES, PUBLIC_ROUTES } from './routes';

test.describe('every route resolves', () => {
  for (const route of ALL_ROUTES) {
    test(`${route} responds 200`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), route).toBe(200);
    });
  }
});

test.describe('missing things are real 404s', () => {
  test('an unknown product handle', async ({ page }) => {
    const response = await page.goto('/produto/nao-existe');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('não encontrámos');
  });

  test('an unknown collection handle', async ({ page }) => {
    const response = await page.goto('/comprar/nao-existe');
    expect(response?.status()).toBe(404);
  });

  test('an unknown article', async ({ page }) => {
    const response = await page.goto('/diario/nao-existe');
    expect(response?.status()).toBe(404);
  });

  test('an unknown page', async ({ page }) => {
    const response = await page.goto('/nada-aqui');
    expect(response?.status()).toBe(404);
  });
});

test.describe('no dead links', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no placeholder or empty links`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.$$eval('a[href]', (nodes) =>
        nodes.map((node) => node.getAttribute('href') ?? ''),
      );
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(href, `${route} has a placeholder link`).not.toBe('#');
        expect(href, `${route} has an empty link`).not.toBe('');
        expect(href, `${route} has a TODO link`).not.toMatch(/^(javascript:|undefined|null)/);
      }
    });
  }

  test('every internal link on the home page resolves', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.$$eval('a[href^="/"]', (nodes) =>
      nodes.map((node) => node.getAttribute('href') ?? ''),
    );
    const unique = [...new Set(hrefs)].filter((href) => !href.startsWith('//'));
    expect(unique.length).toBeGreaterThan(5);
    for (const href of unique) {
      const response = await request.get(href);
      expect(response.status(), `${href} is broken`).toBeLessThan(400);
    }
  });
});

test.describe('primary navigation', () => {
  const LABELS = ['início', 'produtos', 'quem somos', 'diário', 'contacto'];

  /**
   * Below 900px the nav row is replaced by a drawer, so reaching the same
   * links means opening the menu first. Returns whichever nav is on screen.
   */
  async function openNav(page: Page) {
    const burger = page.getByRole('button', { name: 'Abrir menu' });
    if (await burger.isVisible()) {
      await burger.click();
      return page.getByRole('dialog', { name: 'Menu' }).getByRole('navigation', {
        name: 'Principal',
      });
    }
    return page.getByRole('navigation', { name: 'Principal' }).first();
  }

  test('links to the real routes', async ({ page }) => {
    await page.goto('/');
    const nav = await openNav(page);
    for (const label of LABELS) {
      await expect(nav.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
    }
  });

  test('"produtos" stays current on a product page', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies-ny');
    const nav = await openNav(page);
    await expect(nav.getByRole('link', { name: 'produtos', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('"diário" stays current on an article', async ({ page }) => {
    await page.goto('/diario/granola');
    const nav = await openNav(page);
    await expect(nav.getByRole('link', { name: 'diário', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('a category pill opens that collection', async ({ page }) => {
    await page.goto('/comprar');
    await page.getByRole('link', { name: 'cookies', exact: true }).first().click();
    await expect(page).toHaveURL(/\/comprar\/cookies$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('cookies');
  });

  test('a product card opens the product page', async ({ page }) => {
    await page.goto('/comprar/cookies');
    await page.getByRole('link', { name: 'Ophelia Cookies NY', exact: true }).first().click();
    await expect(page).toHaveURL(/\/produto\/ophelia-cookies-ny$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ophelia Cookies NY');
  });
});

test.describe('legacy URLs redirect', () => {
  for (const [from, to] of [
    ['/blog', '/diario'],
    ['/contact', '/contacto'],
    ['/produtos', '/comprar'],
    ['/checkout', '/carrinho'],
  ] as const) {
    test(`${from} -> ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`${to}$`));
    });
  }
});

test.describe('robots and sitemap', () => {
  test('robots.txt keeps transactional routes out', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Disallow: /carrinho');
    expect(body).toContain('Disallow: /pesquisa');
    expect(body).toContain('Sitemap:');
  });

  test('sitemap lists public pages only, without duplicates', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '');

    expect(locs.length).toBeGreaterThan(10);
    for (const excluded of ['/carrinho', '/pesquisa', '/api/']) {
      expect(locs.some((loc) => loc.includes(excluded)), `${excluded} is in the sitemap`).toBe(
        false,
      );
    }
    expect(new Set(locs).size, 'sitemap contains duplicates').toBe(locs.length);
    expect(locs.some((loc) => loc.endsWith('/diario')), 'diary missing').toBe(true);
    expect(locs.some((loc) => loc.includes('/produto/')), 'products missing').toBe(true);
  });
});
