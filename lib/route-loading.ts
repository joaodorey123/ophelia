/**
 * Which pages get a skeleton while a click waits for the server.
 *
 * Links are not prefetched (the hosting rate-limits bursts — see
 * components/ui/Link.tsx), so every navigation waits for a server render. The
 * static pages answer in a blink; these four read Shopify, and are the ones
 * worth a placeholder shaped like what is coming.
 */
export type RouteTarget =
  | { kind: 'shop' }
  | { kind: 'collection'; handle: string }
  | { kind: 'product' }
  | { kind: 'search'; q: string };

export function routeTarget(href: string): RouteTarget | null {
  if (!href.startsWith('/') || href.startsWith('//')) return null;

  let url: URL;
  try {
    url = new URL(href, 'https://ophelia.local');
  } catch {
    return null;
  }

  const parts = url.pathname.split('/').filter(Boolean);

  if (parts[0] === 'comprar') {
    if (parts.length === 1) return { kind: 'shop' };
    const handle = parts[1];
    if (handle && parts.length === 2) {
      try {
        return { kind: 'collection', handle: decodeURIComponent(handle) };
      } catch {
        return { kind: 'collection', handle };
      }
    }
    return null;
  }

  if (parts[0] === 'produto' && parts.length === 2) return { kind: 'product' };

  if (parts[0] === 'pesquisa' && parts.length === 1) {
    // Without a term the page is just the form: nothing to wait for.
    const q = (url.searchParams.get('q') ?? '').trim();
    return q ? { kind: 'search', q } : null;
  }

  return null;
}
