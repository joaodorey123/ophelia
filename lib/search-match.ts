import type { Product } from '@/lib/commerce/types';

/**
 * Matching for the shop's search.
 *
 * The catalogue is small (a few dozen products), so rather than relying on
 * Shopify's search — which treats "cafe" and "café" differently and misses
 * partial words — the whole list is matched here: accents and case ignored,
 * every word typed must match somewhere, titles count most.
 */

/** Lower case, no accents, punctuation as spaces: "Café-Ophelia" → "cafe ophelia". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The words typed, with a plural "s" dropped so "bolos" also finds "bolo". */
function tokens(term: string): string[] {
  return normalize(term)
    .split(' ')
    .filter(Boolean)
    .map((word) => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word));
}

function scoreToken(token: string, title: string[], meta: string[], description: string[]): number {
  if (title.some((word) => word.startsWith(token))) return 10;
  if (title.join(' ').includes(token)) return 6;
  if (meta.some((word) => word.startsWith(token))) return 4;
  // Word starts only: "mel" must not match inside "caramelizados".
  if (description.some((word) => word.startsWith(token))) return 1;
  return 0;
}

export function rankProducts(products: Product[], term: string): Product[] {
  const words = tokens(term);
  if (words.length === 0) return [];

  return products
    .map((product) => {
      const title = normalize(product.title).split(' ');
      const meta = normalize(`${product.productType} ${product.tags.join(' ')}`).split(' ');
      const description = normalize(product.description).split(' ');
      let score = 0;
      for (const word of words) {
        const points = scoreToken(word, title, meta, description);
        if (points === 0) return null; // every word must match somewhere
        score += points;
      }
      return { product, score };
    })
    .filter((entry): entry is { product: Product; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title, 'pt'))
    .map((entry) => entry.product);
}

export type PageShortcut = { label: string; href: string; external?: boolean };

/** Pages a search can point to, by the words people would type for them. */
const PAGES: (PageShortcut & { keywords: string[] })[] = [
  {
    label: 'bolos por encomenda',
    href: '/bolos',
    keywords: [
      'bolo',
      'encomenda',
      'aniversario',
      'pavlova',
      'cheesecake',
      'sobremesa',
      'catalogo',
    ],
  },
  {
    label: 'menu brunch',
    href: '/menu',
    keywords: [
      'menu',
      'brunch',
      'pequeno',
      'almoco',
      'panqueca',
      'waffle',
      'ovo',
      'tosta',
      'croissant',
      'sandoca',
      'bebida',
      'sumo',
      'carta',
    ],
  },
  {
    label: 'eventos',
    href: '/eventos',
    keywords: ['evento', 'festa', 'casamento', 'catering', 'celebra', 'jantar', 'corporativo'],
  },
  {
    label: 'quem somos',
    href: '/quem-somos',
    keywords: ['quem', 'historia', 'familia', 'sobre', 'ophelia'],
  },
  {
    label: 'diário',
    href: '/diario',
    keywords: ['diario', 'receita', 'blog', 'artigo', 'noticia'],
  },
  {
    label: 'contactos',
    href: '/contacto',
    keywords: [
      'contacto',
      'morada',
      'horario',
      'telefone',
      'email',
      'loja',
      'onde',
      'estoril',
      'cascais',
    ],
  },
];

export function matchPages(term: string, reservationsUrl?: string): PageShortcut[] {
  const words = tokens(term).filter((word) => word.length >= 3);
  if (words.length === 0) return [];
  const hit = (keyword: string) =>
    words.some(
      (word) => keyword.startsWith(word) || (word.length >= 5 && word.startsWith(keyword)),
    );

  const pages: PageShortcut[] = PAGES.filter((page) => page.keywords.some(hit)).map(
    ({ label, href }) => ({ label, href }),
  );
  if (reservationsUrl && ['reserva', 'reservar', 'mesa'].some(hit)) {
    pages.unshift({ label: 'reservar mesa', href: reservationsUrl, external: true });
  }
  return pages.slice(0, 3);
}
