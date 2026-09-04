import 'server-only';

import { SITE } from '@/lib/site';
import type {
  Cart,
  CartLineInput,
  CartSource,
  CatalogueSource,
  Collection,
  Product,
  ProductQueryOptions,
  ProductVariant,
} from '@/lib/commerce/types';
import { CommerceError } from '@/lib/commerce/types';

import { SEED_COLLECTIONS, SEED_PRODUCTS } from './data';
import type { SeedProduct } from './data';

/**
 * Local development catalogue adapter.
 *
 * Produces exactly the same domain types as the Shopify adapter so the UI is
 * identical, but it is explicitly NOT Shopify: there is no checkout, and the
 * storefront says so rather than simulating one.
 */

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: SITE.currency };
}

/** Stable synthetic ids. The `local:` prefix makes their origin obvious in
 *  logs and in the cart cookie. */
function variantId(handle: string, index: number): string {
  return `local:variant:${handle}:${index}`;
}

function buildProduct(seed: SeedProduct): Product {
  const variants: ProductVariant[] = seed.variants.map((variant, index) => ({
    id: variantId(seed.handle, index),
    title: variant.options.join(' / '),
    availableForSale: true,
    quantityAvailable: null,
    sku: variant.sku,
    selectedOptions: variant.options.map((value, position) => ({
      name: seed.optionNames[position] ?? `Opção ${position + 1}`,
      value,
    })),
    price: money(variant.price),
    compareAtPrice: null,
    image: null,
  }));

  const prices = seed.variants.map((variant) => variant.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    id: `local:product:${seed.handle}`,
    handle: seed.handle,
    title: seed.title,
    description: seed.description,
    descriptionHtml: `<p>${seed.description}</p>`,
    productType: seed.productType,
    vendor: SITE.name,
    tags: seed.tags,
    availableForSale: true,
    updatedAt: seed.updatedAt,
    featuredImage: null,
    images: [],
    options: seed.optionNames.map((name, position) => ({
      id: `local:option:${seed.handle}:${position}`,
      name,
      values: [...new Set(seed.variants.map((variant) => variant.options[position] ?? ''))].filter(Boolean),
    })),
    variants,
    priceRange: { minVariantPrice: money(min), maxVariantPrice: money(max) },
    seo: { title: null, description: seed.shortDescription },
    editorial: {
      kicker: seed.kicker,
      badge: seed.badge ?? null,
      shortDescription: seed.shortDescription,
      ingredients: seed.ingredients ?? null,
    },
  };
}

const PRODUCTS: Product[] = SEED_PRODUCTS.map(buildProduct);
const PRODUCTS_BY_HANDLE = new Map(PRODUCTS.map((product) => [product.handle, product]));

const COLLECTIONS: Collection[] = SEED_COLLECTIONS.map((seed) => ({
  id: `local:collection:${seed.handle}`,
  handle: seed.handle,
  title: seed.title,
  description: seed.description,
  descriptionHtml: `<p>${seed.description}</p>`,
  image: null,
  seo: { title: null, description: seed.description },
  updatedAt: '2026-01-01T00:00:00Z',
}));

const COLLECTION_PRODUCTS = new Map(
  SEED_COLLECTIONS.map((seed) => [
    seed.handle,
    seed.productHandles
      .map((handle) => PRODUCTS_BY_HANDLE.get(handle))
      .filter((product): product is Product => product !== undefined),
  ]),
);

/** Normalises for accent-insensitive matching — "cafe" should find "Café". */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function sortProducts(products: Product[], options: ProductQueryOptions): Product[] {
  const sorted = [...products];
  switch (options.sortKey) {
    case 'PRICE':
      sorted.sort(
        (a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount),
      );
      break;
    case 'TITLE':
      sorted.sort((a, b) => a.title.localeCompare(b.title, SITE.locale));
      break;
    case 'CREATED_AT':
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
    default:
      break;
  }
  return options.reverse ? sorted.reverse() : sorted;
}

