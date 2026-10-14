import manifest from './manifest.json';

/**
 * next/image loader. Nothing is resized while a visitor waits:
 *
 * - Shopify product photos are resized by Shopify's own CDN.
 * - The site's own images were pre-built at every size by
 *   scripts/build-images.mjs; this picks the smallest one that is at least as
 *   wide as the browser asked for.
 * - Anything else (an image added since the last build) is served as is.
 */
type Entry = { w: number; h: number; hash: string; widths: number[] };
const images = manifest as Record<string, Entry>;

export default function loader({ src, width }: { src: string; width: number; quality?: number }) {
  if (src.startsWith('https://cdn.shopify.com/')) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    return url.toString();
  }

  const entry = images[src];
  if (!entry) return src;

  const chosen =
    entry.widths.find((size) => size >= width) ?? entry.widths[entry.widths.length - 1];
  return `/_img/${entry.hash}-${chosen}.webp`;
}
