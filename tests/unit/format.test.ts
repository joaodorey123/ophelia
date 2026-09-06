import { describe, expect, it } from 'vitest';

import {
  addMoney,
  formatFrom,
  formatMoney,
  formatPriceRange,
  moneyValue,
  multiplyMoney,
  subtractMoney,
  zeroMoney,
} from '@/lib/format';

function eur(amount: string) {
  return { amount, currencyCode: 'EUR' };
}

/**
 * The handoff is exact about currency: `1.234,56 €` — dot thousands, comma
 * decimal, a space before the symbol, always two decimals.
 */
describe('formatMoney', () => {
  it('always shows two decimals, even on a round number', () => {
    expect(formatMoney(eur('17.00'))).toBe('17,00 €');
    expect(formatMoney(eur('7.80'))).toBe('7,80 €');
  });

  it('groups thousands with a dot', () => {
    expect(formatMoney(eur('1234.56'))).toBe('1.234,56 €');
    expect(formatMoney(eur('1234567.00'))).toBe('1.234.567,00 €');
  });

  it('rounds to the cent rather than drifting on floats', () => {
    expect(formatMoney(eur('0.1'))).toBe('0,10 €');
    expect(formatMoney(eur('19.999'))).toBe('20,00 €');
  });

  it('handles zero and negatives', () => {
    expect(formatMoney(zeroMoney('EUR'))).toBe('0,00 €');
    expect(formatMoney(eur('-4.90'))).toBe('-4,90 €');
  });

  it('falls back to the raw amount rather than printing NaN', () => {
    expect(formatMoney(eur('n/a'))).toBe('n/a');
  });

  it('uses the currency code when it is not euros', () => {
    expect(formatMoney({ amount: '10.00', currencyCode: 'GBP' })).toBe('10,00 GBP');
  });
});

describe('formatFrom and formatPriceRange', () => {
  it('labels a span of prices with "desde"', () => {
    expect(formatFrom(eur('17.00'))).toBe('desde 17,00 €');
    expect(
      formatPriceRange({ minVariantPrice: eur('30.00'), maxVariantPrice: eur('60.00') }),
    ).toBe('desde 30,00 €');
  });

  it('prints a flat price when every variant costs the same', () => {
    expect(
      formatPriceRange({ minVariantPrice: eur('7.00'), maxVariantPrice: eur('7.00') }),
    ).toBe('7,00 €');
  });
});

describe('money arithmetic', () => {
  it('adds and multiplies in cents, not floats', () => {
    expect(addMoney(eur('0.1'), eur('0.2')).amount).toBe('0.30');
    expect(multiplyMoney(eur('19.99'), 3).amount).toBe('59.97');
  });

  it('produces the product page line total: (size + card) x quantity', () => {
    const size = eur('48.00');
    const card = eur('4.00');
    expect(formatMoney(multiplyMoney(addMoney(size, card), 2))).toBe('104,00 €');
  });

  it('floors a subtraction at zero, so a nudge never reads negative', () => {
    expect(subtractMoney(eur('60.00'), eur('72.50')).amount).toBe('0.00');
    expect(subtractMoney(eur('60.00'), eur('12.50')).amount).toBe('47.50');
  });

  it('reads a numeric value, defaulting to zero for nonsense', () => {
    expect(moneyValue(eur('12.34'))).toBe(12.34);
    expect(moneyValue(eur('oops'))).toBe(0);
  });
});
