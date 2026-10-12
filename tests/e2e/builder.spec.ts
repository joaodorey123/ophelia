import { expect, test } from '@playwright/test';

/**
 * The content editor shares this deployment at /builder. It must stay
 * private and must not carry the shop's chrome; signing in and publishing
 * are not exercised here, because publishing commits to the real repository.
 */
test.describe('content editor at /builder', () => {
  test('sends an anonymous visitor to the sign-in screen', async ({ page }) => {
    await page.goto('/builder');
    await expect(page).toHaveURL(/\/builder\/entrar$/);
  });

  test('is kept out of search engines', async ({ page, request }) => {
    const response = await request.get('/builder/entrar');
    expect(response.headers()['x-robots-tag']).toContain('noindex');
    expect(response.headers()['x-frame-options']).toBe('DENY');

    await page.goto('/builder/entrar');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /builder');
  });

  test('renders without the storefront header, footer or cart', async ({ page }) => {
    await page.goto('/builder/entrar');
    await expect(page.locator('.oph-skip-link')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
  });

  test('refuses its API without a session', async ({ request }) => {
    const response = await request.post('/api/builder/publish', { data: {} });
    expect(response.status()).toBe(401);
  });

  test('unknown storefront URLs still get the styled 404 inside the shop', async ({ page }) => {
    const response = await page.goto('/esta-pagina-nao-existe');
    expect(response?.status()).toBe(404);
    await expect(page.locator('.oph-skip-link')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: /não encontrámos esta página/ })).toBeVisible();
  });
});
