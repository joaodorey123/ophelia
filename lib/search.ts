import { formatPriceRange } from '@/lib/format';
import { catalogue } from '@/lib/commerce';
import type { Product } from '@/lib/commerce/types';
import { rankProducts } from '@/lib/search-match';

/**
 * The shape the search sheet renders. Deliberately tiny — it crosses the wire
 * on every keystroke, so it carries a chip's worth of data and nothing more.
 */
export type SearchResult = {
  handle: string;
  title: string;
  price: string;
  image: { url: string; alt: string } | null;
};

export function toSearchResults(products: Product[]): SearchResult[] {
  return products.map((product) => ({
    handle: product.handle,
    title: product.title,
    price: formatPriceRange(product.priceRange),
    image: product.featuredImage
      ? { url: product.featuredImage.url, alt: product.featuredImage.altText ?? product.title }
      : null,
  }));
}

/**
 * Search the whole catalogue (see lib/search-match.ts). The product list is
 * one cached request, shared with the shop pages, so each search is instant.
 */
export async function searchCatalogue(term: string, limit = 24): Promise<Product[]> {
  const products = await catalogue().getProducts({ first: 250 });
  return rankProducts(products, term).slice(0, limit);
}
