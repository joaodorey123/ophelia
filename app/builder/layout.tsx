import type { Metadata } from 'next';

import './builder.css';

/**
 * The content editor, served by the storefront's own deployment.
 *
 * It sits outside the (site) route group, so none of the shop's chrome —
 * header, footer, cart, theme overrides — is rendered around it, and its
 * styles load only on these routes. The faces come from the root layout.
 */
export const metadata: Metadata = {
  title: { absolute: 'Ophelia — editor' },
  // A private tool: kept out of every index.
  robots: { index: false, follow: false, nocache: true },
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <div className="oph-builder">{children}</div>;
}
