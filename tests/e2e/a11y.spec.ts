import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { ALL_ROUTES } from './routes';

/** WCAG 2.1 A and AA, which is what the handoff's contrast notes are measured against. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function analyse(page: Page) {
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

test.describe('accessibility', () => {
  for (const route of ALL_ROUTES) {
    test(`${route} has no violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const results = await analyse(page);
      expect(
        results.violations.map((violation) => `${violation.id}: ${violation.help}`),
        route,
      ).toEqual([]);
    });
  }

  test('the search sheet is accessible and traps Escape', async ({ page }) => {
    await page.goto('/');
    // Desktop shows a labelled "pesquisar" button; the phone header shows an
    // icon button with the same accessible name.
    await page
      .getByRole('button', { name: /^pesquisar$/i })
      .filter({ visible: true })
      .first()
      .click();

    const dialog = page.getByRole('dialog', { name: 'Pesquisar' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox')).toBeFocused();

    const results = await analyse(page);
    expect(results.violations.map((violation) => violation.id)).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('the cart drawer is a modal dialog with managed focus', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /Abrir o cesto/ }).first();
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'O teu cesto' });
    await expect(dialog).toBeVisible();
    // Focus moves into the drawer, not left behind on the page.
    await expect(page.getByRole('button', { name: 'Fechar o cesto' }).last()).toBeFocused();
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked', 'true');

    const results = await analyse(page);
    expect(results.violations.map((violation) => violation.id)).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked', 'true');
    // …and returns to whatever opened it.
    await expect(trigger).toBeFocused();
  });

  test('the skip link reaches the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar para o conteúdo' });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#conteudo$/);
  });

  test('the product accordions are keyboard operable and announce state', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies-ny');
    const envio = page.getByRole('button', { name: 'envio' });
    await expect(envio).toHaveAttribute('aria-expanded', 'false');
    await envio.press('Enter');
    await expect(envio).toHaveAttribute('aria-expanded', 'true');
  });

  test('every image either has alt text or is marked decorative', async ({ page }) => {
    await page.goto('/');
    const missing = await page.$$eval('img', (nodes) =>
      nodes
        .filter((node) => !node.hasAttribute('alt') && node.getAttribute('aria-hidden') !== 'true')
        .map((node) => node.getAttribute('src') ?? ''),
    );
    expect(missing).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test('the announcement marquee stops rather than freezing mid-scroll', async ({ browser, baseURL }) => {
    // Set on the context: prefers-reduced-motion has to be true before the
    // stylesheet is evaluated.
    // newContext does not inherit `use`, so baseURL is passed explicitly.
    const context = await browser.newContext({ reducedMotion: 'reduce', baseURL });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[class*="track"]').first()).toHaveCSS('animation-name', 'none');
    await context.close();
  });
});
