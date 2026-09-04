import type { MetadataRoute } from 'next';

import { absoluteUrl, getSiteUrl } from '@/lib/site';

/**
 * Public pages are crawlable; transactional and personal routes are not.
 *
 * Preview deployments are disallowed wholesale so a staging URL never competes
 * with the production domain in the index.
 */
export default function robots(): MetadataRoute.Robots {
  const isPreview = process.env.VERCEL_ENV === 'preview';

  if (isPreview) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/carrinho', '/conta', '/conta/', '/pesquisa', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: getSiteUrl(),
  };
}
