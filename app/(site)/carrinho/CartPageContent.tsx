'use client';

import { CartLineRow } from '@/components/cart/CartLineRow';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { useCart } from '@/components/cart/CartProvider';
import { TextLink } from '@/components/ui/Button';
import { formatMoney, moneyValue, subtractMoney } from '@/lib/format';
import { SHOP_INDEX } from '@/lib/navigation';

import styles from './cart.module.css';

/**
 * The full cart page. Shares the provider with the drawer, so the two are
 * always the same cart, and hands off to Shopify checkout exactly as the
 * drawer does.
 */
export function CartPageContent({ freeShippingFrom }: { freeShippingFrom: number }) {
  const { cart } = useCart();
  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>o cesto está vazio</p>
        <div className={styles.emptyLink}>
          <TextLink href={SHOP_INDEX}>ver os produtos</TextLink>
        </div>
      </div>
    );
  }

  const subtotal = cart?.cost.subtotalAmount ?? { amount: '0.00', currencyCode: 'EUR' };
  const remaining = subtractMoney(
    { amount: freeShippingFrom.toFixed(2), currencyCode: subtotal.currencyCode },
    subtotal,
  );
  const qualifies = moneyValue(remaining) <= 0;

  return (
    <div className={styles.layout}>
      <div className={styles.lines}>
        {lines.map((line) => (
          <CartLineRow key={line.id} line={line} />
        ))}
      </div>

      <aside className={styles.summary} aria-label="Resumo da encomenda">
        <div className={styles.row}>
          <span>subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className={`${styles.row} ${styles.rowMuted}`}>
          <span>envio</span>
          <span>calculado no pagamento</span>
        </div>

        <div className={`${styles.row} ${styles.total}`}>
          <span>total</span>
          <span className={styles.totalValue}>
            {formatMoney(cart?.cost.totalAmount ?? subtotal)}
          </span>
        </div>

        <p className={styles.rowMuted}>
          {qualifies
            ? 'Envio grátis — é por nossa conta.'
            : `Faltam ${formatMoney(remaining)} para envio grátis.`}
        </p>

        <CheckoutButton className={styles.checkout} errorClassName={styles.checkoutError}>
          finalizar encomenda
        </CheckoutButton>
      </aside>
    </div>
  );
}
