import type { NextConfig } from 'next';

/**
 * Shopify's CDN is the only remote image host: all product photography is
 * served by Shopify. Editorial photography and brand artwork ship from
 * /public, so nothing else needs allow-listing.
 */
const nextConfig: NextConfig = {
  /*
   * A self-contained server (with only the node_modules it needs) for the
   * cPanel Node.js hosting — see .github/workflows/deploy.yml.
   */
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' }],
    formats: ['image/avif', 'image/webp'],
    // 75 is the default; product photography asks for 85, because the smooth
    // navy studio backgrounds band and blotch under heavier compression.
    qualities: [75, 85, 90],
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
      { source: '/builder', headers: privateHeaders },
      { source: '/builder/:path*', headers: privateHeaders },
      { source: '/api/builder/:path*', headers: privateHeaders },
    ];
  },
};

export default nextConfig;
