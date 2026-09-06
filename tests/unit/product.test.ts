import { describe, expect, it } from 'vitest';

import type { Product, ProductVariant } from '@/lib/commerce/types';
import {
  cheapestVariant,
  defaultSelection,
  defaultVariant,
  hasChoices,
  isDefaultOption,
  isOptionValueAvailable,
  matchVariant,
  optionValuePrice,
  realOptions,
  variantLabel,
} from '@/lib/product';

function money(amount: string) {
  return { amount, currencyCode: 'EUR' };
}

function variant(
  id: string,
  options: [string, string][],
  price: string,
  availableForSale = true,
): ProductVariant {
  return {
    id,
    title: options.map(([, value]) => value).join(' / '),
    availableForSale,
    quantityAvailable: null,
    price: money(price),
    compareAtPrice: null,
    selectedOptions: options.map(([name, value]) => ({ name, value })),
    sku: null,
    image: null,
  };
}

function product(partial: Partial<Product> & Pick<Product, 'options' | 'variants'>): Product {
  const amounts = partial.variants.map((entry) => Number(entry.price.amount));
  return {
    id: 'gid://test/Product/1',
    handle: 'teste',
    title: 'Teste',
    description: '',
    descriptionHtml: '',
    productType: '',
    vendor: 'Ophelia',
    tags: [],
    availableForSale: true,
    featuredImage: null,
    images: [],
    priceRange: {
      minVariantPrice: money(Math.min(...amounts).toFixed(2)),
      maxVariantPrice: money(Math.max(...amounts).toFixed(2)),
    },
    seo: { title: null, description: null },
    editorial: { kicker: null, badge: null, shortDescription: null, ingredients: null },
    updatedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

/**
 * The real shop uses option names the code cannot predict — "Quantidade",
 * "Cookie variety", "Tamanho" — so these tests use names nothing in the source
 * looks for. A helper that only works on "Tamanho" would pass a test written
 * with "Tamanho" and fail in production.
 */
const cookies = product({
  options: [
    { id: 'o1', name: 'Quantidade', values: ['2', '4', '6'] },
    { id: 'o2', name: 'Cookie variety', values: ['Chocolate chip', 'Linzer'] },
  ],
  variants: [
    variant('v1', [['Quantidade', '2'], ['Cookie variety', 'Chocolate chip']], '40.00'),
    variant('v2', [['Quantidade', '2'], ['Cookie variety', 'Linzer']], '40.00', false),
    variant('v3', [['Quantidade', '4'], ['Cookie variety', 'Chocolate chip']], '50.00'),
    variant('v4', [['Quantidade', '4'], ['Cookie variety', 'Linzer']], '50.00'),
  ],
});

const single = product({
  options: [{ id: 'o1', name: 'Title', values: ['Default Title'] }],
  variants: [variant('v1', [['Title', 'Default Title']], '7.00')],
});

describe('isDefaultOption', () => {
  it('recognises Shopify placeholders', () => {
    expect(isDefaultOption('Default Title')).toBe(true);
    expect(isDefaultOption('Único')).toBe(true);
    expect(isDefaultOption('4 unidades')).toBe(false);
  });
});

describe('realOptions', () => {
  it('drops the synthetic Title option', () => {
    expect(realOptions(single)).toHaveLength(0);
  });

  it('keeps every real option', () => {
    expect(realOptions(cookies).map((option) => option.name)).toEqual([
      'Quantidade',
      'Cookie variety',
    ]);
  });
});

describe('hasChoices', () => {
  it('is false for a product with a single variant', () => {
    expect(hasChoices(single)).toBe(false);
  });

  it('is true when the visitor has something to pick', () => {
    expect(hasChoices(cookies)).toBe(true);
  });
});

describe('variantLabel', () => {
  it('joins the real option values', () => {
    expect(variantLabel(cookies.variants[0]!)).toBe('2 · Chocolate chip');
  });

  it('is empty for an unoptioned product', () => {
    expect(variantLabel(single.variants[0]!)).toBe('');
  });
});

describe('defaultVariant', () => {
  it('takes the first purchasable variant, in catalogue order', () => {
    expect(defaultVariant(cookies)?.id).toBe('v1');
  });

  it('falls back to the first variant when nothing is in stock', () => {
    const soldOut = product({
      options: cookies.options,
      variants: [variant('x1', [['Quantidade', '2']], '40.00', false)],
    });
    expect(defaultVariant(soldOut)?.id).toBe('x1');
  });
});

describe('cheapestVariant', () => {
  it('ignores sold-out variants when a purchasable one exists', () => {
    const mixed = product({
      options: [{ id: 'o1', name: 'Tamanho', values: ['pequeno', 'grande'] }],
      variants: [
        variant('cheap', [['Tamanho', 'pequeno']], '5.00', false),
        variant('ok', [['Tamanho', 'grande']], '9.00'),
      ],
    });
    expect(cheapestVariant(mixed)?.id).toBe('ok');
  });

  it('picks the lowest price among purchasable variants', () => {
    expect(cheapestVariant(cookies)?.id).toBe('v1');
  });
});

describe('matchVariant', () => {
  it('resolves a full selection to a real variant', () => {
    const found = matchVariant(cookies, { Quantidade: '4', 'Cookie variety': 'Linzer' });
    expect(found?.id).toBe('v4');
  });

  it('returns null for a combination the shop does not sell', () => {
    expect(matchVariant(cookies, { Quantidade: '6', 'Cookie variety': 'Linzer' })).toBeNull();
  });
});

describe('isOptionValueAvailable', () => {
  it('is false when every variant carrying the value is sold out', () => {
    expect(
      isOptionValueAvailable(cookies, 'Cookie variety', 'Linzer', { Quantidade: '2' }),
    ).toBe(false);
  });

  it('is true when some combination is purchasable', () => {
    expect(isOptionValueAvailable(cookies, 'Cookie variety', 'Linzer', {})).toBe(true);
  });
});

describe('defaultSelection', () => {
  it('mirrors the default variant', () => {
    expect(defaultSelection(cookies)).toEqual({
      Quantidade: '2',
      'Cookie variety': 'Chocolate chip',
    });
  });
});

describe('optionValuePrice', () => {
  it('gives a price when every variant with that value agrees', () => {
    expect(optionValuePrice(cookies, 'Quantidade', '4')?.amount).toBe('50.00');
  });

  it('gives none when the value spans several prices', () => {
    expect(optionValuePrice(cookies, 'Cookie variety', 'Chocolate chip')).toBeNull();
  });
});
