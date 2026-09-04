/**
 * Site navigation.
 *
 * The prototype's nav links were stubs that all pointed at the nearest built
 * page; here they point at the real routes. Collection routes follow the
 * handoff's own scheme (`/comprar/<colecao>`, `/produto/<handle>`).
 */

export type NavItem = {
  label: string;
  href: string;
  /** Marks the item active for this route and anything beneath it. */
  matchPrefix?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Cookies', href: '/comprar/cookies' },
  { label: 'Mercearia', href: '/comprar/mercearia' },
  { label: 'Presentes', href: '/comprar/presentes' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Quem Somos', href: '/quem-somos' },
];

export const SHOP_FOOTER_NAV: NavItem[] = [
  { label: 'Cookies', href: '/comprar/cookies' },
  { label: 'Mercearia', href: '/comprar/mercearia' },
  { label: 'Presentes', href: '/comprar/presentes' },
  { label: 'Lifestyle', href: '/comprar/lifestyle' },
];

export const BRAND_FOOTER_NAV: NavItem[] = [
  { label: 'Quem Somos', href: '/quem-somos' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Cookies personalizadas', href: '/personalizadas' },
  { label: 'Envios e devoluções', href: '/envios-e-devolucoes' },
  { label: 'Termos e privacidade', href: '/termos-e-privacidade' },
];

export const UTILITY_NAV: NavItem[] = [
  { label: 'Procurar', href: '/pesquisa' },
  { label: 'Conta', href: '/conta' },
];

/** Collection handles the storefront exposes at /comprar/<handle>. */
export const COLLECTION_HANDLES = ['cookies', 'mercearia', 'presentes', 'lifestyle'] as const;
export type CollectionHandle = (typeof COLLECTION_HANDLES)[number];

export function isKnownCollection(handle: string): handle is CollectionHandle {
  return (COLLECTION_HANDLES as readonly string[]).includes(handle);
}

export function collectionPath(handle: string): string {
  return `/comprar/${handle}`;
}

export function productPath(handle: string): string {
  return `/produto/${handle}`;
}

export function isActive(pathname: string, item: NavItem): boolean {
  const target = item.matchPrefix ?? item.href;
  if (target === '/') return pathname === '/';
  return pathname === target || pathname.startsWith(`${target}/`);
}
