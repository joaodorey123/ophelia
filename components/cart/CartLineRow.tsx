'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCart } from '@/components/cart/CartProvider';
import { CART_ATTRIBUTE, type CartLine } from '@/lib/commerce/types';
import { formatMoney } from '@/lib/format';
import { productPath } from '@/lib/navigation';
import { variantLabel } from '@/lib/product';

import styles from './CartLine.module.css';

/** Until product photography exists, the thumbnail shows the Caprasimo
 *  monogram the prototype used — never a broken image. */
function monogram(title: string): string {
  return title.replace(/^Ophelia\s+/i, '').charAt(0).toUpperCase() || 'O';
}

export function CartLineRow({ line }: { line: CartLine }) {
  const { stepLine, removeLine } = useCart();

  const variant = variantLabel({
    ...line.merchandise,
    availableForSale: true,
    quantityAvailable: null,
    price: line.cost.totalAmount,
    compareAtPrice: null,
    sku: null,
  });

  const giftMessage = line.attributes.find(
    (attribute) => attribute.key === CART_ATTRIBUTE.giftMessage,
  )?.value;

  return (
    <div className={styles.line}>
      <div className={styles.thumb}>
        {line.merchandise.image ? (
          <Image
            src={line.merchandise.image.url}
            alt=""
            fill
            sizes="74px"
            className={styles.thumbImage}
          />
        ) : (
          <span className={styles.monogram} aria-hidden="true">
            {monogram(line.merchandise.product.title)}
          </span>
        )}
      </div>

      <div>
        <h4 className={styles.title}>
          <Link href={productPath(line.merchandise.product.handle)}>
            {line.merchandise.product.title}
          </Link>
        </h4>
        {variant ? <span className={styles.variant}>{variant}</span> : null}
        {giftMessage ? <span className={styles.note}>“{giftMessage}”</span> : null}

        <div className={styles.controls}>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => stepLine(line.id, -1)}
              aria-label={`Diminuir quantidade de ${line.merchandise.product.title}`}
            >
              −
            </button>
            <span className={styles.stepperValue} aria-hidden="true">
              {line.quantity}
            </span>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => stepLine(line.id, 1)}
              disabled={line.quantity >= 99}
              aria-label={`Aumentar quantidade de ${line.merchandise.product.title}`}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className={styles.remove}
            onClick={() => removeLine(line.id)}
            aria-label={`Remover ${line.merchandise.product.title} do cesto`}
          >
            Remover
          </button>
        </div>
        <span className="oph-visually-hidden">
          {line.quantity} × {line.merchandise.product.title}
        </span>
      </div>

      <span className={styles.total}>{formatMoney(line.cost.totalAmount)}</span>
    </div>
  );
}
