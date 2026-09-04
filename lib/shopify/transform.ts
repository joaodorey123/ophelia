import type {
  Cart,
  CartLine,
  Collection,
  Money,
  Product,
  ProductImage,
  ProductVariant,
} from '@/lib/commerce/types';

/**
 * Shopify GraphQL → domain types.
 *
 * These functions are the boundary: nothing above them may reference a Shopify
 * field name. They are deliberately defensive — a shop with an unset metafield,
 * a product with no images, or a variant with no compare-at price is normal.
 */

type Nullable<T> = T | null | undefined;

type RawImage = { url: string; altText: Nullable<string>; width: Nullable<number>; height: Nullable<number> };
type RawMoney = { amount: string; currencyCode: string };
type RawMetafield = Nullable<{ value: Nullable<string> }>;

type RawVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: Nullable<number>;
  sku: Nullable<string>;
  selectedOptions: { name: string; value: string }[];
  price: RawMoney;
  compareAtPrice: Nullable<RawMoney>;
  image: Nullable<RawImage>;
};

export type RawProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  updatedAt: string;
  seo: { title: Nullable<string>; description: Nullable<string> };
  featuredImage: Nullable<RawImage>;
  images: { nodes: RawImage[] };
  options: { id: string; name: string; optionValues: { name: string }[] }[];
  priceRange: { minVariantPrice: RawMoney; maxVariantPrice: RawMoney };
  variants: { nodes: RawVariant[] };
  kicker: RawMetafield;
  badge: RawMetafield;
  shortDescription: RawMetafield;
  ingredients: RawMetafield;
};

export type RawCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  updatedAt: string;
  seo: { title: Nullable<string>; description: Nullable<string> };
  image: Nullable<RawImage>;
};

export type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney; totalAmount: RawMoney };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      attributes: { key: string; value: Nullable<string> }[];
      cost: { totalAmount: RawMoney };
      merchandise: {
        id: string;
        title: string;
        selectedOptions: { name: string; value: string }[];
        image: Nullable<RawImage>;
        product: { id: string; handle: string; title: string };
      };
    }[];
  };
};

function toMoney(raw: RawMoney): Money {
  return { amount: raw.amount, currencyCode: raw.currencyCode };
}

function toImage(raw: Nullable<RawImage>): ProductImage | null {
  if (!raw?.url) return null;
  return {
    url: raw.url,
    altText: raw.altText ?? null,
    width: raw.width ?? null,
    height: raw.height ?? null,
  };
}

function metafield(raw: RawMetafield): string | null {
  const value = raw?.value;
  return value && value.trim().length > 0 ? value.trim() : null;
}

function toVariant(raw: RawVariant): ProductVariant {
  return {
    id: raw.id,
    title: raw.title,
    availableForSale: raw.availableForSale,
    quantityAvailable: raw.quantityAvailable ?? null,
    sku: raw.sku ?? null,
    selectedOptions: raw.selectedOptions,
    price: toMoney(raw.price),
    compareAtPrice: raw.compareAtPrice ? toMoney(raw.compareAtPrice) : null,
    image: toImage(raw.image),
  };
}

export function toProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    productType: raw.productType,
    vendor: raw.vendor,
    tags: raw.tags,
    availableForSale: raw.availableForSale,
    updatedAt: raw.updatedAt,
    seo: { title: raw.seo?.title ?? null, description: raw.seo?.description ?? null },
    featuredImage: toImage(raw.featuredImage),
    images: (raw.images?.nodes ?? []).map(toImage).filter((image): image is ProductImage => image !== null),
    options: (raw.options ?? []).map((option) => ({
      id: option.id,
      name: option.name,
      values: option.optionValues.map((value) => value.name),
    })),
    priceRange: {
      minVariantPrice: toMoney(raw.priceRange.minVariantPrice),
      maxVariantPrice: toMoney(raw.priceRange.maxVariantPrice),
    },
    variants: (raw.variants?.nodes ?? []).map(toVariant),
    editorial: {
      kicker: metafield(raw.kicker),
      badge: metafield(raw.badge),
      shortDescription: metafield(raw.shortDescription),
      ingredients: metafield(raw.ingredients),
    },
  };
}

export function toCollection(raw: RawCollection): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    updatedAt: raw.updatedAt,
    seo: { title: raw.seo?.title ?? null, description: raw.seo?.description ?? null },
    image: toImage(raw.image),
  };
}

export function toCart(raw: RawCart): Cart {
  const lines: CartLine[] = (raw.lines?.nodes ?? []).map((line) => ({
    id: line.id,
    quantity: line.quantity,
    cost: { totalAmount: toMoney(line.cost.totalAmount) },
    attributes: (line.attributes ?? [])
      .filter((attribute) => attribute.value != null && attribute.value.length > 0)
      .map((attribute) => ({ key: attribute.key, value: attribute.value as string })),
    merchandise: {
      id: line.merchandise.id,
      title: line.merchandise.title,
      selectedOptions: line.merchandise.selectedOptions,
      image: toImage(line.merchandise.image),
      product: line.merchandise.product,
    },
  }));

  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: {
      subtotalAmount: toMoney(raw.cost.subtotalAmount),
      totalAmount: toMoney(raw.cost.totalAmount),
    },
    lines,
  };
}