export const localCatalogue: CatalogueSource = {
  kind: 'local',

  async getProduct(handle) {
    return PRODUCTS_BY_HANDLE.get(handle) ?? null;
  },

  async getProducts(options = {}) {
    const filtered = options.query
      ? PRODUCTS.filter((product) => fold(product.title).includes(fold(options.query as string)))
      : PRODUCTS;
    return sortProducts(filtered, options).slice(0, options.first ?? filtered.length);
  },

  async getCollection(handle) {
    return COLLECTIONS.find((collection) => collection.handle === handle) ?? null;
  },

  async getCollectionProducts(handle, options = {}) {
    const collection = COLLECTIONS.find((item) => item.handle === handle);
    if (!collection) return null;
    const products = COLLECTION_PRODUCTS.get(handle) ?? [];
    return {
      collection,
      products: sortProducts(products, options).slice(0, options.first ?? products.length),
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  },

  async getCollections() {
    return COLLECTIONS;
  },

  async searchProducts(term, options = {}) {
    const needle = fold(term.trim());
    if (!needle) return [];

    const matches = PRODUCTS.filter((product) => {
      const haystack = fold(
        [product.title, product.description, product.productType, ...product.tags].join(' '),
      );
      return needle.split(/\s+/).every((word) => haystack.includes(word));
    });

    return matches.slice(0, options.first ?? 24);
  },

};

/* ── Local cart ──────────────────────────────────────────────────────────
 * Serialised into the same httpOnly cookie the Shopify cart id uses, so the
 * calling code is identical. `checkoutUrl` is null: the UI disables checkout
 * and explains that it needs Shopify, instead of pretending to take an order.
 * ──────────────────────────────────────────────────────────────────────── */

type LocalCartState = {
  id: string;
  lines: { id: string; merchandiseId: string; quantity: number; attributes: { key: string; value: string }[] }[];
};

const LOCAL_CART_PREFIX = 'localcart:';

function encode(state: LocalCartState): string {
  return LOCAL_CART_PREFIX + Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
}

function decode(cartId: string): LocalCartState | null {
  if (!cartId.startsWith(LOCAL_CART_PREFIX)) return null;
  try {
    const json = Buffer.from(cartId.slice(LOCAL_CART_PREFIX.length), 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as LocalCartState;
    return Array.isArray(parsed.lines) ? parsed : null;
  } catch {
    return null;
  }
}

function findVariant(merchandiseId: string): { product: Product; variant: ProductVariant } | null {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((candidate) => candidate.id === merchandiseId);
    if (variant) return { product, variant };
  }
  return null;
}

function render(state: LocalCartState): Cart {
  const lines = state.lines.flatMap((line) => {
    const found = findVariant(line.merchandiseId);
    if (!found) return [];
    const unit = Number(found.variant.price.amount);
    return [
      {
        id: line.id,
        quantity: line.quantity,
        cost: { totalAmount: money(unit * line.quantity) },
        attributes: line.attributes,
        merchandise: {
          id: found.variant.id,
          title: found.variant.title,
          selectedOptions: found.variant.selectedOptions,
          image: found.variant.image,
          product: {
            id: found.product.id,
            handle: found.product.handle,
            title: found.product.title,
          },
        },
      },
    ];
  });

  const subtotal = lines.reduce((total, line) => total + Number(line.cost.totalAmount.amount), 0);

  return {
    // The id *is* the state, so every mutation returns a fresh id the caller
    // writes back to the cookie.
    id: encode({ ...state, lines: state.lines.filter((line) => findVariant(line.merchandiseId)) }),
    checkoutUrl: null,
    totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
    cost: { subtotalAmount: money(subtotal), totalAmount: money(subtotal) },
    lines,
  };
}

function attributesKey(attributes: { key: string; value: string }[] = []): string {
  return [...attributes]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((attribute) => `${attribute.key}=${attribute.value}`)
    .join('|');
}

/**
 * Line identity is merchandise + attributes, exactly as the handoff specifies
 * (cart rule 1) and as Shopify itself behaves.
 */
function mergeLines(state: LocalCartState, inputs: CartLineInput[]): LocalCartState {
  const lines = [...state.lines];
  for (const input of inputs) {
    if (input.quantity <= 0) continue;
    const attributes = input.attributes ?? [];
    const key = attributesKey(attributes);
    const existing = lines.findIndex(
      (line) => line.merchandiseId === input.merchandiseId && attributesKey(line.attributes) === key,
    );
    if (existing > -1) {
      const current = lines[existing];
      if (!current) continue;
      lines[existing] = { ...current, quantity: Math.min(99, current.quantity + input.quantity) };
    } else {
      lines.push({
        id: `local:line:${lines.length}:${input.merchandiseId}:${key}`,
        merchandiseId: input.merchandiseId,
        quantity: Math.min(99, input.quantity),
        attributes,
      });
    }
  }
  return { ...state, lines };
}

export const localCart: CartSource = {
  kind: 'local',

  async get(cartId) {
    const state = decode(cartId);
    return state ? render(state) : null;
  },

  async create(lines) {
    return render(mergeLines({ id: 'local', lines: [] }, lines));
  },

  async addLines(cartId, lines) {
    const state = decode(cartId);
    if (!state) throw new CommerceError('not_found', 'O cesto já não existe.');
    return render(mergeLines(state, lines));
  },

  async updateLines(cartId, updates) {
    const state = decode(cartId);
    if (!state) throw new CommerceError('not_found', 'O cesto já não existe.');
    const lines = state.lines
      .map((line) => {
        const update = updates.find((candidate) => candidate.id === line.id);
        if (!update) return line;
        return { ...line, quantity: Math.min(99, Math.max(0, update.quantity)) };
      })
      .filter((line) => line.quantity > 0);
    return render({ ...state, lines });
  },

  async removeLines(cartId, lineIds) {
    const state = decode(cartId);
    if (!state) throw new CommerceError('not_found', 'O cesto já não existe.');
    return render({ ...state, lines: state.lines.filter((line) => !lineIds.includes(line.id)) });
  },
};
