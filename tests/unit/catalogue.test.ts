import { beforeAll, describe, expect, it } from 'vitest';

import { SEED_COLLECTIONS, SEED_PRODUCTS } from '@/lib/catalogue/data';
import type { CartSource, CatalogueSource } from '@/lib/commerce/types';

let catalogue: CatalogueSource;
let cart: CartSource;

beforeAll(async () => {
  // The adapter is server-only; stub the marker module for the unit run.
  const mod = await import('@/lib/catalogue/adapter');
  catalogue = mod.localCatalogue;
  cart = mod.localCart;
});

describe('local catalogue data integrity', () => {
  it('has unique product handles', () => {
    const handles = SEED_PRODUCTS.map((p) => p.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it('has unique variant SKUs within each product', () => {
    for (const product of SEED_PRODUCTS) {
      const skus = product.variants.map((v) => v.sku);
      expect(new Set(skus).size, `${product.handle} has duplicate SKUs`).toBe(skus.length);
    }
  });

  it('gives every variant one value per declared option', () => {
    for (const product of SEED_PRODUCTS) {
      for (const variant of product.variants) {
        expect(variant.options.length, `${product.handle}/${variant.sku}`).toBe(
          product.optionNames.length,
        );
      }
    }
  });

  it('prices every variant above zero', () => {
    for (const product of SEED_PRODUCTS) {
      for (const variant of product.variants) {
        expect(variant.price, `${product.handle}/${variant.sku}`).toBeGreaterThan(0);
      }
    }
  });

  it('only references products that exist from a collection', () => {
    const handles = new Set(SEED_PRODUCTS.map((p) => p.handle));
    for (const collection of SEED_COLLECTIONS) {
      for (const handle of collection.productHandles) {
        expect(handles.has(handle), `${collection.handle} references missing ${handle}`).toBe(true);
      }
    }
  });

  it('keeps the prices the handoff fixes as the source of truth', async () => {
    const cookies = await catalogue.getProduct('ophelia-cookies');
    const byLabel = Object.fromEntries(
      (cookies?.variants ?? [])
        .filter((v) => v.selectedOptions[0]?.value === 'Tradicional')
        .map((v) => [v.selectedOptions[1]?.value, v.price.amount]),
    );
    expect(byLabel).toEqual({
      '4 unidades': '17.00',
      '8 unidades': '32.00',
      '12 unidades': '48.00',
    });
  });

  it('lists the coffee whole-bean variant first, as the cross-sell design requires', async () => {
    const cafe = await catalogue.getProduct('cafe-da-ophelia');
    expect(cafe?.variants[0]?.selectedOptions[0]?.value).toBe('250 g · em grão');
    expect(cafe?.variants[0]?.price.amount).toBe('18.00');
  });

  it('sells a gift card, which the product page depends on', async () => {
    const card = await catalogue.getProduct('cartao-personalizado');
    expect(card?.variants[0]?.price.amount).toBe('4.00');
  });
});

describe('local catalogue queries', () => {
  it('returns null for an unknown product or collection', async () => {
    expect(await catalogue.getProduct('nao-existe')).toBeNull();
    expect(await catalogue.getCollection('nao-existe')).toBeNull();
    expect(await catalogue.getCollectionProducts('nao-existe')).toBeNull();
  });

  it('matches search accent-insensitively', async () => {
    const withAccent = await catalogue.searchProducts('café');
    const without = await catalogue.searchProducts('cafe');
    expect(without.map((p) => p.handle)).toEqual(withAccent.map((p) => p.handle));
    expect(without.some((p) => p.handle === 'cafe-da-ophelia')).toBe(true);
  });

  it('returns nothing for an empty search', async () => {
    expect(await catalogue.searchProducts('   ')).toEqual([]);
  });

  it('returns nothing for a term that matches no product', async () => {
    expect(await catalogue.searchProducts('bicicleta')).toEqual([]);
  });

  it('sorts a collection by price', async () => {
    const result = await catalogue.getCollectionProducts('mercearia', { sortKey: 'PRICE' });
    const prices = (result?.products ?? []).map((p) => Number(p.priceRange.minVariantPrice.amount));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

/** The cart rules the handoff specifies verbatim. */
describe('local cart', () => {
  async function seed() {
    const variant = (await catalogue.getProduct('ophelia-cookies'))!.variants[0]!;
    const created = await cart.create([{ merchandiseId: variant.id, quantity: 1 }]);
    return { variantId: variant.id, cart: created };
  }

  it('starts empty and totals zero', async () => {
    const empty = await cart.create([]);
    expect(empty.lines).toEqual([]);
    expect(empty.totalQuantity).toBe(0);
    expect(empty.cost.subtotalAmount.amount).toBe('0.00');
  });

  it('renders Total equal to Subtotal until real shipping rates exist', async () => {
    const { cart: c } = await seed();
    expect(c.cost.totalAmount).toEqual(c.cost.subtotalAmount);
  });

  it('merges an identical line instead of appending a row (cart rule 1)', async () => {
    const { variantId, cart: c } = await seed();
    const again = await cart.addLines(c.id, [{ merchandiseId: variantId, quantity: 2 }]);
    expect(again.lines).toHaveLength(1);
    expect(again.lines[0]?.quantity).toBe(3);
    expect(again.totalQuantity).toBe(3);
  });

  it('keeps a different gift message as its own line (line identity)', async () => {
    const { variantId, cart: c } = await seed();
    const withNote = await cart.addLines(c.id, [
      {
        merchandiseId: variantId,
        quantity: 1,
        attributes: [{ key: 'Mensagem do cartão', value: 'Parabéns!' }],
      },
    ]);
    expect(withNote.lines).toHaveLength(2);
  });

  it('removes a line when quantity steps below 1 (cart rule 2)', async () => {
    const { cart: c } = await seed();
    const lineId = c.lines[0]!.id;
    const updated = await cart.updateLines(c.id, [{ id: lineId, quantity: 0 }]);
    expect(updated.lines).toHaveLength(0);
  });

  it('caps a line at 99 (cart rule 2)', async () => {
    const { variantId, cart: c } = await seed();
    const many = await cart.addLines(c.id, [{ merchandiseId: variantId, quantity: 500 }]);
    expect(many.lines[0]?.quantity).toBe(99);

    const capped = await cart.updateLines(many.id, [{ id: many.lines[0]!.id, quantity: 1000 }]);
    expect(capped.lines[0]?.quantity).toBe(99);
  });

  it('multiplies the line total by quantity', async () => {
    const { variantId, cart: c } = await seed();
    const three = await cart.addLines(c.id, [{ merchandiseId: variantId, quantity: 2 }]);
    // 3 x €17
    expect(three.lines[0]?.cost.totalAmount.amount).toBe('51.00');
    expect(three.cost.subtotalAmount.amount).toBe('51.00');
  });

  it('removes a line by id', async () => {
    const { cart: c } = await seed();
    const removed = await cart.removeLines(c.id, [c.lines[0]!.id]);
    expect(removed.lines).toHaveLength(0);
  });

  it('offers no checkout URL, so the UI cannot pretend to take an order', async () => {
    const { cart: c } = await seed();
    expect(c.checkoutUrl).toBeNull();
  });

  it('treats a corrupt cart id as no cart rather than throwing', async () => {
    expect(await cart.get('not-a-cart')).toBeNull();
    expect(await cart.get('localcart:@@@invalid@@@')).toBeNull();
  });

  it('drops a line whose product no longer exists', async () => {
    const orphan = await cart.create([{ merchandiseId: 'local:variant:removed-product:0', quantity: 1 }]);
    expect(orphan.lines).toEqual([]);
  });

  it('ignores a zero or negative quantity', async () => {
    const variant = (await catalogue.getProduct('vela-aromatica'))!.variants[0]!;
    const none = await cart.create([{ merchandiseId: variant.id, quantity: 0 }]);
    expect(none.lines).toEqual([]);
  });
});
