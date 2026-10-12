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
import { themeStyle } from '@/lib/content/theme';
import { organizationSchema, websiteSchema } from '@/lib/seo/structured-data';

import '@/app/globals.css';

/**
 * Everything around a storefront page: theme, header, footer and cart.
 *
 * It lives outside the root layout so /builder — the content editor, served
 * by the same deployment — gets a bare document instead of the shop's chrome.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  // One cart read per request, shared by the header badge and the drawer.
  const [cart, collections] = await Promise.all([getCart(), getCollectionsSafe()]);
  const themeCss = themeStyle();

  return (
    <>
      {/* The client's theme overrides, emitted only when they differ from
          the token layer. Inline so there is no extra request and no flash
          of the default palette. */}
      {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}

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
    </>
  );
}
