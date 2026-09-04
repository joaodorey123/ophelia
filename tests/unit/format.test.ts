import { describe, expect, it } from 'vitest';

import { addMoney, formatFrom, formatMoney, multiplyMoney, zeroMoney } from '@/lib/format';

const eur = (amount: string) => ({ amount, currencyCode: 'EUR' });

/**
 * The handoff fixes money formatting exactly: "Money formatting is Portuguese:
 * whole values render €17, decimals render €7,80 (comma)."
 */
describe('formatMoney', () => {
  it('renders whole values without decimals', () => {
    expect(formatMoney(eur('17.00'))).toBe('€17');
    expect(formatMoney(eur('48'))).toBe('€48');
    expect(formatMoney(eur('175.00'))).toBe('€175');
  });

  it('renders decimals with a comma', () => {
    expect(formatMoney(eur('7.80'))).toBe('€7,80');
    expect(formatMoney(eur('4.85'))).toBe('€4,85');
    expect(formatMoney(eur('13.90'))).toBe('€13,90');
    expect(formatMoney(eur('19.90'))).toBe('€19,90');
  });

  it('renders zero', () => {
    expect(formatMoney(zeroMoney('EUR'))).toBe('€0');
  });

  it('falls back to the raw amount when it is not a number', () => {
    expect(formatMoney(eur('not-a-price'))).toBe('not-a-price');
  });

  it('prefixes a non-euro currency with its code', () => {
    expect(formatMoney({ amount: '10.00', currencyCode: 'GBP' })).toBe('GBP 10');
  });

  it('formats the "desde" label used on cards spanning several sizes', () => {
    expect(formatFrom(eur('17.00'))).toBe('desde €17');
  });
});

describe('money arithmetic', () => {
  it('multiplies without floating-point drift', () => {
    expect(multiplyMoney(eur('7.80'), 3)).toEqual(eur('23.40'));
    // 4.85 * 3 is 14.549999... in binary floating point.
    expect(multiplyMoney(eur('4.85'), 3)).toEqual(eur('14.55'));
    expect(multiplyMoney(eur('0.10'), 3)).toEqual(eur('0.30'));
  });

  it('adds without floating-point drift', () => {
    expect(addMoney(eur('0.10'), eur('0.20'))).toEqual(eur('0.30'));
    expect(addMoney(eur('48.00'), eur('4.00'))).toEqual(eur('52.00'));
  });

  it('produces the product page line total: (size + card) x quantity', () => {
    const size = eur('48.00');
    const card = eur('4.00');
    expect(formatMoney(multiplyMoney(addMoney(size, card), 2))).toBe('€104');
  });
});
