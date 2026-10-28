import type { Metadata } from 'next';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Display, Kicker } from '@/components/ui/Type';
import { PRIVACY } from '@/lib/legal';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';
import { SITE } from '@/lib/site';

import styles from '../legal.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Política de privacidade',
  description: 'Política de privacidade e política de cookies da loja online da Ophelia (Receita Consistente, Lda.).',
  path: '/politica-de-privacidade',
});

const crumbs = [
  { name: 'Ophelia', path: '/' },
  { name: 'Política de privacidade', path: '/politica-de-privacidade' },
];

/** The client's own legal text, from lib/legal.ts. */
export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <article className={styles.page}>
        <Breadcrumbs crumbs={crumbs} />
        <Kicker>Informação legal</Kicker>
        <Display as="h1" size="product" className={styles.title}>
          Política de privacidade
        </Display>
        <p className={styles.updated}>
          {SITE.legalName}, {SITE.taxId}, com sede na {SITE.address.street}, {SITE.address.locality}
          .
        </p>
        <LegalDocument blocks={PRIVACY} />
      </article>
    </>
  );
}
