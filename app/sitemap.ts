import type { MetadataRoute } from 'next';

import { catalogue } from '@/lib/commerce';
import { collectionPath, productPath } from '@/lib/navigation';
import { absoluteUrl } from '@/lib/site';

/**
 * Dynamic sitemap: static pages, every collection and every product.
 *
 * Deliberately excluded — cart, checkout, search and the account area. They are
 * transactional, personal or infinite-variant URLs and carry `noindex` anyway.
 */

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const STATIC_PAGES: { path: string; priority: number; changeFrequency: Entry['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/quem-somos', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/eventos', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/personalizadas', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/envios-e-devolucoes', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/termos-e-privacidade', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const source = catalogue();
    const [collections, products] = await Promise.all([
      source.getCollections(),
      source.getProducts({ first: 250 }),
    ]);

    for (const collection of collections) {
      // The cross-sell collection is a merchandising device, not a landing page.
      if (collection.handle === 'complementos') continue;
      entries.push({
        url: absoluteUrl(collectionPath(collection.handle)),
        lastModified: new Date(collection.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    for (const product of products) {
      entries.push({
        url: absoluteUrl(productPath(product.handle)),
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  } catch {
    // A commerce outage must not produce a broken sitemap: serve the static
    // pages rather than a 500.
  }

  return entries;
}
