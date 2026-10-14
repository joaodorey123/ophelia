import { describe, expect, it } from 'vitest';

import type { Product } from '@/lib/commerce/types';
import { matchPages, normalize, rankProducts } from '@/lib/search-match';

function product(title: string, extra: Partial<Product> = {}): Product {
  return {
    id: title,
    handle: normalize(title).replace(/ /g, '-'),
    title,
    description: '',
    descriptionHtml: '',
    productType: '',
    vendor: 'Ophelia',
    tags: [],
    availableForSale: true,
    featuredImage: null,
    images: [],
    options: [],
    variants: [],
    priceRange: {
      minVariantPrice: { amount: '1', currencyCode: 'EUR' },
      maxVariantPrice: { amount: '1', currencyCode: 'EUR' },
    },
    seo: { title: null, description: null },
    editorial: { kicker: null, badge: null, shortDescription: null, ingredients: null },
    updatedAt: '2026-01-01',
    ...extra,
  } as Product;
}

const catalogue = [
  product('Café da Ophelia em Grão', { productType: 'Mercearia' }),
  product('Ophelia Cookies NY', { productType: 'Cookies' }),
  product('Ophelia CookieBrownie', { productType: 'Cookies' }),
  product('O Mel de Rosmaninho', { description: 'colhido entre julho e agosto' }),
  product('A Granola da Ophelia', { description: 'aveia, frutos secos, mel e canela' }),
];

describe('shop search', () => {
  it('ignores accents and case', () => {
    expect(rankProducts(catalogue, 'cafe')[0]?.title).toBe('Café da Ophelia em Grão');
    expect(rankProducts(catalogue, 'CAFÉ')[0]?.title).toBe('Café da Ophelia em Grão');
  });

  it('matches the start of a word and plurals', () => {
    expect(rankProducts(catalogue, 'cook').map((p) => p.title)).toContain('Ophelia CookieBrownie');
    expect(rankProducts(catalogue, 'cookies').map((p) => p.title)).toContain('Ophelia Cookies NY');
  });

  it('puts title matches before description matches', () => {
    const titles = rankProducts(catalogue, 'mel').map((p) => p.title);
    expect(titles[0]).toBe('O Mel de Rosmaninho');
    expect(titles).toContain('A Granola da Ophelia');
  });

  it('does not match inside other words', () => {
    const titles = rankProducts(
      [...catalogue, product('Cookie Banoffee', { description: 'açúcar amarelo, caramelizada, o melhor' })],
      'mel',
    ).map((p) => p.title);
    expect(titles).not.toContain('Cookie Banoffee');
  });

  it('requires every word', () => {
    expect(rankProducts(catalogue, 'mel brownie')).toEqual([]);
  });

  it('offers pages for things that are not products', () => {
    expect(matchPages('bolo').map((p) => p.href)).toContain('/bolos');
    expect(matchPages('panquecas').map((p) => p.href)).toContain('/menu');
    expect(matchPages('reservar', 'https://umai').map((p) => p.href)).toContain('https://umai');
    expect(matchPages('xy')).toEqual([]);
  });
});
