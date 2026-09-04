import type { Metadata } from 'next';

import { absoluteUrl, getSiteUrl, SITE } from '@/lib/site';

/**
 * One place that builds page metadata, so titles, canonicals and Open Graph
 * stay consistent and no page duplicates another's description.
 */

/** Brand card used when a page has no image of its own. Composed only from
 *  supplied Ophelia artwork — no invented product photography. */
const DEFAULT_OG_IMAGE = '/brand/og-default.png';

type PageMetaInput = {
  title: string;
  description: string;
  /** Path with a leading slash. Becomes the canonical URL. */
  path: string;
  /** Absolute or root-relative image URL for social cards. */
  image?: string | null;
  /** Keep transactional and personal pages out of the index. */
  noIndex?: boolean;
  type?: 'website' | 'article';
};

export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
  type = 'website',
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE.name,
      locale: 'pt_PT',
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    ...(noIndex
      ? { robots: { index: false, follow: false, nocache: true } }
      : { robots: { index: true, follow: true } }),
  };
}

/** Root metadata: title template, base URL, defaults every page inherits. */
export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${SITE.name} — ${SITE.tagline}`,
      template: `%s · ${SITE.name}`,
    },
    description: SITE.description,
    applicationName: SITE.name,
    referrer: 'strict-origin-when-cross-origin',
    formatDetection: { telephone: false },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: 'pt_PT',
      url: getSiteUrl(),
      images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE), width: 1200, height: 630, alt: SITE.name }],
    },
    icons: {
      icon: [
        { url: '/brand/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/brand/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  };
}

/** Truncates a description to a length search engines will actually show. */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
