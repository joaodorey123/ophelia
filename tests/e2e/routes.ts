/** Every public route the suite exercises. */
export const PUBLIC_ROUTES = [
  '/',
  '/comprar/cookies',
  '/comprar/mercearia',
  '/comprar/presentes',
  '/comprar/lifestyle',
  '/produto/ophelia-cookies',
  '/produto/cafe-da-ophelia',
  '/produto/cartao-personalizado',
  '/quem-somos',
  '/eventos',
  '/personalizadas',
  '/envios-e-devolucoes',
  '/termos-e-privacidade',
] as const;

/** Reachable, but must never be indexed. */
export const PRIVATE_ROUTES = ['/carrinho', '/pesquisa', '/conta'] as const;

export const ALL_ROUTES = [...PUBLIC_ROUTES, ...PRIVATE_ROUTES];

/**
 * The widths named in the QA brief. 375/390/430 are phones, 768 a tablet,
 * 1024+ desktop. The handoff designs only two states, so everything between
 * must reflow through the same auto-fit grids without breaking.
 */
export const VIEWPORTS = [
  { name: '375 (iPhone SE)', width: 375, height: 812 },
  { name: '390 (iPhone 14)', width: 390, height: 844 },
  { name: '430 (designed phone)', width: 430, height: 932 },
  { name: '768 (tablet)', width: 768, height: 1024 },
  { name: '1024 (small laptop)', width: 1024, height: 768 },
  { name: '1280 (laptop)', width: 1280, height: 800 },
  { name: '1440 (designed desktop)', width: 1440, height: 900 },
  { name: '1920 (large desktop)', width: 1920, height: 1080 },
] as const;
