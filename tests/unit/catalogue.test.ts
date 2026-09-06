import { describe, expect, it } from 'vitest';

import {
  FIXTURE_COLLECTIONS,
  FIXTURE_COLLECTION_PRODUCTS,
  FIXTURE_PRODUCTS,
  FIXTURE_SUGGESTIONS,
} from '@/lib/catalogue/fixture-data';

/**
 * Integrity of the development fixture.
 *
 * The fixture is generated from the handoff's own catalogue, so these tests
 * guard the generation: a broken handle or a dangling cross-sell would show up
 * as a 404 in the browser rather than a type error.
 */
describe('fixture catalogue', () => {
  it('carries every product from the handoff', () => {
    expect(FIXTURE_PRODUCTS).toHaveLength(27);
  });

  it('gives every product a unique handle', () => {
    const handles = FIXTURE_PRODUCTS.map((product) => product.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it('gives every product at least one variant and one image', () => {
    for (const product of FIXTURE_PRODUCTS) {
      expect(product.variants.length, product.handle).toBeGreaterThan(0);
      expect(product.images.length, product.handle).toBeGreaterThan(0);
      expect(product.featuredImage, product.handle).not.toBeNull();
    }
  });

  it('prices every variant as a two-decimal string', () => {
    for (const product of FIXTURE_PRODUCTS) {
      for (const variant of product.variants) {
        expect(variant.price.amount, `${product.handle}/${variant.title}`).toMatch(/^\d+\.\d{2}$/);
        expect(variant.price.currencyCode).toBe('EUR');
      }
    }
  });

  it('keeps the price range consistent with the variants', () => {
    for (const product of FIXTURE_PRODUCTS) {
      const amounts = product.variants.map((variant) => Number(variant.price.amount));
      expect(Number(product.priceRange.minVariantPrice.amount)).toBe(Math.min(...amounts));
      expect(Number(product.priceRange.maxVariantPrice.amount)).toBe(Math.max(...amounts));
    }
  });

  it('points every collection entry at a product that exists', () => {
    const handles = new Set(FIXTURE_PRODUCTS.map((product) => product.handle));
    for (const [collection, members] of Object.entries(FIXTURE_COLLECTION_PRODUCTS)) {
      for (const member of members) {
        expect(handles.has(member), `${collection} → ${member}`).toBe(true);
      }
    }
  });

  it('lists every collection referenced by a product', () => {
    const declared = new Set(FIXTURE_COLLECTIONS.map((collection) => collection.handle));
    for (const collection of Object.keys(FIXTURE_COLLECTION_PRODUCTS)) {
      expect(declared.has(collection), collection).toBe(true);
    }
  });

  it('never suggests a product that does not exist, or itself', () => {
    const handles = new Set(FIXTURE_PRODUCTS.map((product) => product.handle));
    for (const [handle, suggestions] of Object.entries(FIXTURE_SUGGESTIONS)) {
      for (const suggestion of suggestions) {
        expect(handles.has(suggestion), `${handle} → ${suggestion}`).toBe(true);
        expect(suggestion).not.toBe(handle);
      }
    }
  });

  it('serves every image from a root-relative path', () => {
    for (const product of FIXTURE_PRODUCTS) {
      for (const image of product.images) {
        expect(image.url, product.handle).toMatch(/^\/photos\/.+\.(jpe?g|png)$/);
      }
    }
  });
});
