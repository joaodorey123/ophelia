/**
 * Editorial content shapes.
 *
 * Everything the client can change without a developer — copy, editorial
 * photography, the diary, theme-level numbers — lives in `content/*.json` and
 * is described here. Commerce data (products, prices, variants, stock, cart)
 * is never in this layer: that is Shopify's, and only Shopify's.
 *
 * The forthcoming editor writes these files; the storefront only reads them,
 * so the contract between the two is exactly this module.
 */

export type ImageRef = {
  /** Root-relative path under /public, or an absolute https URL. */
  image: string;
  alt: string;
};

export type SiteContent = {
  brand: {
    name: string;
    wordmark: string;
    tagline: string;
    description: string;
    since: string;
  };
  announcement: { enabled: boolean; messages: string[] };
  newsletter: {
    kicker: string;
    headingLines: string[];
    placeholder: string;
    cta: string;
  };
  shipping: { freeShippingFrom: number; shippingRate: number; note: string };
  footer: {
    helpHeading: string;
    help: string[];
    legalLeft: string;
    legalRight: string;
  };
  product: {
    /** Label above the option grid when Shopify's option name is unhelpful. */
    sizeLabelFallback: string;
    /**
     * The Shopify handle of the handwritten-card add-on. When no product with
     * this handle is published, the add-on block is hidden rather than faked —
     * there would be nothing real to put in the cart.
     */
    giftCardHandle: string;
    giftCardTitle: string;
    giftCardNote: string;
    /** Constant accordions shown under the product's own ingredients. */
    panels: { id: string; title: string; body: string }[];
    suggestHeading: string;
  };
};

export type CollectionCard = {
  /** Shopify collection handle, or null for the "everything" card. */
  handle: string | null;
  name: string;
  note: string;
  image: string;
};

export type HomeContent = {
  hero: { image: string; alt: string; kicker: string; title: string; cta: string };
  collections: { heading: string; note: string; cards: CollectionCard[] };
  /** Shopify product handles, in display order. */
  favourites: { heading: string; cta: string; handles: string[] };
  story: {
    kicker: string;
    headingLines: string[];
    body: string;
    cta: string;
    image: string;
    alt: string;
  };
  reviews: { heading: string };
  diary: { heading: string; cta: string };
};

export type Review = { stars: string; text: string; who: string };

export type TimelineEntry = { year: string; title: string; body: string };

export type AboutContent = {
  hero: { image: string; alt: string; kicker: string; title: string };
  lede: { lines: string[] };
  story: { paragraphs: string[]; image: string; alt: string };
  timeline: TimelineEntry[];
  gallery: ImageRef[];
  closing: { headingLead: string; headingEmphasis: string; note: string };
};

export type ContactRow = { label: string; value: string };

export type ContactoContent = {
  kicker: string;
  title: string;
  lede: string;
  subjects: string[];
  success: { title: string; body: string; reset: string };
  image: string;
  alt: string;
  info: ContactRow[];
};

export type Post = {
  slug: string;
  kicker: string;
  /** Human date exactly as written, e.g. "28 agosto". */
  date: string;
  image: string;
  title: string;
  excerpt: string;
  body: string[];
};

export type DiarioContent = {
  kicker: string;
  titleLead: string;
  titleEmphasis: string;
  lede: string;
};

export type ShopContent = { kicker: string; title: string; lede: string };
