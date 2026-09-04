import { expect, test } from '@playwright/test';

import { ALL_ROUTES, VIEWPORTS } from './routes';

/**
 * Layout integrity across every width in the QA brief.
 *
 * Runs in the desktop project only — it drives the viewport itself, so running
 * it twice would just repeat the same assertions.
 */
test.describe('responsive layout', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(viewport.name, () => {
      for (const route of ALL_ROUTES) {
        test(`${route} has no horizontal overflow`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(route, { waitUntil: 'domcontentloaded' });

          // The document must never scroll sideways.
          const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(
            overflow.scrollWidth,
            `${route} scrolls horizontally at ${viewport.width}px`,
          ).toBeLessThanOrEqual(overflow.clientWidth + 1);

          // No individual element may stick out past the viewport either.
          const offenders = await page.evaluate(() => {
            const limit = document.documentElement.clientWidth + 1;
            const bad: { tag: string; cls: string; right: number; text: string }[] = [];
            for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
              const style = getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden') continue;
              // Deliberate decoration and hidden inputs are exempt — but the
              // page must still not scroll, which the check above enforces.
              if (el.closest('[aria-hidden="true"]')) continue;
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              if (rect.right > limit || rect.left < -1) {
                bad.push({
                  tag: el.tagName,
                  cls: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
                  right: Math.round(rect.right),
                  text: (el.textContent ?? '').trim().slice(0, 40),
                });
              }
            }
            return bad.slice(0, 5);
          });
          expect(offenders, `${route} at ${viewport.width}px`).toEqual([]);
        });
      }
    });
  }
});

test.describe('touch targets on phones', () => {
  for (const route of ['/', '/comprar/cookies', '/produto/ophelia-cookies', '/eventos']) {
    test(`${route} keeps interactive controls at 44px on a phone`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const small = await page.evaluate(() => {
        const bad: { text: string; w: number; h: number }[] = [];
        const controls = document.querySelectorAll<HTMLElement>(
          'button, a[href], input:not([type=hidden]), select, textarea',
        );
        for (const el of Array.from(controls)) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (el.closest('[aria-hidden="true"]')) continue;

          // Inline links inside running text are exempt (WCAG 2.2 target-size
          // exception), as is a card title whose image is the large target.
          const inline = el.closest('p, address, li, ol, h1, h2, h3, h4');
          if (el.tagName === 'A' && inline) continue;

          // A control wrapped in its own label is tapped through the label.
          const label = el.closest('label');
          if (label && label.getBoundingClientRect().height >= 44) continue;
          if (rect.height < 44) {
            bad.push({
              text: (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 40),
              w: Math.round(rect.width),
              h: Math.round(rect.height),
            });
          }
        }
        return bad;
      });
      expect(small, `${route} has sub-44px tap targets`).toEqual([]);
    });
  }
});
