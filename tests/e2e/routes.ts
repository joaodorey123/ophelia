/**
 * Every public route the suite exercises.
 *
 * The browser suite runs against the development fixture
 * (OPHELIA_FORCE_LOCAL_CATALOGUE=true), so these product and collection
 * handles are the fixture's — which are generated from the handoff's own
 * catalogue. See playwright.config.ts.
 */
export const PUBLIC_ROUTES = [
  '/',
  '/comprar',
  '/comprar/cookies',
  '/comprar/mercearia',
  '/comprar/cafe',
  '/comprar/bolos',
  '/comprar/casa',
  '/produto/ophelia-cookies-ny',
  '/produto/mel-de-rosmaninho',
  '/quem-somos',
  '/diario',
  '/diario/granola',
  '/contacto',
  '/envios-e-devolucoes',
  '/termos-e-privacidade',
] as const;

/** Reachable, but must never be indexed. */
export const PRIVATE_ROUTES = ['/carrinho', '/pesquisa'] as const;

export const ALL_ROUTES = [...PUBLIC_ROUTES, ...PRIVATE_ROUTES];

/**
 * The widths named in the QA brief. 375/390/430 are phones, 768 a tablet,
 * 1024+ desktop. Every grid in the design is auto-fit/auto-fill with minmax,
 * so everything between must reflow without breaking.
 */
export const VIEWPORTS = [
  { name: '375 (iPhone SE)', width: 375, height: 812 },
  { name: '390 (iPhone 14)', width: 390, height: 844 },
  { name: '430 (large phone)', width: 430, height: 932 },
  { name: '768 (tablet)', width: 768, height: 1024 },
  { name: '1024 (small laptop)', width: 1024, height: 768 },
  { name: '1280 (laptop)', width: 1280, height: 800 },
  { name: '1440 (designed desktop)', width: 1440, height: 900 },
  { name: '1920 (large desktop)', width: 1920, height: 1080 },
] as const;
