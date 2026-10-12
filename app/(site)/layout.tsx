import { SiteChrome } from '@/components/layout/SiteChrome';

/** Every storefront page sits inside the shop's header, footer and cart. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
