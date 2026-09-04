'use client';

import Image from 'next/image';

import { useCart } from '@/components/cart/CartProvider';
import { CartLineRow } from '@/components/cart/CartLineRow';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { ButtonLink } from '@/components/ui/Button';
import { formatMoney } from '@/lib/format';

import styles from './cart.module.css';

/**
 * The cart page reuses the drawer's line component, so quantity stepping,
 * removal and the gift-message display behave identically in both places.
 */
export function CartPageContent() {
  const { cart, error } = useCart();
  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <div className={styles.empty}>
        <Image
          src="/brand/cesto.png"
          alt=""
          aria-hidden="true"
          width={220}
          height={220}
          className={styles.emptyIllustration}
        />
        <p className={styles.emptyCopy}>O cesto ainda está vazio.</p>
        <ButtonLink href="/comprar/cookies" variant="primary" size="lg">
          Começar pelas cookies
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.layout}>
        <ul className={styles.lines}>
          {lines.map((line) => (
            <li key={line.id}>
              <CartLineRow line={line} />
            </li>
          ))}
        </ul>

        <aside className={styles.summary} aria-labelledby="cart-summary-title">
          <h2 id="cart-summary-title" className={styles.summaryTitle}>
            Resumo
          </h2>
          <div className={styles.row}>
            <span style={{ color: 'var(--oph-ink-65)' }}>Subtotal</span>
            <span>{cart ? formatMoney(cart.cost.subtotalAmount) : '€0'}</span>
          </div>
          <div className={`${styles.row} ${styles.rowMuted}`}>
            <span>Envio</span>
            <span>Calculado no pagamento</span>
          </div>
          <div className={`${styles.row} ${styles.rowTotal}`}>
            <span>Total</span>
            <span>{cart ? formatMoney(cart.cost.totalAmount) : '€0'}</span>
          </div>
          <CheckoutButton className={styles.checkout} />
          <span className={styles.note}>Expedimos de segunda a quinta · entrega até 2 dias</span>
        </aside>
      </div>
    </>
  );
}
