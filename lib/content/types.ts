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
    tagline: string;
    description: string;
    since: string;
  };
  /**
   * The "em breve" page that stands in front of the whole site until launch.
   * Only active when COMING_SOON_PASSWORD is also set on the server.
   */
  comingSoon: {
    enabled: boolean;
    kicker: string;
    title: string;
    text: string;
    passwordLabel: string;
    cta: string;
    error: string;
  };
  announcement: { enabled: boolean; messages: string[] };
  /** The header's booking button. Hidden when `url` is empty. */
  reservations: { label: string; url: string };
  /** The blue band above the footer, pointing at the cake catalogue. */
  orderBand: { kicker: string; headingLines: string[]; cta: string; href: string };
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

export type HomeContent = {
  /** `video`, when set, plays muted in place of the photograph. */
  hero: { image: string; video: string; alt: string; title: string };
  story: { kicker: string; headingLines: string[]; body: string; cta: string };
  /** Shopify product handles, in display order. */
  favourites: { heading: string; cta: string; handles: string[] };
  events: {
    kicker: string;
    heading: string;
    body: string;
    cta: string;
    image: string;
    alt: string;
  };
  reviews: { heading: string };
  diary: { heading: string; cta: string };
};

export type Review = { stars: string; text: string; who: string };

export type AboutChapter = {
  kicker: string;
  title: string;
  paragraphs: string[];
  /** Two photographs, shown overlapping beside the text. */
  images: ImageRef[];
};

export type AboutContent = {
  intro: { kicker: string; title: string; lines: string[] };
  chapters: AboutChapter[];
  closing: { kicker: string; body: string; signature: string };
};

export type ContactRow = { label: string; value: string };

/** A heading with one word set in the script face. */
export type SplitHeading = { lead: string; emphasis: string };

export type ContactoContent = {
  kicker: string;
  title: string;
  lede: string;
  infoHeading: SplitHeading;
  formHeading: SplitHeading;
  info: ContactRow[];
  subjects: string[];
  success: { title: string; body: string; reset: string };
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

export type MenuItem = {
  name: string;
  /** As printed, without the currency: "7,00". */
  price: string;
  description: string;
  /** Printed in pink on the paper menu: the house specialities. */
  highlight: boolean;
  nuts: boolean;
  glutenFree: boolean;
  sesame: boolean;
};

export type MenuSection = {
  kicker: string;
  title: string;
  /** A line under the section, e.g. the gluten-free bread option. */
  note: string;
  items: MenuItem[];
};

export type MenuGroup = { title: string; sections: MenuSection[] };

export type MenuContent = {
  kicker: string;
  title: string;
  intro: string;
  comer: MenuGroup;
  sobremesas: MenuGroup;
  beber: MenuGroup;
  legend: { highlight: string; nuts: string; glutenFree: string; sesame: string };
  notes: string[];
};

export type BolosContent = {
  kicker: string;
  title: string;
  lede: string;
  /** Shown while the full catalogue is being prepared; hidden when empty. */
  notice: string;
  steps: { title: string; body: string }[];
  cta: string;
  gallery: ImageRef[];
};

export type EventosContent = {
  kicker: string;
  title: string;
  lede: string;
  paragraphs: string[];
  cta: string;
  images: ImageRef[];
};
