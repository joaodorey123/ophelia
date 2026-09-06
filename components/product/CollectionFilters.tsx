import Link from 'next/link';

import type { Collection } from '@/lib/commerce/types';
import { SHOP_INDEX, collectionPath } from '@/lib/navigation';

import styles from '@/app/comprar/collection.module.css';

/**
 * The category pills.
 *
 * The prototype filtered a local array in place; here each pill is a real
 * Shopify collection with its own URL, which keeps the interaction identical
 * while making every category shareable, indexable and server-rendered.
 */
export function CollectionFilters({
  collections,
  active,
}: {
  collections: Collection[];
  active: string | null;
}) {
  if (collections.length === 0) return null;

  return (
    <nav className={styles.filters} aria-label="Categorias">
      <Link
        href={SHOP_INDEX}
        className={`${styles.pill} ${active === null ? styles.pillActive : ''}`}
        aria-current={active === null ? 'page' : undefined}
      >
        tudo
      </Link>
      {collections.map((collection) => (
        <Link
          key={collection.handle}
          href={collectionPath(collection.handle)}
          className={`${styles.pill} ${active === collection.handle ? styles.pillActive : ''}`}
          aria-current={active === collection.handle ? 'page' : undefined}
        >
          {collection.title.toLowerCase()}
        </Link>
      ))}
    </nav>
  );
}
