import 'server-only';

import { cache } from 'react';

import { catalogue } from '@/lib/commerce';
import type { Product } from '@/lib/commerce/types';
import { defaultVariant } from '@/lib/product';

/**
 * The curated add-on set.
 *
 * The design fixes this list — "Escolhido por nós, não por um algoritmo" — so
 * it is a merchant-curated Shopify collection rather than an algorithmic
 * recommendation. Create a collection with this handle in Shopify; see
 * docs/SHOPIFY.md.
 */
export const CROSS_SELL_COLLECTION = 'complementos';

export const getCrossSellProducts = cache(async (limit = 4): Promise<Product[]> => {
  try {
    const result = await catalogue().getCollectionProducts(CROSS_SELL_COLLECTION, { first: limit });
    return result?.products ?? [];
  } catch {
    // A missing cross-sell collection must never take a product page down.
    return [];
  }
});

/** The shape the cart drawer and cross-sell rows need, safe to serialise. */
export type CrossSellItem = {
  handle: string;
  title: string;
  variantId: string;
  sizeLabel: string;
  price: { amount: string; currencyCode: string };
  imageBrief: string;
  image: Product['featuredImage'];
};

export function toCrossSellItems(products: Product[]): CrossSellItem[] {
  return products.flatMap((product) => {
    const variant = defaultVariant(product);
    if (!variant) return [];
    return [
      {
        handle: product.handle,
        title: product.title,
        variantId: variant.id,
        sizeLabel: variant.selectedOptions.map((option) => option.value).join(' · '),
        price: variant.price,
        imageBrief: product.editorial.shortDescription ?? product.title,
        image: product.featuredImage,
      },
    ];
  });
}
