import Link from 'next/link';

/**
 * Last-resort 404, outside every route group.
 *
 * Storefront URLs never reach it — app/(site)/[...missing] sends them to the
 * styled 404 inside the shop's chrome. It stays deliberately bare: it is part
 * of every page's payload, /builder included, so it must not load the shop's
 * styles or call Shopify.
 */
export default function NotFound() {
  return (
    <main style={{ padding: '96px 24px', textAlign: 'center', fontFamily: 'var(--font-jost)' }}>
      <h1 style={{ fontWeight: 400 }}>Página não encontrada</h1>
      <p>
        <Link href="/">Voltar ao início</Link>
      </p>
    </main>
  );
}
