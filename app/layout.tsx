import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import localFont from 'next/font/local';

import { rootMetadata } from '@/lib/seo/metadata';
import { SITE } from '@/lib/site';

/**
 * The three faces are part of the visual contract, so all three are
 * self-hosted by next/font: no render-blocking request to Google, and no
 * layout shift from a late swap.
 *
 * Beth Ellen is the client's own file rather than the Google copy — it is the
 * face shipped in the handoff, and it is the one the design was set in.
 */
const bethEllen = localFont({
  src: './fonts/BethEllen-Regular.ttf',
  weight: '400',
  display: 'swap',
  variable: '--font-beth-ellen',
  /* Handwriting on a cream ground: match the fallback's metrics loosely. */
  fallback: ['cursive'],
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-cormorant',
});

const jost = Jost({
  weight: ['300', '400', '500'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-jost',
});

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: '#1e2f52',
  width: 'device-width',
  initialScale: 1,
};

/**
 * The bare document: language and faces only. The shop's chrome is added by
 * the (site) layout, so the content editor at /builder can share this
 * deployment without the storefront's header, footer and cart around it.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={SITE.locale}
      className={`${bethEllen.variable} ${cormorant.variable} ${jost.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
