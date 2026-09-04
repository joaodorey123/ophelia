import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ButtonLink } from '@/components/ui/Button';
import { getCustomerAccountConfig } from '@/lib/commerce/config';
import { getOrders } from '@/lib/customer/api';
import { formatMoney } from '@/lib/format';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from '../account.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Encomendas',
  description: 'As tuas encomendas na Ophelia.',
  path: '/conta/encomendas',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

const DATE_FORMAT = new Intl.DateTimeFormat('pt-PT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default async function OrdersPage() {
  if (!getCustomerAccountConfig()) redirect('/conta');

  const orders = await getOrders();

  // No session (or an expired one): send them back to sign in.
  if (orders === null) redirect('/conta');

  return (
    <section className={styles.page} aria-labelledby="orders-title">
      <h1 id="orders-title" className={styles.title}>
        As minhas encomendas
      </h1>

      {orders.length === 0 ? (
        <>
          <p className={styles.lead}>Ainda não fizeste nenhuma encomenda.</p>
          <div className={styles.actions}>
            <ButtonLink href="/comprar/cookies" variant="primary" size="lg">
              Começar pelas cookies
            </ButtonLink>
          </div>
        </>
      ) : (
        <ul className={styles.orders}>
          {orders.map((order) => (
            <li key={order.id} className={styles.order}>
              <div className={styles.orderHead}>
                <h2 className={styles.orderName}>{order.name}</h2>
                <span className={styles.orderMeta}>
                  {DATE_FORMAT.format(new Date(order.processedAt))}
                  {order.fulfillmentStatus ? ` · ${order.fulfillmentStatus}` : ''}
                </span>
              </div>
              <ul className={styles.orderItems}>
                {order.lineItems.map((item) => (
                  <li key={`${order.id}-${item.title}`}>
                    {item.quantity} × {item.title}
                  </li>
                ))}
              </ul>
              <p className={styles.orderTotal}>Total {formatMoney(order.total)}</p>
              {order.statusPageUrl ? (
                <div className={styles.actions}>
                  <ButtonLink
                    href={order.statusPageUrl}
                    variant="outlineBlue"
                    size="sm"
                    prefetch={false}
                  >
                    Ver o estado da encomenda
                  </ButtonLink>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
