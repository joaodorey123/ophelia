#!/usr/bin/env node
/**
 * Pre-builds every responsive size of the site's own images.
 *
 * The hosting is a shared server: resizing and encoding an image when a
 * visitor first asks for it took over a second each, and a page asks for a
 * dozen at once. So nothing is resized at request time. This runs before
 * `next build` (locally and on GitHub) and writes:
 *
 *   public/_img/<hash>-<width>.webp   one file per size, named by content hash
 *   lib/images/manifest.json          source path → { w, h, hash, widths }
 *
 * lib/images/loader.ts maps each <Image> to its pre-built file; Shopify product
 * photos never come here — Shopify's CDN resizes those.
 *
 * Files are named by content, so they are cached for a year and a replaced
 * photo simply gets a new name. Existing outputs are reused, so only new or
 * changed images are encoded.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(root, 'public');
const OUT = join(PUBLIC, '_img');
const MANIFEST = join(root, 'lib/images/manifest.json');

/** Must match images.deviceSizes + images.imageSizes in next.config.ts. */
export const WIDTHS = [96, 160, 256, 384, 512, 640, 768, 960, 1200, 1440, 1920, 2560];

const FOLDERS = ['photos', 'photography', 'decor', 'brand', 'uploads'];
const EXT = /\.(jpe?g|png|webp)$/i;

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : EXT.test(name) ? [path] : [];
  });
}

mkdirSync(OUT, { recursive: true });
const manifest = {};
const keep = new Set();
let encoded = 0;

for (const file of FOLDERS.flatMap((folder) => walk(join(PUBLIC, folder)))) {
  const key = `/${relative(PUBLIC, file).split('\\').join('/')}`;
  const buffer = readFileSync(file);
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 10);
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const alpha = Boolean(meta.hasAlpha);

  // Every standard width below the source, plus the source width itself.
  const widths = [...new Set([...WIDTHS.filter((size) => size < w), w])].sort((a, b) => a - b);

  for (const width of widths) {
    const name = `${hash}-${width}.webp`;
    keep.add(name);
    const target = join(OUT, name);
    if (existsSync(target)) continue;
    await sharp(buffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      // effort 6 is WebP's slowest, smallest setting: build time, not visitor time.
      .webp(
        alpha
          ? { quality: 80, alphaQuality: 85, effort: 6 }
          : { quality: 74, effort: 6, smartSubsample: true },
      )
      .toFile(target);
    encoded += 1;
  }
  manifest[key] = { w, h, hash, widths };
}

// Drop sizes of images that no longer exist.
let removed = 0;
for (const name of readdirSync(OUT)) {
  if (!keep.has(name)) {
    rmSync(join(OUT, name));
    removed += 1;
  }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 0)}\n`);
console.log(
  `images: ${Object.keys(manifest).length} sources, ${keep.size} sizes (${encoded} new, ${removed} removed)`,
);
