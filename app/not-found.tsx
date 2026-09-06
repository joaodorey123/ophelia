import type { Metadata } from 'next';
import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { Display, Kicker } from '@/components/ui/Type';
import { PRIMARY_NAV } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './status.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Página não encontrada',
  description: 'Não encontrámos esta página.',
  path: '/404',
  noIndex: true,
});

export default function NotFound() {
  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <Kicker>erro 404</Kicker>
        <Display as="h1" size="product" className={styles.title}>
          não encontrámos esta página
        </Display>
        <p className={styles.copy}>
          A página pode ter mudado de sítio, ou o link pode estar errado. Voltamos a pôr-te no
          caminho.
        </p>
        <div className={styles.actions}>
          <ButtonLink href="/comprar" variant="primary">
            ver os produtos
          </ButtonLink>
          <ButtonLink href="/">voltar ao início</ButtonLink>
        </div>
        <ul className={styles.links}>
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
