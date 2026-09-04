'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { Button, ButtonLink } from '@/components/ui/Button';
import type { CrossSellItem } from '@/lib/commerce/cross-sell';
import { formatMoney } from '@/lib/format';

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
export function CartDrawer({ crossSell }: { crossSell: CrossSellItem[] }) {
  const { cart, isOpen, close, add, error, dismissError } = useCart();
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

      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

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
  const inCart = new Set(lines.map((line) => line.merchandise.product.handle));
  const suggestions = crossSell.filter((item) => !inCart.has(item.handle)).slice(0, 3);

  return (
    <div className={styles.overlay}>
      <button type="button" className={styles.scrim} aria-label="Fechar o cesto" onClick={close} />

      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="O teu cesto"
        className={styles.drawer}
      >
        <div className={styles.head}>
          <h2 className={styles.title}>O teu cesto</h2>
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
              <Button variant="outlineBlue" size="xs" onClick={dismissError}>
                Tentar outra vez
              </Button>
            </div>
          ) : null}

          {isEmpty ? (
            <div className={styles.empty}>
              <Image
                src="/brand/cesto.png"
                alt=""
                width={220}
                height={220}
                className={styles.emptyIllustration}
              />
              <p className={styles.emptyCopy}>O cesto ainda está vazio.</p>
              <ButtonLink href="/comprar/cookies" variant="primary" size="md" onClick={close}>
                Começar pelas cookies
              </ButtonLink>
            </div>
          ) : (
            lines.map((line) => <CartLineRow key={line.id} line={line} />)
          )}

          {!isEmpty && suggestions.length > 0 ? (
            <section className={styles.suggest} aria-labelledby="cart-suggest-title">
              <h3 id="cart-suggest-title" className={styles.suggestTitle}>
                Ainda falta alguma coisa?
              </h3>
              <ul className={styles.suggestList}>
                {suggestions.map((item) => (
                  <li key={item.variantId} className={styles.suggestRow}>
                    <span className={styles.suggestLabel}>
                      <Link href={`/produto/${item.handle}`} onClick={close}>
                        {item.title}
                      </Link>{' '}
                      <span className={styles.suggestPrice}>
                        · {item.sizeLabel} · {formatMoney(item.price)}
                      </span>
                    </span>
                    <Button
                      variant="outlineBlue"
                      size="xs"
                      onClick={() =>
                        add([{ merchandiseId: item.variantId, quantity: 1 }], {
                          toastLabel: item.title,
                        })
                      }
                      aria-label={`Juntar ${item.title} ao cesto`}
                    >
                      Juntar
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className={styles.summary}>
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
          <CheckoutButton className={styles.checkout} disabled={isEmpty} />
          <span className={styles.note}>Expedimos de segunda a quinta · entrega até 2 dias</span>
        </div>
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
