'use client';

import { useId, useMemo, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Kicker } from '@/components/ui/Type';
import { CART_ATTRIBUTE, type Product } from '@/lib/commerce/types';
import { addMoney, formatMoney, multiplyMoney } from '@/lib/format';
import {
  defaultSelection,
  isDefaultOption,
  isOptionValueAvailable,
  matchVariant,
  resolveOptions,
  SIZE_OPTION,
} from '@/lib/product';

import styles from './ProductPurchase.module.css';

const MAX_MESSAGE = 120;
const MAX_QUANTITY = 99;

/**
 * The product page's buying panel.
 *
 * Option selection drives the variant, and the variant drives the price, the
 * availability and the add-to-cart total — nothing is derived from a hardcoded
 * price. The personalised card is added as its own line (handoff cart rule 3)
 * and its message is also attached to the product line so the kitchen sees it
 * in context.
 */
export function ProductPurchase({
  product,
  giftCard,
  shippingNote,
}: {
  product: Product;
  /** The "Cartão personalizado" product, when the shop sells one. */
  giftCard: { variantId: string; price: { amount: string; currencyCode: string } } | null;
  shippingNote: string;
}) {
  const { add, isPending } = useCart();

  const [selection, setSelection] = useState<Record<string, string>>(() => defaultSelection(product));
  const [quantity, setQuantity] = useState(1);
  const [cardOn, setCardOn] = useState(false);
  const [cardMessage, setCardMessage] = useState('');

  const messageId = useId();
  const counterId = useId();

  const variant = useMemo(() => matchVariant(product, selection), [product, selection]);

  const { flavour: flavourOption, size: sizeOption } = resolveOptions(product);

  const unitPrice = variant?.price ?? product.priceRange.minVariantPrice;
  const lineTotal = useMemo(() => {
    const base = multiplyMoney(unitPrice, quantity);
    return cardOn && giftCard ? addMoney(base, giftCard.price) : base;
  }, [cardOn, giftCard, quantity, unitPrice]);

  const canBuy = Boolean(variant?.availableForSale) && !isPending;

  function choose(optionName: string, value: string) {
    setSelection((current) => ({ ...current, [optionName]: value }));
  }

  function onAdd() {
    if (!variant) return;

    const message = cardMessage.trim();
    const lines = [
      {
        merchandiseId: variant.id,
        quantity,
        ...(cardOn && message
          ? { attributes: [{ key: CART_ATTRIBUTE.giftMessage, value: message }] }
          : {}),
      },
    ];

    if (cardOn && giftCard) {
      lines.push({ merchandiseId: giftCard.variantId, quantity: 1 });
    }

    // Adds from the product page open the drawer.
    add(lines, { openDrawer: true, toastLabel: product.title });
  }

  /** Hides Shopify's synthetic "Default Title" when it is the only value. */
  const showValues = (values: string[]) =>
    values.filter((value) => !isDefaultOption(value) || values.length > 1);

  return (
    <>
      <div className={styles.detail}>
        <div>
          {product.editorial.kicker ? <Kicker>{product.editorial.kicker}</Kicker> : null}
          <h1 className={styles.title}>{product.title}</h1>
          <p aria-live="polite">
            <span className={styles.price}>{formatMoney(unitPrice)}</span>
            {variant?.compareAtPrice &&
            Number(variant.compareAtPrice.amount) > Number(variant.price.amount) ? (
              <span className={styles.compareAt}>{formatMoney(variant.compareAtPrice)}</span>
            ) : null}
          </p>
          {product.description ? <p className={styles.description}>{product.description}</p> : null}
        </div>

        {/* Sabor — only for products that actually have flavours. */}
        {flavourOption ? (
          <fieldset className={styles.optionGroup}>
            <legend>
              <FieldLabel>{flavourOption.name}</FieldLabel>
            </legend>
            <div className={styles.pills}>
              {showValues(flavourOption.values).map((value) => {
                const selected = selection[flavourOption.name] === value;
                const available = isOptionValueAvailable(product, flavourOption.name, value, {});
                return (
                  <button
                    key={value}
                    type="button"
                    className={[
                      styles.pill,
                      selected ? styles.pillSelected : undefined,
                      available ? undefined : styles.pillUnavailable,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => choose(flavourOption.name, value)}
                    disabled={!available}
                    aria-pressed={selected}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {/* Tamanho da caixa — kept visible even for single-size products. */}
        {sizeOption ? (
          <fieldset className={styles.optionGroup}>
            <legend>
              <FieldLabel>
                {sizeOption.name === SIZE_OPTION ? 'Tamanho da caixa' : sizeOption.name}
              </FieldLabel>
            </legend>
            <div className={styles.sizeGrid}>
              {sizeOption.values.map((value) => {
                const selected = selection[sizeOption.name] === value;
                const available = isOptionValueAvailable(product, sizeOption.name, value, {
                  ...(flavourOption && selection[flavourOption.name]
                    ? { [flavourOption.name]: selection[flavourOption.name] as string }
                    : {}),
                });
                const candidate = matchVariant(product, { ...selection, [sizeOption.name]: value });
                return (
                  <button
                    key={value}
                    type="button"
                    className={[
                      styles.sizeCard,
                      selected ? styles.sizeCardSelected : undefined,
                      available ? undefined : styles.sizeCardUnavailable,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => choose(sizeOption.name, value)}
                    disabled={!available}
                    aria-pressed={selected}
                  >
                    <span className={styles.sizeLabel}>
                      {isDefaultOption(value) ? 'Tamanho único' : value}
                    </span>
                    <span className={styles.sizePrice}>
                      {candidate ? formatMoney(candidate.price) : 'Indisponível'}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {variant && !variant.availableForSale ? (
          <p className={styles.soldOut} role="status">
            Esta combinação está esgotada de momento. Escolhe outro tamanho ou sabor, ou escreve-nos
            para info@callmeophelia.com.
          </p>
        ) : null}

        {!variant ? (
          <p className={styles.soldOut} role="status">
            Esta combinação não existe. Escolhe outro tamanho ou sabor.
          </p>
        ) : null}

        <div className={styles.buyRow}>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className={styles.stepperValue} aria-hidden="true">
              {quantity}
            </span>
            <span className="oph-visually-hidden" aria-live="polite">
              Quantidade: {quantity}
            </span>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
              disabled={quantity >= MAX_QUANTITY}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <Button variant="primary" size="lg" grow onClick={onAdd} disabled={!canBuy}>
            {isPending ? 'A adicionar…' : `Adicionar ao cesto · ${formatMoney(lineTotal)}`}
          </Button>
        </div>

        {/* Cartão personalizado */}
        {giftCard ? (
          <div className={styles.cardPanel}>
            <label className={styles.cardLabel}>
              <input
                type="checkbox"
                checked={cardOn}
                onChange={(event) => setCardOn(event.target.checked)}
                className={styles.cardCheckbox}
              />
              <span>
                <span className={styles.cardTitle}>
                  Adicionar cartão personalizado{' '}
                  <span className={styles.cardPrice}>+ {formatMoney(giftCard.price)}</span>
                </span>
                <span className={styles.cardHelp}>
                  Escrito à mão por nós e colocado dentro da caixa.
                </span>
              </span>
            </label>

            {cardOn ? (
              <>
                <label htmlFor={messageId} className="oph-visually-hidden">
                  A tua mensagem para o cartão
                </label>
                <textarea
                  id={messageId}
                  rows={3}
                  maxLength={MAX_MESSAGE}
                  value={cardMessage}
                  onChange={(event) => setCardMessage(event.target.value)}
                  placeholder="Escreve a tua mensagem"
                  className={styles.cardTextarea}
                  aria-describedby={counterId}
                />
                <span id={counterId} className={styles.cardCounter} aria-live="polite">
                  {cardMessage.length}/{MAX_MESSAGE} caracteres
                </span>
              </>
            ) : null}
          </div>
        ) : null}

        <p className={styles.shippingNote}>{shippingNote}</p>

        {product.editorial.ingredients ? (
          <div className={styles.ingredients}>
            <h2 className={styles.ingredientsTitle}>Ingredientes</h2>
            <p className={styles.ingredientsBody}>{product.editorial.ingredients}</p>
          </div>
        ) : null}
      </div>

      {/* Mobile sticky bar — the live line total plus a single action. */}
      <div className={styles.buyBar}>
        <div className={styles.buyBarMeta}>
          <span className={styles.buyBarName}>{product.title}</span>
          <span className={styles.buyBarTotal}>{formatMoney(lineTotal)}</span>
        </div>
        <Button
          variant="primary"
          size="md"
          className={styles.buyBarAction}
          onClick={onAdd}
          disabled={!canBuy}
        >
          Adicionar ao cesto
        </Button>
      </div>
    </>
  );
}
