import type { Product, ProductOption, ProductVariant } from '@/lib/commerce/types';

/**
 * Product helpers shared by the cards, the product page and the cart.
 *
 * Nothing here hard-codes an option name. The handoff labels the picker
 * differently per product ("escolhe as cookies", "tamanho", "serve") and the
 * shop's real option names are the merchant's ("Quantidade", "Cookie variety"),
 * so the UI renders whatever Shopify defines rather than looking for a name it
 * expects to find.
 */

/** Shopify emits these for a product with no real options. */
export function isDefaultOption(value: string): boolean {
  return value === 'Default Title' || value === 'Título predefinido' || value === 'Único';
}

/**
 * The options worth rendering: Shopify always returns at least one, and gives
 * an unoptioned product a synthetic "Title" with the single value
 * "Default Title". Showing that as a picker would be nonsense.
 */
export function realOptions(product: Product): ProductOption[] {
  return product.options.filter(
    (option) => option.values.length > 0 && !option.values.every(isDefaultOption),
  );
}

export function hasChoices(product: Product): boolean {
  return realOptions(product).some((option) => option.values.length > 1);
}

/**
 * The human label for a variant — "12 unidades · Red velvet".
 *
 * Empty for a product with no real options, so Shopify's synthetic
 * "Default Title" never reaches the cart or the drawer.
 */
export function variantLabel(variant: ProductVariant): string {
  return variant.selectedOptions
    .map((option) => option.value)
    .filter((value) => value && !isDefaultOption(value))
    .join(' · ');
}

/**
 * The default variant: the first purchasable one in catalogue order. Shopify
 * treats variant order as the merchant's intent, and the design relies on it.
 */
export function defaultVariant(product: Product): ProductVariant | null {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;
}

/**
 * The cheapest purchasable variant — what a card's "juntar ao cesto" adds.
 * The handoff specifies size #1 × 1; in Shopify terms that is the first
 * sellable variant, and where prices differ the smallest box is the cheapest.
 */
export function cheapestVariant(product: Product): ProductVariant | null {
  const sellable = product.variants.filter((variant) => variant.availableForSale);
  const pool = sellable.length > 0 ? sellable : product.variants;
  const first = pool[0];
  if (!first) return null;
  return pool.reduce(
    (cheapest, variant) =>
      Number(variant.price.amount) < Number(cheapest.price.amount) ? variant : cheapest,
    first,
  );
}

/**
 * Finds the variant matching a full set of selected options. Returns null when
 * the combination does not exist, so the UI can disable it rather than guess.
 */
export function matchVariant(
  product: Product,
  selection: Record<string, string>,
): ProductVariant | null {
  return (
    product.variants.find((variant) =>
      variant.selectedOptions.every((option) => selection[option.name] === option.value),
    ) ?? null
  );
}

/** True when at least one purchasable variant exists for this option value. */
export function isOptionValueAvailable(
  product: Product,
  optionName: string,
  value: string,
  selection: Record<string, string>,
): boolean {
  return product.variants.some((variant) => {
    if (!variant.availableForSale) return false;
    return variant.selectedOptions.every((option) => {
      if (option.name === optionName) return option.value === value;
      // Only constrain by options the visitor has already chosen.
      const chosen = selection[option.name];
      return chosen === undefined || chosen === option.value;
    });
  });
}

/** The default selection: the options of the first purchasable variant. */
export function defaultSelection(product: Product): Record<string, string> {
  const first = defaultVariant(product);
  if (!first) return {};
  return Object.fromEntries(first.selectedOptions.map((option) => [option.name, option.value]));
}

/**
 * The price shown beside an option value, when every variant carrying that
 * value costs the same. The handoff prints a price under each size tile; where
 * a second option makes that ambiguous, it is omitted rather than guessed.
 */
export function optionValuePrice(
  product: Product,
  optionName: string,
  value: string,
): ProductVariant['price'] | null {
  const candidates = product.variants.filter((variant) =>
    variant.selectedOptions.some((option) => option.name === optionName && option.value === value),
  );
  const first = candidates[0];
  if (!first) return null;
  return candidates.every((variant) => variant.price.amount === first.price.amount)
    ? first.price
    : null;
}
