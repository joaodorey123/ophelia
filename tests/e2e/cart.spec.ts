import { expect, test } from '@playwright/test';

/**
 * The cart and the Shopify checkout hand-off.
 *
 * A cart is Shopify's, not ours: the development fixture deliberately has no
 * cart, because a cart that cannot become an order is exactly the kind of
 * pretend commerce this project refuses to ship. So this suite runs only when
 * pointed at a real store:
 *
 *   E2E_COMMERCE=shopify npx playwright test cart
 *
 * with SHOPIFY_STORE_DOMAIN and a Storefront token in the environment, and
 * E2E_PRODUCT_HANDLE naming a product published to the Headless channel.
 */
const SHOPIFY = process.env.E2E_COMMERCE === 'shopify';
const HANDLE = process.env.E2E_PRODUCT_HANDLE ?? 'ophelia-cookies';

test.describe('cart', () => {
  test.skip(
    !SHOPIFY,
    'Needs a real Shopify store: set E2E_COMMERCE=shopify and Shopify credentials.',
  );

  test('the buy panel resolves a real variant and prices it', async ({ page }) => {
    await page.goto(`/produto/${HANDLE}`);
    const add = page.getByRole('button', { name: /juntar ao cesto/i });

    const initial = await add.innerText();
    expect(initial).toMatch(/\d+,\d{2}\s€/);

    // Picking a different option must change the resolved variant, and so the
    // price — not merely the look of the chosen tile.
    const options = page.locator('[class*="values"] button:not([disabled])');
    if ((await options.count()) > 1) {
      await options.nth(1).click();
      await expect
        .poll(async () => add.innerText(), { timeout: 5000 })
        .not.toBe(initial);
    }
  });

  test('quantity has a floor of one and multiplies the total', async ({ page }) => {
    await page.goto(`/produto/${HANDLE}`);
    const minus = page.getByRole('button', { name: 'Diminuir quantidade' });
    await expect(minus).toBeDisabled();

    const add = page.getByRole('button', { name: /juntar ao cesto/i });
    const one = await add.innerText();
    await page.getByRole('button', { name: 'Aumentar quantidade' }).click();
    await expect.poll(async () => add.innerText(), { timeout: 5000 }).not.toBe(one);
  });

  test('adding opens the drawer, and the drawer is the same cart as the page', async ({ page }) => {
    await page.goto(`/produto/${HANDLE}`);
    await page.getByRole('button', { name: /juntar ao cesto/i }).click();

    const drawer = page.getByRole('dialog', { name: 'O teu cesto' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading')).toContainText('(1)');
    await expect(page.locator('header [class*="count"]')).toHaveText('1');

    const subtotal = await drawer.locator('[class*="subtotalValue"]').innerText();
    expect(subtotal).toMatch(/\d+,\d{2}\s€/);

    await page.goto('/carrinho');
    await expect(page.getByText('o cesto está vazio')).toBeHidden();
  });

  test('a line can be stepped and removed, and the cart empties honestly', async ({ page }) => {
    await page.goto(`/produto/${HANDLE}`);
    await page.getByRole('button', { name: /juntar ao cesto/i }).click();
    await expect(page.getByRole('dialog', { name: 'O teu cesto' })).toBeVisible();

    await page.goto('/carrinho');
    const total = page.locator('[class*="totalValue"]');
    const before = await total.innerText();

    await page.getByRole('button', { name: /^Aumentar quantidade/ }).first().click();
    await expect.poll(async () => total.innerText(), { timeout: 10_000 }).not.toBe(before);

    await page.getByRole('button', { name: /^Remover/ }).first().click();
    await expect(page.getByText('o cesto está vazio')).toBeVisible();
  });

  test('the cart survives a reload', async ({ page }) => {
    await page.goto(`/produto/${HANDLE}`);
    await page.getByRole('button', { name: /juntar ao cesto/i }).click();
    await expect(page.locator('header [class*="count"]')).toHaveText('1');

    await page.reload();
    await expect(page.locator('header [class*="count"]')).toHaveText('1');
  });

  test('checkout hands off to Shopify and never collects payment here', async ({ page }) => {
    await page.goto(`/produto/${HANDLE}`);
    await page.getByRole('button', { name: /juntar ao cesto/i }).click();

    const drawer = page.getByRole('dialog', { name: 'O teu cesto' });
    await drawer.getByRole('button', { name: /finalizar encomenda/i }).click();

    await page.waitForURL(/myshopify\.com|shopify\.com|checkout/, { timeout: 30_000 });
    expect(page.url()).not.toContain('localhost');
  });
});

test.describe('cart without Shopify', () => {
  test.skip(SHOPIFY, 'This is the fixture-only behaviour.');

  test('the empty drawer offers the shop rather than a fake checkout', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Abrir o cesto/ }).first().click();

    const drawer = page.getByRole('dialog', { name: 'O teu cesto' });
    await expect(drawer.getByText('o cesto está vazio')).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'ver os produtos' })).toBeVisible();
    // No checkout button is offered for an empty cesto.
    await expect(drawer.getByRole('button', { name: /finalizar encomenda/i })).toBeHidden();
  });
});
