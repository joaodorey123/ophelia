import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import localFont from 'next/font/local';

import { CartDrawer, CartToast } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CatalogueNotice } from '@/components/layout/CatalogueNotice';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { JsonLd } from '@/components/seo/JsonLd';
import { DeckleFilters } from '@/components/ui/DeckleFilters';
import { getCart } from '@/lib/cart/get-cart';
import { getCollectionsSafe } from '@/lib/commerce/safe';
import { site } from '@/lib/content';
import { rootMetadata } from '@/lib/seo/metadata';
import { organizationSchema, websiteSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import './globals.css';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // One cart read per request, shared by the header badge and the drawer.
  const [cart, collections] = await Promise.all([getCart(), getCollectionsSafe()]);

  return (
    <html
      lang={SITE.locale}
      className={`${bethEllen.variable} ${cormorant.variable} ${jost.variable}`}
    >
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <DeckleFilters />

        <CartProvider initialCart={cart}>
          <a className="oph-skip-link" href="#conteudo">
            Saltar para o conteúdo
          </a>

          <CatalogueNotice />
          <AnnouncementBar />
          <Header wordmark={site.brand.wordmark} />

          <main id="conteudo">{children}</main>

          <Footer collections={collections} />

          <CartDrawer freeShippingFrom={site.shipping.freeShippingFrom} />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}
