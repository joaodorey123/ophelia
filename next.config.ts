import type { NextConfig } from 'next';

/**
 * Shopify's CDN is the only remote image host: all product photography is
 * served by Shopify. Editorial photography and brand artwork ship from
 * /public, so nothing else needs allow-listing.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' }],
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * The site's URLs are Portuguese throughout. These aliases exist because
   * earlier drafts and external links used other spellings; they are permanent
   * so link equity lands on the canonical URL.
   */
  async redirects() {
    return [
      { source: '/produtos', destination: '/comprar', permanent: true },
      { source: '/produtos/:handle', destination: '/produto/:handle', permanent: true },
      { source: '/blog', destination: '/diario', permanent: true },
      { source: '/blog/:slug', destination: '/diario/:slug', permanent: true },
      { source: '/contact', destination: '/contacto', permanent: true },
      { source: '/checkout', destination: '/carrinho', permanent: true },
      // Retired routes from the previous design.
      { source: '/eventos', destination: '/contacto', permanent: true },
      { source: '/personalizadas', destination: '/contacto', permanent: true },
      { source: '/conta', destination: '/', permanent: true },
      { source: '/conta/:path*', destination: '/', permanent: true },
    ];
  },

  async headers() {
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
    ];
  },
};

export default nextConfig;
