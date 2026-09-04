import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { ALL_ROUTES } from './routes';

/**
 * WCAG 2.1 A/AA audit. Colour-contrast is included deliberately: the palette
 * corrections in docs/DESIGN-NOTES.md exist to keep this green.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('axe audit', () => {
  /*
   * Reduced motion makes the audit deterministic: without it axe can sample a
   * toast mid-fade and read a transient contrast failure. It also means every
   * assertion below exercises the reduced-motion path the handoff asked for.
   */
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });
  for (const route of ALL_ROUTES) {
    test(`${route} has no accessibility violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 3),
      }));
      expect(summary, `${route} accessibility violations`).toEqual([]);
    });
  }

  test('the cart drawer is accessible when open', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies');
    await page.getByRole('button', { name: /^Adicionar ao cesto · / }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('the mobile menu is accessible when open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe('keyboard operation', () => {
  test('the skip link is the first stop and reaches the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: 'Saltar para o conteúdo' });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#conteudo$/);
  });

  test('every focusable control shows a visible focus ring', async ({ page }) => {
    await page.goto('/comprar/cookies');

    const hasRing = await page.evaluate(() => {
      const control = document.querySelector<HTMLElement>('main a[href], main button');
      if (!control) return false;
      control.focus();
      const style = getComputedStyle(control);
      return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    });
    expect(hasRing).toBe(true);
  });

  test('the drawer traps focus, closes on Escape and restores focus', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Abrir o cesto' }).filter({ visible: true });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fechar o cesto' }).last()).toBeFocused();

    // Tabbing round the dialog must never land outside it.
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest('[role="dialog"]'),
      );
      expect(inside, `focus escaped the dialog after ${i + 1} tabs`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('the drawer locks body scroll while it is open', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir o cesto' }).filter({ visible: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked', 'true');

    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked', 'true');
  });

  test('the mobile menu closes on Escape and returns focus to the burger', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const burger = page.getByRole('button', { name: 'Menu' });
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(burger).toBeFocused();
  });

  test('the product page is fully operable by keyboard', async ({ page }) => {
    await page.goto('/produto/ophelia-cookies');

    await page.getByRole('button', { name: /12 unidades/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Adicionar ao cesto · €48' })).toBeVisible();

    await page.getByRole('checkbox').focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('textbox', { name: 'A tua mensagem para o cartão' })).toBeVisible();
  });
});

test.describe('motion', () => {
  test('the designed animations actually run', async ({ page }) => {
    await page.goto('/');
    // A CSS Module cannot reference a global keyframes name, so this guards the
    // regression where every animation silently did nothing.
    const running = await page.evaluate(
      () => document.querySelector('.oph-animate-fade')?.getAnimations().length ?? 0,
    );
    expect(running).toBeGreaterThan(0);
  });

  test('the cart drawer slides in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir o cesto' }).filter({ visible: true }).click();
    const running = await page.evaluate(
      () => document.querySelector('.oph-animate-drawer')?.getAnimations().length ?? 0,
    );
    expect(running).toBeGreaterThan(0);
  });

  test('honours prefers-reduced-motion, which the prototype did not', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const hero = await page.evaluate(() => {
      const el = document.querySelector('.oph-animate-fade');
      return el ? getComputedStyle(el).animationDuration : null;
    });
    // Chrome serialises the 0.001ms override as 1e-06s — not the 900ms fade.
    expect(hero).toBe('1e-06s');
  });
});

test.describe('announcements', () => {
  test('adding to the cart is announced politely', async ({ page }) => {
    await page.goto('/');
    const status = page.locator('[role="status"][aria-live="polite"]');
    await expect(status.first()).toBeAttached();

    await page.getByRole('button', { name: 'Adicionar Ophelia Cookies ao cesto' }).click();
    await expect(page.getByText('Ophelia Cookies no cesto')).toBeVisible();
  });

  test('decorative brand artwork is hidden from assistive technology', async ({ page }) => {
    await page.goto('/quem-somos');
    const undecided = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img'))
        .filter((img) => {
          const alt = img.getAttribute('alt');
          // Every image must either have real alt text or be explicitly decorative.
          return alt === null;
        })
        .map((img) => img.getAttribute('src')),
    );
    expect(undecided).toEqual([]);
  });
});
