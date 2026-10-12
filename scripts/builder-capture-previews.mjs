#!/usr/bin/env node
/**
 * Captures the visual map of the site.
 *
 * Opens each page of the real storefront, photographs it, and records where
 * every editable section actually sits — read from the `data-editor-section`
 * markers in the storefront's own markup, so the clickable areas cannot drift
 * out of step with the design the way hand-measured coordinates would.
 *
 *   npm run builder:capture   # against STOREFRONT_URL, else NEXT_PUBLIC_SITE_URL
 *   npm run builder:capture -- http://localhost:3000
 *
 * Re-run it after a design change. Content changes do not need it — the map is
 * about where things are, not what they say.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

function envValue(key) {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    const match = new RegExp(`^${key}\\s*=\\s*(.*)$`, 'm').exec(readFileSync(path, 'utf8'));
    if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return undefined;
}

const BASE = (process.argv[2] ?? envValue('STOREFRONT_URL') ?? envValue('NEXT_PUBLIC_SITE_URL') ?? '').replace(/\/$/, '');
if (!BASE) {
  console.error('No storefront URL. Set NEXT_PUBLIC_SITE_URL, or pass one as an argument.');
  process.exit(1);
}

/** The pages the visual map offers, in the order a person thinks about them. */
const PAGES = [
  { id: 'inicio', label: 'Página inicial', path: '/' },
  { id: 'loja', label: 'Loja', path: '/comprar' },
  { id: 'quem-somos', label: 'Quem somos', path: '/quem-somos' },
  { id: 'diario', label: 'Diário', path: '/diario' },
  { id: 'contacto', label: 'Contacto', path: '/contacto' },
];

/** What each marker opens, and what to call it on the map. */
const TARGETS = {
  'home-hero': { label: 'Fotografia e título principal', href: '/builder/secao/home-hero' },
  'home-collections': { label: 'Cartões das categorias', href: '/builder/secao/home-collections' },
  'home-favourites': { label: 'Produtos em destaque', href: '/builder/secao/home-favourites' },
  'home-story': { label: 'A nossa história', href: '/builder/secao/home-story' },
  reviews: { label: 'Opiniões', href: '/builder/secao/reviews' },
  diario: { label: 'Artigos do diário', href: '/builder/diario' },
  'diario-intro': { label: 'Introdução do diário', href: '/builder/secao/diario-intro' },
  about: { label: 'Página quem somos', href: '/builder/secao/about' },
  contacto: { label: 'Página de contacto', href: '/builder/secao/contacto' },
  shop: { label: 'Introdução da loja', href: '/builder/secao/shop' },
};

const { chromium } = await import(
  resolve(root, '../ophelia/node_modules/@playwright/test/index.mjs')
).catch(() => import('playwright'));

const WIDTH = 1280;
const out = resolve(root, 'public/builder/previews');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
const map = [];

for (const entry of PAGES) {
  process.stdout.write(`${entry.path} … `);
  await page.goto(BASE + entry.path, { waitUntil: 'networkidle', timeout: 60000 });

  // Walk the page so lazily-loaded photographs are present in the capture.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);

  // Positions as percentages, so the overlay survives being displayed at any size.
  const regions = await page.evaluate(() => {
    const total = document.documentElement.scrollHeight;
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll('[data-editor-section]')].map((el) => {
      const box = el.getBoundingClientRect();
      return {
        id: el.getAttribute('data-editor-section'),
        top: ((box.top + window.scrollY) / total) * 100,
        left: (box.left / width) * 100,
        width: (box.width / width) * 100,
        height: (box.height / total) * 100,
      };
    });
  });

  await page.screenshot({ path: resolve(out, `${entry.id}.png`), fullPage: true });

  map.push({
    ...entry,
    image: `/builder/previews/${entry.id}.png`,
    aspect: `${WIDTH} / ${height}`,
    regions: regions
      .filter((region) => TARGETS[region.id])
      .map((region) => ({ ...region, ...TARGETS[region.id] })),
  });

  console.log(`${regions.length} regions, ${height}px tall`);
}

await browser.close();
writeFileSync(resolve(out, 'map.json'), `${JSON.stringify(map, null, 2)}\n`);
console.log(`\nWrote ${map.length} pages to public/builder/previews/`);
