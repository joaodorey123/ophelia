'use client';

import { useEffect, useRef } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { Button, TextLink } from '@/components/ui/Button';
import { formatMoney, moneyValue, subtractMoney } from '@/lib/format';
import { SHOP_INDEX } from '@/lib/navigation';

import { CartLineRow } from './CartLineRow';
import styles from './CartDrawer.module.css';
import { CheckoutButton } from './CheckoutButton';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * The cart drawer, implemented as a real modal dialog: focus moves in on open,
 * is trapped while open, Escape and the scrim close it, body scroll is locked,
 * and focus returns to whatever opened it.
 */
export function CartDrawer({ freeShippingFrom }: { freeShippingFrom: number }) {
  const { cart, isOpen, close, error, dismissError } = useCart();
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusTo.current = document.activeElement;
    document.body.dataset.scrollLocked = 'true';
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      delete document.body.dataset.scrollLocked;
      if (restoreFocusTo.current instanceof HTMLElement) restoreFocusTo.current.focus();
    };
  }, [close, isOpen]);

  if (!isOpen) return null;

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;
  const subtotal = cart?.cost.subtotalAmount ?? { amount: '0.00', currencyCode: 'EUR' };
  const remaining = subtractMoney(
    { amount: freeShippingFrom.toFixed(2), currencyCode: subtotal.currencyCode },
    subtotal,
  );
  const qualifies = moneyValue(remaining) <= 0;

  return (
    <div className={styles.overlay}>
      <button type="button" className={styles.scrim} aria-label="Fechar o cesto" onClick={close} />

      <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="O teu cesto" className={styles.drawer}>
        <div className={styles.head}>
          <h2 className={styles.title}>o teu cesto ({cart?.totalQuantity ?? 0})</h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label="Fechar o cesto"
            onClick={close}
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          {error ? (
            <div className={styles.error} role="alert">
              <span>{error}</span>
              <Button onClick={dismissError}>tentar outra vez</Button>
            </div>
          ) : null}

          {isEmpty ? (
            <div className={styles.empty}>
              <p className={styles.emptyCopy}>o cesto está vazio</p>
              <div className={styles.emptyLink}>
                <TextLink href={SHOP_INDEX} small>
                  ver os produtos
                </TextLink>
              </div>
            </div>
          ) : (
            lines.map((line) => <CartLineRow key={line.id} line={line} />)
          )}
        </div>

        {isEmpty ? null : (
          <div className={styles.summary}>
            <div className={styles.row}>
              <span className={styles.subtotalLabel}>subtotal</span>
              <span className={styles.subtotalValue}>{formatMoney(subtotal)}</span>
            </div>

            <p className={styles.nudge}>
              {qualifies
                ? `Envio grátis — acima de ${formatMoney({
                    amount: freeShippingFrom.toFixed(2),
                    currencyCode: subtotal.currencyCode,
                  })} é por nossa conta.`
                : `Faltam ${formatMoney(remaining)} para envio grátis.`}
            </p>

            <CheckoutButton className={styles.checkout} errorClassName={styles.checkoutError}>
              finalizar encomenda
            </CheckoutButton>
          </div>
        )}
      </aside>
    </div>
  );
}

/** Add-to-cart confirmations. Polite so it never interrupts a screen reader. */
export function CartToast() {
  const { toast } = useCart();
  return (
    <div role="status" aria-live="polite">
      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}
