import Link from 'next/link';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ButtonLink } from '@/components/ui/Button';
import { CardKicker } from '@/components/ui/Type';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { Product } from '@/lib/commerce/types';
import { formatFrom, formatMoney } from '@/lib/format';
import { productPath } from '@/lib/navigation';
import { cheapestVariant, defaultVariant, sizeLabel, sizeSteps } from '@/lib/product';

import styles from './ProductCard.module.css';

/**
 * The design uses three distinct product cards. They share data but not
 * layout, so they are three components rather than one with a `variant` prop
 * that would fork on every line.
 *
 * `headingLevel` exists because the same card appears at two depths: under a
 * section h2 on the homepage (so h3), and directly under the page h1 on a
 * collection page (so h2). Hardcoding h3 skipped a level there.
 */
type CardHeading = 2 | 3;

function Heading({
  level,
  className,
  children,
}: {
  level: CardHeading;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return <Tag className={className}>{children}</Tag>;
}

function imageBrief(product: Product): string {
  return product.editorial.shortDescription ?? product.title;
}

/** Homepage — "Os favoritos da Ophelia". 330px image, adds the smallest size. */
export function FavouriteCard({
  product,
  priority = false,
  headingLevel = 3,
}: {
  product: Product;
  priority?: boolean;
  headingLevel?: CardHeading;
}) {
  const variant = cheapestVariant(product);
  const href = productPath(product.handle);

  return (
    <article className={styles.favourite}>
      <Link href={href} className={styles.favouriteMedia} tabIndex={-1} aria-hidden="true">
        {product.editorial.badge ? (
          <span className={styles.badgeBlue}>{product.editorial.badge}</span>
        ) : null}
        <ImageSlot
          image={product.featuredImage}
          alt={product.featuredImage ? product.title : undefined}
          brief={imageBrief(product)}
          height={330}
          radius="var(--oph-r-md)"
          priority={priority}
          sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 25vw"
        />
      </Link>

      <div className={styles.favouriteMeta}>
        {product.editorial.kicker ? <CardKicker>{product.editorial.kicker}</CardKicker> : null}
        <Heading level={headingLevel} className={styles.favouriteTitle}>
          <Link href={href}>{product.title}</Link>
        </Heading>
        <span className={styles.favouritePrice}>
          {formatFrom(product.priceRange.minVariantPrice)}
        </span>
      </div>

      <AddToCartButton
        variantId={variant?.id ?? null}
        productTitle={product.title}
        available={variant?.availableForSale ?? false}
        variant="outlineBlue"
        size="sm"
        className={styles.addSelf}
      >
        Adicionar ao cesto
      </AddToCartButton>
    </article>
  );
}

/** Cookies collection. 380px image, size chips, "Escolher" into the PDP. */
export function CategoryCard({
  product,
  priority = false,
  headingLevel = 3,
}: {
  product: Product;
  priority?: boolean;
  headingLevel?: CardHeading;
}) {
  const href = productPath(product.handle);
  const steps = sizeSteps(product);

  return (
    <article className={styles.category}>
      <Link href={href} className={styles.categoryMedia} tabIndex={-1} aria-hidden="true">
        {product.editorial.badge ? (
          <span className={styles.badgeTerracotta}>{product.editorial.badge}</span>
        ) : null}
        <ImageSlot
          image={product.featuredImage}
          alt={product.featuredImage ? product.title : undefined}
          brief={imageBrief(product)}
          height={380}
          radius="var(--oph-r-lg)"
          priority={priority}
          sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      </Link>

      <div>
        <Heading level={headingLevel} className={styles.categoryTitle}>
          <Link href={href}>{product.title}</Link>
        </Heading>
        {product.editorial.shortDescription ? (
          <p className={styles.categoryDesc}>{product.editorial.shortDescription}</p>
        ) : (
          <p className={styles.categoryDesc} />
        )}

        {steps.length > 0 ? (
          <ul className={styles.sizeChips}>
            {steps.map((step) => (
              <li key={step.label} className={styles.sizeChip}>
                {step.label} · {formatMoney(step.variant.price)}
              </li>
            ))}
          </ul>
        ) : null}

        <ButtonLink href={href} variant="primary" size="md" aria-label={`Escolher ${product.title}`}>
          Escolher
        </ButtonLink>
      </div>
    </article>
  );
}

/** Mercearia and cross-sell. Cream fill, small image, price + add pill. */
export function PantryCard({
  product,
  bordered = false,
  imageHeight = 200,
  addLabel = 'Adicionar',
  headingLevel = 3,
}: {
  product: Product;
  bordered?: boolean;
  imageHeight?: number;
  addLabel?: string;
  headingLevel?: CardHeading;
}) {
  const variant = defaultVariant(product);
  const href = productPath(product.handle);

  return (
    <article className={[styles.pantry, bordered ? styles.pantryOnCream : undefined].filter(Boolean).join(' ')}>
      <Link href={href} className={styles.pantryMedia} tabIndex={-1} aria-hidden="true">
        <ImageSlot
          image={product.featuredImage}
          alt={product.featuredImage ? product.title : undefined}
          brief={imageBrief(product)}
          height={imageHeight}
          radius="var(--oph-r-xs)"
          sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 25vw"
        />
      </Link>

      <div>
        <Heading level={headingLevel} className={styles.pantryTitle}>
          <Link href={href}>{product.title}</Link>
        </Heading>
        {variant ? <span className={styles.pantrySub}>{sizeLabel(variant)}</span> : null}
      </div>

      <div className={styles.pantryFoot}>
        <span className={styles.pantryPrice}>
          {formatMoney(variant?.price ?? product.priceRange.minVariantPrice)}
        </span>
        <AddToCartButton
          variantId={variant?.id ?? null}
          productTitle={product.title}
          available={variant?.availableForSale ?? false}
          variant="outlineBlue"
          size="xs"
        >
          {addLabel}
        </AddToCartButton>
      </div>
    </article>
  );
}
