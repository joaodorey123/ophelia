import { describe, expect, it } from 'vitest';

import type { Product, ProductVariant } from '@/lib/commerce/types';
import {
  cheapestVariant,
  defaultSelection,
  defaultVariant,
  isDefaultOption,
  isOptionValueAvailable,
  matchVariant,
  resolveOptions,
  sizeLabel,
  sizeSteps,
  variantLabel,
} from '@/lib/product';

function variant(
  id: string,
  options: [string, string][],
  price: string,
  available = true,
): ProductVariant {
  return {
    id,
    title: options.map(([, value]) => value).join(' / '),
    availableForSale: available,
    quantityAvailable: null,
    sku: id,
    price: { amount: price, currencyCode: 'EUR' },
    compareAtPrice: null,
    selectedOptions: options.map(([name, value]) => ({ name, value })),
    image: null,
  };
}

function product(partial: Partial<Product> & Pick<Product, 'variants' | 'options'>): Product {
  const prices = partial.variants.map((v) => Number(v.price.amount));
  return {
    id: 'p',
    handle: 'p',
    title: 'P',
    description: '',
    descriptionHtml: '',
    productType: '',
    vendor: 'Ophelia',
    tags: [],
    availableForSale: true,
    featuredImage: null,
    images: [],
    priceRange: {
      minVariantPrice: { amount: String(Math.min(...prices)), currencyCode: 'EUR' },
      maxVariantPrice: { amount: String(Math.max(...prices)), currencyCode: 'EUR' },
    },
    seo: { title: null, description: null },
    editorial: { kicker: null, badge: null, shortDescription: null, ingredients: null },
    updatedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

/** Ophelia Cookies: the only SKU with flavours — 4 flavours x 3 sizes. */
const cookies = product({
  options: [
    { id: 'o1', name: 'Sabor', values: ['Tradicional', 'Red Velvet', 'Cacau', 'Limão'] },
    { id: 'o2', name: 'Tamanho', values: ['4 unidades', '8 unidades', '12 unidades'] },
  ],
  variants: [
    variant('v1', [['Sabor', 'Tradicional'], ['Tamanho', '4 unidades']], '17.00'),
    variant('v2', [['Sabor', 'Tradicional'], ['Tamanho', '8 unidades']], '32.00'),
    variant('v3', [['Sabor', 'Tradicional'], ['Tamanho', '12 unidades']], '48.00'),
    variant('v4', [['Sabor', 'Red Velvet'], ['Tamanho', '4 unidades']], '17.00'),
    // Red Velvet 8-unit is sold out; 12-unit does not exist at all.
    variant('v5', [['Sabor', 'Red Velvet'], ['Tamanho', '8 unidades']], '32.00', false),
  ],
});

/** Café: the first variant is the dearer whole-bean one, by merchant order. */
const cafe = product({
  options: [{ id: 'o1', name: 'Tamanho', values: ['250 g · em grão', '250 g · em pó'] }],
  variants: [
    variant('c1', [['Tamanho', '250 g · em grão']], '18.00'),
    variant('c2', [['Tamanho', '250 g · em pó']], '8.00'),
  ],
});

describe('options', () => {
  it('resolves Sabor only when it offers a real choice', () => {
    expect(resolveOptions(cookies).flavour?.name).toBe('Sabor');
    expect(resolveOptions(cafe).flavour).toBeNull();
  });

  it('always resolves a size option', () => {
    expect(resolveOptions(cookies).size?.name).toBe('Tamanho');
    expect(resolveOptions(cafe).size?.name).toBe('Tamanho');
  });

  it('falls back to the other option when the shop named the size differently', () => {
    const odd = product({
      options: [{ id: 'o', name: 'Formato', values: ['Pequeno', 'Grande'] }],
      variants: [
        variant('x1', [['Formato', 'Pequeno']], '5.00'),
        variant('x2', [['Formato', 'Grande']], '9.00'),
      ],
    });
    expect(resolveOptions(odd).size?.name).toBe('Formato');
  });

  it('treats Shopify\'s synthetic option values as absent', () => {
    expect(isDefaultOption('Default Title')).toBe(true);
    expect(isDefaultOption('Único')).toBe(true);
    expect(isDefaultOption('4 unidades')).toBe(false);
  });

  it('defaults to the first purchasable variant\'s options', () => {
    expect(defaultSelection(cookies)).toEqual({ Sabor: 'Tradicional', Tamanho: '4 unidades' });
  });
});

describe('variant matching', () => {
  it('finds the variant for a full selection', () => {
    expect(matchVariant(cookies, { Sabor: 'Tradicional', Tamanho: '12 unidades' })?.id).toBe('v3');
  });

  it('returns null for a combination that does not exist', () => {
    expect(matchVariant(cookies, { Sabor: 'Red Velvet', Tamanho: '12 unidades' })).toBeNull();
  });

  it('marks a sold-out combination unavailable', () => {
    expect(isOptionValueAvailable(cookies, 'Tamanho', '8 unidades', { Sabor: 'Red Velvet' })).toBe(
      false,
    );
    expect(isOptionValueAvailable(cookies, 'Tamanho', '8 unidades', { Sabor: 'Tradicional' })).toBe(
      true,
    );
  });

  it('marks a non-existent combination unavailable', () => {
    expect(isOptionValueAvailable(cookies, 'Tamanho', '12 unidades', { Sabor: 'Red Velvet' })).toBe(
      false,
    );
  });
});

describe('card variants', () => {
  it('uses the first variant as the default a pantry card shows', () => {
    // The design's cross-sell reads "Café da Ophelia · 250 g em grão · €18".
    expect(defaultVariant(cafe)?.id).toBe('c1');
  });

  it('uses the cheapest variant for a favourite card\'s add button', () => {
    // The handoff: the favourite card "adds the smallest size directly".
    expect(cheapestVariant(cookies)?.price.amount).toBe('17.00');
    expect(cheapestVariant(cafe)?.id).toBe('c2');
  });

  it('lists each distinct size once, in catalogue order', () => {
    expect(sizeSteps(cookies).map((step) => step.label)).toEqual([
      '4 unidades',
      '8 unidades',
      '12 unidades',
    ]);
  });
});

describe('labels', () => {
  it('joins option values for the cart line', () => {
    expect(variantLabel(cookies.variants[0]!)).toBe('Tradicional · 4 unidades');
  });

  it('extracts the size alone', () => {
    expect(sizeLabel(cookies.variants[0]!)).toBe('4 unidades');
    expect(sizeLabel(cafe.variants[0]!)).toBe('250 g · em grão');
  });

  it("never leaks Shopify's synthetic option value into the cart", () => {
    const single = product({
      options: [{ id: 'o', name: 'Tamanho', values: ['Default Title'] }],
      variants: [variant('s1', [['Tamanho', 'Default Title']], '4.00')],
    });
    expect(variantLabel(single.variants[0]!)).toBe('');
    expect(sizeLabel(single.variants[0]!)).toBe('');
  });
});
