'use client';

import { useMemo, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/Button';
import { CART_ATTRIBUTE, type Product } from '@/lib/commerce/types';
import { addMoney, formatMoney, multiplyMoney } from '@/lib/format';
import {
  defaultSelection,
  isOptionValueAvailable,
  matchVariant,
  optionValuePrice,
  realOptions,
} from '@/lib/product';

import styles from './ProductPurchase.module.css';

export type GiftCard = {
  variantId: string;
  price: { amount: string; currencyCode: string };
};

export type Panel = { id: string; title: string; body: string };

/**
 * The buying panel: options, the handwritten-card add-on, quantity and the
 * add button, then the accordions.
 *
 * Selecting an option resolves a real Shopify variant — `selected` is the
 * merchandise that goes into the cart, never a visual state that happens to
 * look chosen. A combination Shopify does not sell renders inert rather than
 * silently falling back to another variant.
 */
export function ProductPurchase({
  product,
  giftCard,
  panels,
  giftCardTitle,
  giftCardNote,
}: {
  product: Product;
  giftCard: GiftCard | null;
  panels: Panel[];
  giftCardTitle: string;
  giftCardNote: string;
}) {
  const { add, isPending } = useCart();

  const options = useMemo(() => realOptions(product), [product]);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    defaultSelection(product),
  );
  const [quantity, setQuantity] = useState(1);
  const [withCard, setWithCard] = useState(false);
  const [message, setMessage] = useState('');
  const [openPanel, setOpenPanel] = useState<string | null>(panels[0]?.id ?? null);

  const selected = matchVariant(product, selection);
  const unitPrice = selected?.price ?? product.priceRange.minVariantPrice;

  const total = useMemo(() => {
    const base = multiplyMoney(unitPrice, quantity);
    return withCard && giftCard ? addMoney(base, giftCard.price) : base;
  }, [giftCard, quantity, unitPrice, withCard]);

  const canBuy = Boolean(selected?.availableForSale) && !isPending;

  function onAdd() {
    if (!selected) return;
    const trimmed = message.trim();
    add(
      [
        { merchandiseId: selected.id, quantity },
        ...(withCard && giftCard
          ? [
              {
                merchandiseId: giftCard.variantId,
                quantity: 1,
                ...(trimmed
                  ? { attributes: [{ key: CART_ATTRIBUTE.giftMessage, value: trimmed }] }
                  : {}),
              },
            ]
          : []),
      ],
      { openDrawer: true, toastLabel: product.title },
    );
  }

  return (
    <div className={styles.panel}>
      <div
        className={styles.description}
        // Shopify sanitises descriptionHtml before it leaves the Storefront API.
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      />

      {options.map((option) => (
        <div key={option.id} className={styles.option}>
          <span className={styles.optionLabel} id={`option-${option.id}`}>
            {option.name.toLowerCase()}
          </span>
          <div className={styles.values} role="group" aria-labelledby={`option-${option.id}`}>
            {option.values.map((value) => {
              const isSelected = selection[option.name] === value;
              const available = isOptionValueAvailable(product, option.name, value, {});
              const price = optionValuePrice(product, option.name, value);
              return (
                <button
                  key={value}
                  type="button"
                  className={[
                    styles.value,
                    isSelected ? styles.valueSelected : '',
                    available ? '' : styles.valueUnavailable,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={isSelected}
                  disabled={!available}
                  onClick={() => setSelection((current) => ({ ...current, [option.name]: value }))}
                >
                  <span className={styles.valueName}>{value}</span>
                  {price ? <span className={styles.valuePrice}>{formatMoney(price)}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {giftCard ? (
        <>
          <label className={styles.addon}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={withCard}
              onChange={(event) => setWithCard(event.target.checked)}
            />
            <span>
              <span className={styles.addonTitle}>{giftCardTitle}</span>
              <span className={styles.addonNote}>
                {giftCardNote} · {formatMoney(giftCard.price)}
              </span>
            </span>
          </label>

          {withCard ? (
            <>
              <label className="oph-sr-only" htmlFor="oph-gift-message">
                A mensagem do cartão
              </label>
              <textarea
                id="oph-gift-message"
                className={styles.message}
                rows={3}
                maxLength={280}
                placeholder="a mensagem que queres que escrevamos…"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </>
          ) : null}
        </>
      ) : null}

      <div className={styles.buy}>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepperButton}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className={styles.stepperValue} aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className={styles.stepperButton}
            onClick={() => setQuantity((current) => Math.min(99, current + 1))}
            disabled={quantity >= 99}
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>

        <Button variant="primary" className={styles.add} onClick={onAdd} disabled={!canBuy}>
          {isPending
            ? 'a juntar…'
            : selected?.availableForSale
              ? `juntar ao cesto · ${formatMoney(total)}`
              : 'esgotado'}
        </Button>
      </div>

      {selected && !selected.availableForSale ? (
        <p className={styles.stock} role="status">
          Esta opção está esgotada. Escolhe outra ou escreve-nos.
        </p>
      ) : null}
      {!selected ? (
        <p className={styles.stock} role="status">
          Esta combinação não está disponível.
        </p>
      ) : null}

      <div className={styles.panels}>
        {panels.map((panel) => {
          const isOpen = openPanel === panel.id;
          return (
            <div key={panel.id} className={styles.panelRow}>
              <button
                type="button"
                className={styles.panelButton}
                aria-expanded={isOpen}
                aria-controls={`panel-${panel.id}`}
                onClick={() => setOpenPanel(isOpen ? null : panel.id)}
              >
                <span className={styles.panelTitle}>{panel.title}</span>
                <span className={styles.panelSign} aria-hidden>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              <div
                id={`panel-${panel.id}`}
                className={`${styles.panelBody} ${isOpen ? styles.panelBodyOpen : ''}`}
                /* `hidden` would cancel the max-height transition, so the
                   collapsed body is made inert instead: invisible to the
                   pointer, and skipped by tab order and screen readers. */
                inert={!isOpen}
              >
                <p className={styles.panelText}>{panel.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
