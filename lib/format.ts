import type { Money } from '@/lib/commerce/types';

/**
 * Portuguese money formatting, exactly as the handoff specifies:
 * `1.234,56 €` — dot thousands, comma decimal, a space before the symbol,
 * always two decimals.
 *
 * Done by hand rather than through Intl: pt-PT's CLDR data omits the grouping
 * separator on four-digit numbers ("1234,56"), which is correct Portuguese but
 * not what the design asks for, and the exact space character Intl emits
 * varies between ICU builds.
 */
export function formatMoney(money: Money): string {
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return money.amount;

  const symbol = money.currencyCode === 'EUR' ? '€' : money.currencyCode;
  const cents = Math.round(Math.abs(amount) * 100);
  const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimals = String(cents % 100).padStart(2, '0');

  return `${amount < 0 ? '-' : ''}${whole},${decimals} ${symbol}`;
}

/** "desde 7,80 €" — a product whose variants span more than one price. */
export function formatFrom(money: Money): string {
  return `desde ${formatMoney(money)}`;
}

/**
 * What a product card shows: a flat price when every variant costs the same,
 * "desde …" when they do not.
 */
export function formatPriceRange(range: {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}): string {
  const min = Number(range.minVariantPrice.amount);
  const max = Number(range.maxVariantPrice.amount);
  return min === max ? formatMoney(range.minVariantPrice) : formatFrom(range.minVariantPrice);
}

export function multiplyMoney(money: Money, quantity: number): Money {
  const cents = Math.round(Number(money.amount) * 100) * quantity;
  return { amount: (cents / 100).toFixed(2), currencyCode: money.currencyCode };
}

export function addMoney(a: Money, b: Money): Money {
  const cents = Math.round(Number(a.amount) * 100) + Math.round(Number(b.amount) * 100);
  return { amount: (cents / 100).toFixed(2), currencyCode: a.currencyCode };
}

export function subtractMoney(a: Money, b: Money): Money {
  const cents = Math.max(0, Math.round(Number(a.amount) * 100) - Math.round(Number(b.amount) * 100));
  return { amount: (cents / 100).toFixed(2), currencyCode: a.currencyCode };
}

export function zeroMoney(currencyCode: string): Money {
  return { amount: '0.00', currencyCode };
}

export function moneyValue(money: Money): number {
  const amount = Number(money.amount);
  return Number.isFinite(amount) ? amount : 0;
}
