import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { TapedPhoto } from '@/components/ui/TapedPhoto';
import { Display, Kicker } from '@/components/ui/Type';
import { contacto } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './contacto.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'Contacto',
  description: contacto.lede,
  path: '/contacto',
});

/**
 * Contacto.
 *
 * `?assunto=` pre-selects a subject, which is what the footer's
 * "eventos & catering" and "presentes corporativos" links use instead of
 * pointing at pages that do not exist.
 */
export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string }>;
}) {
  const { assunto } = await searchParams;
  const preselected = assunto && contacto.subjects.includes(assunto) ? assunto : undefined;

  return (
    <div className={`${sections.mid} ${styles.page}`} data-editor-section="contacto">
      <div className={styles.intro}>
        <Kicker>{contacto.kicker}</Kicker>
        <Display as="h1" size="page" className={styles.title}>
          {contacto.title}
        </Display>
        <p className={styles.lede}>{contacto.lede}</p>
      </div>

      <div className={styles.layout}>
        <EnquiryForm
          subjects={contacto.subjects}
          success={contacto.success}
          {...(preselected ? { defaultSubject: preselected } : {})}
        />

        <div>
          <TapedPhoto
            src={contacto.image}
            alt={contacto.alt}
            ratio="4 / 3"
            pad={14}
            mountPad={8}
            mountShadow="lg"
            deckle={1}
            sizes="(max-width: 900px) 100vw, 560px"
            tapes={[{ type: 'torn', top: '0', left: '30%', width: 104, height: 28, rotate: -4 }]}
          />

          <dl className={styles.info}>
            {contacto.info.map((row) => (
              <div key={row.label} className={styles.row}>
                <dt className={styles.rowLabel}>{row.label}</dt>
                <dd className={styles.rowValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
