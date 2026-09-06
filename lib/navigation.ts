/**
 * Site navigation.
 *
 * Routes are Portuguese throughout, matching the handoff. The English aliases
 * (/blog, /contact, /produtos, /diario…) are permanent redirects declared in
 * next.config.ts so older links keep working.
 *
 * Collection links are *not* listed here: which collections exist is Shopify's
 * to say, so the header, footer and home page read them from the catalogue.
 * A hard-coded list would produce dead links the moment the shop changed.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Marks the item active for this route and anything beneath it. */
  matchPrefix?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: 'início', href: '/' },
  { label: 'produtos', href: '/comprar', matchPrefix: '/comprar' },
  { label: 'quem somos', href: '/quem-somos' },
  { label: 'diário', href: '/diario' },
  { label: 'contacto', href: '/contacto' },
];

/** `produtos` stays active on product pages, `diário` on article pages. */
const EXTRA_ACTIVE_PREFIXES: Record<string, string[]> = {
  '/comprar': ['/produto'],
  '/diario': ['/diario'],
};

export const SHOP_INDEX = '/comprar';

export function collectionPath(handle: string): string {
  return `/comprar/${handle}`;
}

export function productPath(handle: string): string {
  return `/produto/${handle}`;
}

export function postPath(slug: string): string {
  return `/diario/${slug}`;
}

export function isActive(pathname: string, item: NavItem): boolean {
  const target = item.matchPrefix ?? item.href;
  if (target === '/') return pathname === '/';
  if (pathname === target || pathname.startsWith(`${target}/`)) return true;
  return (EXTRA_ACTIVE_PREFIXES[target] ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
