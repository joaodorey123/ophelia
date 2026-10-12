import 'server-only';

/**
 * A read-only window onto the shop, so the editor can offer real products and
 * categories to choose from instead of asking someone to type an identifier
 * they have no way of knowing.
 *
 * Entirely optional: without credentials the pickers fall back to a plain text
 * field and say so, rather than breaking.
 */

export type ShopOption = {
  /** The identifier the storefront stores. */
  handle: string;
  /** What the person editing actually recognises. */
  title: string;
  image: string | null;
};

function config(): { domain: string; token: string; version: string } | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token =
    process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim() ||
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (!domain || !token) return null;

  return {
    domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    token,
    version: process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || '2026-07',
  };
}

export function isShopConnected(): boolean {
  return config() !== null;
}

async function query<T>(document: string): Promise<T | null> {
  const settings = config();
  if (!settings) return null;

  const isPrivate = Boolean(process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim());

  try {
    const response = await fetch(
      `https://${settings.domain}/api/${settings.version}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isPrivate
            ? { 'Shopify-Storefront-Private-Token': settings.token }
            : { 'X-Shopify-Storefront-Access-Token': settings.token }),
        },
        body: JSON.stringify({ query: document }),
        next: { revalidate: 300 },
      },
    );
    if (!response.ok) return null;

    const body = (await response.json()) as { data?: T; errors?: unknown };
    if (body.errors) {
      console.error('[shop] query returned errors:', JSON.stringify(body.errors).slice(0, 300));
      return null;
    }
    return body.data ?? null;
  } catch (error) {
    console.error('[shop] unreachable:', error);
    return null;
  }
}

type ProductsData = {
  products: { nodes: { handle: string; title: string; featuredImage: { url: string } | null }[] };
};

type CollectionsData = {
  collections: { nodes: { handle: string; title: string; image: { url: string } | null }[] };
};

export async function listProducts(): Promise<ShopOption[] | null> {
  const data = await query<ProductsData>(
    `{ products(first: 100, sortKey: TITLE) { nodes { handle title featuredImage { url } } } }`,
  );
  if (!data) return null;
  return data.products.nodes.map((node) => ({
    handle: node.handle,
    title: node.title,
    image: node.featuredImage?.url ?? null,
  }));
}

export async function listCollections(): Promise<ShopOption[] | null> {
  const data = await query<CollectionsData>(
    `{ collections(first: 100) { nodes { handle title image { url } } } }`,
  );
  if (!data) return null;
  return data.collections.nodes.map((node) => ({
    handle: node.handle,
    title: node.title,
    image: node.image?.url ?? null,
  }));
}
