import type { JsonLd as JsonLdValue } from '@/lib/seo/structured-data';

/**
 * Renders JSON-LD. The payload is built server-side from our own data, so
 * there is no untrusted input here; `JSON.stringify` output still has its
 * `<` escaped to keep it from closing the script tag.
 */
export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
