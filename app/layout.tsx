import type { Metadata, Viewport } from 'next';
import { Caprasimo, Figtree } from 'next/font/google';

import { CartDrawer, CartToast } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CatalogueNotice } from '@/components/layout/CatalogueNotice';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCart } from '@/lib/cart/get-cart';
import { getCrossSellProducts, toCrossSellItems } from '@/lib/commerce/cross-sell';
import { rootMetadata } from '@/lib/seo/metadata';
import { organizationSchema, websiteSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import './globals.css';

/**
 * Caprasimo is the only display face and Figtree the only UI face — the
 * handoff is explicit that typography is part of the visual contract.
 * next/font self-hosts both, so there is no render-blocking Google request and
 * no layout shift from a swap.
 */
const caprasimo = Caprasimo({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caprasimo',
});

const figtree = Figtree({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: '#1B3160',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // One cart read per request, shared by the header badge and the drawer.
  const [cart, crossSell] = await Promise.all([getCart(), getCrossSellProducts()]);

  return (
    <html lang={SITE.locale} className={`${caprasimo.variable} ${figtree.variable}`}>
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />

        <CartProvider initialCart={cart}>
          <a className="oph-skip-link" href="#conteudo">
            Saltar para o conteúdo
          </a>

          <CatalogueNotice />
          <AnnouncementBar />
          <Header />

          <main id="conteudo">{children}</main>

          <Footer />

          <CartDrawer crossSell={toCrossSellItems(crossSell)} />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}
