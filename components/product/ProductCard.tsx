import Image from 'next/image';
import Link from 'next/link';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ButtonLink } from '@/components/ui/Button';
import type { Product } from '@/lib/commerce/types';
import { formatPriceRange } from '@/lib/format';
import { productPath } from '@/lib/navigation';
import { defaultVariant } from '@/lib/product';

import styles from './ProductCard.module.css';

/**
 * The standard product card — home favourites, the shop grid and the
 * "fica ainda melhor com" row all use this.
 *
 * `compact` is the suggestions variant: smaller name, no tag, no button.
 * Everything on it is Shopify's: title, price range, image, availability.
 */
export function ProductCard({
  product,
  compact = false,
  showTag = false,
  priority = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px',
}: {
  product: Product;
  compact?: boolean;
  showTag?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const href = productPath(product.handle);
  const image = product.featuredImage;
  const tag = product.editorial.badge ?? product.tags[0] ?? null;
  /*
   * The handoff: a card add puts "size #1 x 1" in the cesto and opens the
   * drawer. Size #1 is the first purchasable variant in Shopify's own order,
   * which is the merchant's stated default — and the drawer opening is what
   * lets the visitor change it immediately.
   */
  const variant = defaultVariant(product);
  const canQuickAdd = !compact && product.availableForSale && variant !== null;

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.media} aria-label={product.title} tabIndex={-1}>
        {showTag && tag ? <span className={styles.tag}>{tag}</span> : null}
        {!product.availableForSale ? <span className={styles.soldOut}>esgotado</span> : null}
        {image ? (
          <Image
            className={styles.image}
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            sizes={sizes}
            priority={priority}
          />
        ) : null}
      </Link>

      <Link href={href} className={compact ? styles.nameCompact : styles.name}>
        {product.title}
      </Link>

      <span className={styles.price}>{formatPriceRange(product.priceRange)}</span>

      {compact ? null : canQuickAdd && variant ? (
        <AddToCartButton
          className={styles.action}
          variantId={variant.id}
          productTitle={product.title}
        >
          juntar ao cesto
        </AddToCartButton>
      ) : !compact && !product.availableForSale ? (
        <ButtonLink className={styles.action} href={href}>
          ver produto
        </ButtonLink>
      ) : null}
    </article>
  );
}
