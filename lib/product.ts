import type { Product, ProductOption, ProductVariant } from '@/lib/commerce/types';

/**
 * Product helpers shared by the cards, the product page and the cart.
 * Kept out of components so the same rules apply everywhere.
 */

/** The option that carries box size / weight. */
export const SIZE_OPTION = 'Tamanho';
/** The option that carries cookie flavour. Present on Ophelia Cookies only. */
export const FLAVOUR_OPTION = 'Sabor';

/** Case-insensitive option lookup, so a shop that types "tamanho" still works. */
export function findOption(product: Product, name: string): ProductOption | null {
  return product.options.find((option) => option.name.toLowerCase() === name.toLowerCase()) ?? null;
}

/**
 * The two options the product page renders, resolved once.
 *
 * `Sabor` only counts when it offers a real choice — Ophelia Cookies is the
 * only SKU with flavours. `Tamanho` falls back to whatever other option the
 * shop defined, so an unexpected option name still renders as the size grid
 * rather than disappearing.
 */
export function resolveOptions(product: Product): {
  flavour: ProductOption | null;
  size: ProductOption | null;
} {
  const named = findOption(product, FLAVOUR_OPTION);
  const flavour = named && named.values.length > 1 ? named : null;
  const size =
    findOption(product, SIZE_OPTION) ??
    product.options.find((option) => option !== flavour) ??
    null;
  return { flavour, size };
}

/** Shopify emits this title for products with no real options. */
export function isDefaultOption(value: string): boolean {
  return value === 'Default Title' || value === 'Único';
}

/**
 * The human label for a variant — "Tradicional · 12 unidades".
 *
 * Returns an empty string for a product with no real options, so Shopify's
 * synthetic "Default Title" never reaches the cart.
 */
export function variantLabel(variant: ProductVariant): string {
  return variant.selectedOptions
    .map((option) => option.value)
    .filter((value) => value && !isDefaultOption(value))
    .join(' · ');
}

/** The size label alone — "4 unidades", "300 g". */
export function sizeLabel(variant: ProductVariant): string {
  const size = variant.selectedOptions.find(
    (option) => option.name.toLowerCase() === SIZE_OPTION.toLowerCase(),
  );
  if (size && !isDefaultOption(size.value)) return size.value;
  const fallback = variant.selectedOptions.find((option) => !isDefaultOption(option.value));
  return fallback?.value ?? '';
}

/**
 * The default variant: the first purchasable one in catalogue order. Shopify
 * treats variant order as the merchant's intent, and the design relies on it —
 * the cross-sell shows "Café da Ophelia · 250 g em grão · €18", the first
 * variant, not the cheaper ground option.
 */
export function defaultVariant(product: Product): ProductVariant | null {
  return (
    product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null
  );
}

/** The cheapest purchasable variant — what a favourite card's "Adicionar" adds
 *  ("adds the smallest size directly", per the handoff). */
export function cheapestVariant(product: Product): ProductVariant | null {
  const sellable = product.variants.filter((variant) => variant.availableForSale);
  const pool = sellable.length > 0 ? sellable : product.variants;
  if (pool.length === 0) return null;
  return pool.reduce((cheapest, variant) =>
    Number(variant.price.amount) < Number(cheapest.price.amount) ? variant : cheapest,
  );
}

/** Distinct size steps, in catalogue order — used for the category chips. */
export function sizeSteps(product: Product): { label: string; variant: ProductVariant }[] {
  const seen = new Set<string>();
  const steps: { label: string; variant: ProductVariant }[] = [];
  for (const variant of product.variants) {
    const label = sizeLabel(variant);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    steps.push({ label, variant });
  }
  return steps;
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

/** The default selection: the first value of every option. */
export function defaultSelection(product: Product): Record<string, string> {
  const first = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
  if (!first) return {};
  return Object.fromEntries(first.selectedOptions.map((option) => [option.name, option.value]));
}
