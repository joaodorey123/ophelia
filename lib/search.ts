import { formatPriceRange } from '@/lib/format';
import type { Product } from '@/lib/commerce/types';

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
