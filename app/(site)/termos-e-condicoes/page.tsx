import type { Metadata } from 'next';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Display, Kicker } from '@/components/ui/Type';
import { TERMS } from '@/lib/legal';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import styles from '../legal.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Termos e condições',
  description: 'Termos e condições de venda da loja online da Ophelia (Receita Consistente, Lda.): encomendas, preços, entregas, devoluções e pagamentos.',
  path: '/termos-e-condicoes',
});

const crumbs = [
  { name: 'Ophelia', path: '/' },
  { name: 'Termos e condições', path: '/termos-e-condicoes' },
];

/** The client's own legal text, from lib/legal.ts. */
export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <article className={styles.page}>
        <Breadcrumbs crumbs={crumbs} />
        <Kicker>Informação legal</Kicker>
        <Display as="h1" size="product" className={styles.title}>
          Termos e condições
        </Display>
        <p className={styles.updated}>
          {SITE.legalName}, {SITE.taxId}, com sede na {SITE.address.street}, {SITE.address.locality}
          .
        </p>
        <LegalDocument blocks={TERMS} />
      </article>
    </>
  );
}
