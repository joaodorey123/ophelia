import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { pageMetadata } from '@/lib/seo/metadata';

import { CartPageContent } from './CartPageContent';
import styles from './cart.module.css';

/** Transactional and personal — kept out of the index. */
export const metadata: Metadata = pageMetadata({
  title: 'O teu cesto',
  description: 'Os produtos que escolheste na Ophelia.',
  path: '/carrinho',
  noIndex: true,
});

export default function CartPage() {
  return (
    <section className={styles.page} aria-labelledby="cart-title">
      <Breadcrumbs
        crumbs={[
          { name: 'Ophelia', path: '/' },
          { name: 'O teu cesto', path: '/carrinho' },
        ]}
      />
      <h1 id="cart-title" className={styles.title}>
        O teu cesto
      </h1>
      <CartPageContent />
    </section>
  );
}
