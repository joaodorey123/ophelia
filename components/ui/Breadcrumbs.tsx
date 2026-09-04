import Link from 'next/link';

import type { Crumb } from '@/lib/seo/structured-data';

import styles from './Breadcrumbs.module.css';

/**
 * Crawlable breadcrumb trail. The last entry is the current page and is not a
 * link; its BreadcrumbList counterpart is emitted alongside by the page.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Trilho de navegação">
      <ol className={styles.crumbs}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path}>
              {index > 0 ? (
                <span className={styles.separator} aria-hidden="true">
                  ·
                </span>
              ) : null}
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path}>{crumb.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
