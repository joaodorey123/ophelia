import type { Money } from '@/lib/commerce/types';

/**
 * Portuguese money formatting, matching the handoff exactly:
 * whole values render "€17", decimals render "€7,80" (comma separator).
 * Ported from the prototype's `eur()` helper.
 */
export function formatMoney(money: Money): string {
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return money.amount;

  const symbol = money.currencyCode === 'EUR' ? '€' : `${money.currencyCode} `;
  const cents = Math.round(amount * 100);

  if (cents % 100 === 0) return `${symbol}${cents / 100}`;
  return `${symbol}${(cents / 100).toFixed(2).replace('.', ',')}`;
}

/** "desde €17" — used on cards where a product spans several sizes. */
export function formatFrom(money: Money): string {
  return `desde ${formatMoney(money)}`;
}

export function multiplyMoney(money: Money, quantity: number): Money {
  const cents = Math.round(Number(money.amount) * 100) * quantity;
  return { amount: (cents / 100).toFixed(2), currencyCode: money.currencyCode };
}

export function addMoney(a: Money, b: Money): Money {
  const cents = Math.round(Number(a.amount) * 100) + Math.round(Number(b.amount) * 100);
  return { amount: (cents / 100).toFixed(2), currencyCode: a.currencyCode };
}

export function zeroMoney(currencyCode: string): Money {
  return { amount: '0.00', currencyCode };
}
