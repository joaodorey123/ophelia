import type { Metadata } from 'next';
import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Type';
import { Watercolour } from '@/components/ui/Watercolour';
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
      <Watercolour placement="full" />
      <div className={styles.inner}>
        <Kicker>Erro 404</Kicker>
        <h1 className={styles.title}>Não encontrámos esta página.</h1>
        <p className={styles.copy}>
          A página pode ter mudado de sítio, ou o link pode estar errado. Voltamos a pôr-te no
          caminho — normalmente começa pelas cookies.
        </p>
        <div className={styles.actions}>
          <ButtonLink href="/comprar/cookies" variant="primary" size="lg">
            Ver as cookies
          </ButtonLink>
          <ButtonLink href="/" variant="outlineBlue" size="lg">
            Voltar ao início
          </ButtonLink>
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
