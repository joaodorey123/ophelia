import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end, responsive and accessibility suite.
 *
 * Runs against a production build, because that is what ships: dev-only
 * behaviour (loose status codes, unminified hydration) would otherwise hide
 * real defects. The suite assumes the local development catalogue, so it never
 * needs Shopify credentials.
 */
const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    locale: 'pt-PT',
  },
  projects: [
    {
      // The designed desktop state, and the home of the audits that drive the
      // viewport themselves (responsive) or read the document head (SEO).
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // The behavioural suites re-run at phone width, where the compact header,
      // the overlay menu and the sticky buy bar take over.
      name: 'mobile',
      testMatch: /(cart|a11y|navigation)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { OPHELIA_FORCE_LOCAL_CATALOGUE: 'true', NEXT_PUBLIC_SITE_URL: baseURL },
  },
});
