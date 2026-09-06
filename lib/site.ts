/**
 * Site-level constants. Safe to import from client components.
 *
 * Business details below come from the client's own Termos e Condições
 * document — company identity, address, contacts. Nothing here is invented.
 */

export const SITE = {
  name: 'Ophelia',
  legalName: 'Receita Consistente, Lda.',
  taxId: 'NIPC 517225085',
  tagline: 'pastelaria · brunch · mercearia',
  description:
    'Cookies, mercearia, café torrado na loja e bolos por encomenda. Feito por nós, todos os dias, no Estoril.',
  locale: 'pt-PT',
  language: 'pt',
  currency: 'EUR',
  email: 'info@callmeophelia.com',
  phone: '+351962363861',
  phoneDisplay: '+351 962 363 861',
  address: {
    street: 'Rua Rosa Parracho 27',
    locality: 'Cascais',
    country: 'PT',
  },
} as const;

/**
 * Canonical origin. Falls back to the Vercel deployment URL so preview builds
 * still emit coherent canonicals, and finally to localhost in development.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && configured.trim()) return configured.trim().replace(/\/$/, '');

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
