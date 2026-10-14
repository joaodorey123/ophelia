import type { NextConfig } from 'next';

/**
 * Shopify's CDN is the only remote image host: all product photography is
 * served by Shopify. Editorial photography and brand artwork ship from
 * /public, so nothing else needs allow-listing.
 */
/*
 * Images, scripts, styles and fonts are published to GitHub Pages' CDN on
 * every deploy (see .github/workflows/deploy.yml), so the hosting — which
 * refuses bursts of more than ~20 requests per visitor — only serves pages.
 * Unset locally and in tests: everything is then served by the app itself.
 */
const assetUrl = process.env.NEXT_PUBLIC_ASSET_URL?.replace(/\/$/, '') || undefined;

const nextConfig: NextConfig = {
  assetPrefix: assetUrl,
  experimental: {
    /*
     * Styles go into the page itself rather than separate files: no
     * render-blocking request before the first paint (the CSS is ~25 KB).
     */
    inlineCss: true,
  },
  /*
   * A self-contained server (with only the node_modules it needs) for the
   * cPanel Node.js hosting — see .github/workflows/deploy.yml.
   */
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /*
     * Nothing is resized while a visitor waits: product photos come from
     * Shopify's CDN, the site's own images are pre-built at every size by
     * scripts/build-images.mjs. See lib/images/loader.ts.
     */
    loader: 'custom',
    loaderFile: './lib/images/loader.ts',
    // Must match WIDTHS in scripts/build-images.mjs.
    deviceSizes: [640, 768, 960, 1200, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 512],
  },

  /**
   * The site's URLs are Portuguese throughout. These aliases exist because
   * earlier drafts and external links used other spellings; they are permanent
   * so link equity lands on the canonical URL.
   */
  async redirects() {
    return [
      /*
       * One address for the whole site: https, no www. The hosting serves both
       * www and plain http too, and duplicates split search ranking.
       */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.callmeophelia.com' }],
        destination: 'https://callmeophelia.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'callmeophelia.com' },
          { type: 'header', key: 'x-forwarded-proto', value: 'http' },
        ],
        destination: 'https://callmeophelia.com/:path*',
        permanent: true,
      },
      { source: '/produtos', destination: '/comprar', permanent: true },
      { source: '/produtos/:handle', destination: '/produto/:handle', permanent: true },
      { source: '/blog', destination: '/diario', permanent: true },
      { source: '/blog/:slug', destination: '/diario/:slug', permanent: true },
      { source: '/contact', destination: '/contacto', permanent: true },
      { source: '/checkout', destination: '/carrinho', permanent: true },
      // Retired routes from the previous design.
      { source: '/personalizadas', destination: '/contacto', permanent: true },
      { source: '/conta', destination: '/', permanent: true },
      { source: '/conta/:path*', destination: '/', permanent: true },
    ];
  },

  async headers() {
    // The content editor is private: never indexed, never framed, and it
    // sends no referrer when a link opens the live site.
    const privateHeaders = [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Cache-Control', value: 'private, no-store' },
    ];

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Pre-built images are named by their content: cache them for a year.
      {
        source: '/_img/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Backgrounds and decorations keep their names; a week, then revalidate.
      {
        source: '/:dir(decor|textures|brand|photos|photography)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      { source: '/builder', headers: privateHeaders },
      { source: '/builder/:path*', headers: privateHeaders },
      { source: '/api/builder/:path*', headers: privateHeaders },
    ];
  },
};

export default nextConfig;
