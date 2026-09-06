/**
 * Domain types for the Ophelia storefront.
 *
 * These are the *only* product/cart shapes the UI knows about. Both commerce
 * adapters (Shopify Storefront API, and the local development catalogue)
 * produce exactly these, so no component ever sees a GraphQL response.
 *
 * The shapes deliberately mirror Shopify's so the transform stays thin.
 */

export type Money = {
  /** Decimal string, e.g. "17.00". Never a float — money is not a Number. */
  amount: string;
  /** ISO 4217, e.g. "EUR". */
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  /** Null when the shop does not track inventory for this variant. */
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  sku: string | null;
  image: ProductImage | null;
};

/**
 * Editorial fields the Claude Design needs that are not core Shopify fields.
 * In Shopify these live as metafields in the `ophelia` namespace — see
 * docs/SHOPIFY.md. All are optional: the UI omits the block when absent.
 */
export type ProductEditorial = {
  /** Small uppercase eyebrow above the title, e.g. "Cookies · o clássico". */
  kicker: string | null;
  /** Pill over the card image, e.g. "Novo" / "Personalizável". */
  badge: string | null;
  /** One-line card description used on category cards. */
  shortDescription: string | null;
  /** Client-supplied ingredient list. Never inferred. */
  ingredients: string | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  /** Plain text, used for meta descriptions and structured data. */
  description: string;
  /** Sanitised HTML from Shopify, rendered on the product page. */
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  seo: { title: string | null; description: string | null };
  editorial: ProductEditorial;
  /** ISO timestamp — drives sitemap lastModified. */
  updatedAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: ProductImage | null;
  seo: { title: string | null; description: string | null };
  updatedAt: string;
};

export type CollectionWithProducts = {
  collection: Collection;
  products: Product[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

/** Attribute keys we attach to cart lines. Kept in one place so the cart
 *  drawer, the cart page and the kitchen all read the same names. */
export const CART_ATTRIBUTE = {
  /** The handwritten-card message, stored on the cookie line for context. */
  giftMessage: 'Mensagem do cartão',
} as const;

export type CartLineAttribute = {
  key: string;
  value: string;
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  attributes: CartLineAttribute[];
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: ProductImage | null;
    product: {
      id: string;
      handle: string;
      title: string;
    };
  };
};

export type Cart = {
  id: string;
  /** Shopify-hosted checkout. Null only for the local catalogue, where
   *  checkout is unavailable and the UI says so rather than faking it. */
  checkoutUrl: string | null;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
};

/** A page of products plus Shopify's cursor for the next one. */
export type ProductPage = {
  products: Product[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

export type ProductSortKey = 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE' | 'TITLE';

export type ProductQueryOptions = {
  first?: number;
  sortKey?: ProductSortKey;
  reverse?: boolean;
  /** Shopify search syntax; the local adapter does a case-insensitive match. */
  query?: string;
  cursor?: string;
};

/** A line the caller wants in the cart. */
export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  attributes?: CartLineAttribute[];
};

/**
 * Every commerce read the storefront performs. Implemented twice: once against
 * the Shopify Storefront API, once against the local development catalogue.
 */
export interface CatalogueSource {
  readonly kind: 'shopify' | 'local';
  getProduct(handle: string): Promise<Product | null>;
  getProducts(options?: ProductQueryOptions): Promise<Product[]>;
  /** Like getProducts, but carries the cursor needed to page through a shop
   *  larger than one request. */
  getProductPage(options?: ProductQueryOptions): Promise<ProductPage>;
  getCollection(handle: string): Promise<Collection | null>;
  getCollectionProducts(
    handle: string,
    options?: ProductQueryOptions,
  ): Promise<CollectionWithProducts | null>;
  getCollections(): Promise<Collection[]>;
  searchProducts(term: string, options?: ProductQueryOptions): Promise<Product[]>;
  /** Related products for a product page. May legitimately be empty. */
  getProductRecommendations(product: Product, limit?: number): Promise<Product[]>;
}

/** Every cart mutation the storefront performs. */
export interface CartSource {
  readonly kind: 'shopify' | 'local';
  get(cartId: string): Promise<Cart | null>;
  create(lines: CartLineInput[]): Promise<Cart>;
  addLines(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart>;
  removeLines(cartId: string, lineIds: string[]): Promise<Cart>;
}

/** Raised by adapters for failures the UI is expected to surface. */
export class CommerceError extends Error {
  readonly code: 'not_found' | 'unavailable' | 'network' | 'invalid' | 'not_configured';

  constructor(code: CommerceError['code'], message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CommerceError';
    this.code = code;
  }
}
