import { CartPageContent } from '@/app/carrinho/CartPageContent';
import { Display } from '@/components/ui/Type';
import { site } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './cart.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'O teu cesto',
  description: 'O que já escolheste na loja da Ophelia.',
  path: '/carrinho',
  // A personal, transactional page: useful to the visitor, not to a crawler.
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className={`${sections.mid} ${styles.page}`}>
      <Display as="h1" size="product" className={styles.title}>
        o teu cesto
      </Display>
      <p className={styles.note}>{site.shipping.note}</p>

      <CartPageContent freeShippingFrom={site.shipping.freeShippingFrom} />
    </div>
  );
}
