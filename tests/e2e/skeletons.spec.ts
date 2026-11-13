import { expect, test, type Page } from '@playwright/test';

/** Holds the client navigation's server answer, so the wait is visible. */
async function slowNavigations(page: Page, ms: number) {
  await page.route('**/*', async (route) => {
    if (route.request().headers()['rsc'] === '1') await new Promise((done) => setTimeout(done, ms));
    await route.continue();
  });
}

const skeleton = (page: Page) => page.locator('[aria-busy="true"]');

test.describe('route skeletons', () => {
  test('a slow collection shows its skeleton, then the real page', async ({ page }) => {
    await page.goto('/comprar');
    await slowNavigations(page, 1500);
    await page.getByRole('link', { name: 'cookies', exact: true }).first().click();

    await expect(skeleton(page)).toBeVisible();
    // The pill the visitor chose is already the active one.
    await expect(skeleton(page).getByText('cookies', { exact: true }).first()).toBeVisible();

    await expect(page).toHaveURL(/\/comprar\/cookies$/);
    await expect(skeleton(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('cookies');
  });

  test('a slow product shows its skeleton, then the real page', async ({ page }) => {
    await page.goto('/comprar/cookies');
    await slowNavigations(page, 1500);
    await page.getByRole('link', { name: 'Ophelia Cookies NY', exact: true }).first().click();

    await expect(skeleton(page)).toBeVisible();
    await expect(page).toHaveURL(/\/produto\/ophelia-cookies-ny$/);
    await expect(skeleton(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ophelia Cookies NY');
  });

  test('a fast navigation never flashes a skeleton', async ({ page }) => {
    await page.goto('/comprar');
    await page.evaluate(() => {
      (window as unknown as { sawSkeleton: boolean }).sawSkeleton = false;
      new MutationObserver(() => {
        if (document.querySelector('[aria-busy="true"]')) {
          (window as unknown as { sawSkeleton: boolean }).sawSkeleton = true;
        }
      }).observe(document.body, { subtree: true, childList: true });
    });
    await page.getByRole('link', { name: 'cookies', exact: true }).first().click();
    await expect(page).toHaveURL(/\/comprar\/cookies$/);
    expect(await page.evaluate(() => (window as unknown as { sawSkeleton: boolean }).sawSkeleton)).toBe(
      false,
    );
  });

  test('missing products are still real 404s', async ({ page }) => {
    const response = await page.goto('/produto/nao-existe');
    expect(response?.status()).toBe(404);
  });
});
