import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { Flower } from '@/components/ui/Flower';
import { Kicker } from '@/components/ui/Type';
import { contacto, type SplitHeading } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './contacto.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: contacto.title.charAt(0).toUpperCase() + contacto.title.slice(1),
  description: contacto.lede,
  path: '/contacto',
});

/**
 * Contactos: the shop's details on the left, the form on the right.
 *
 * `?assunto=` pre-selects a subject, which is what the Bolos and Eventos
 * pages use to land people on the right one.
 */
export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string }>;
}) {
  const { assunto } = await searchParams;
  const preselected = assunto && contacto.subjects.includes(assunto) ? assunto : undefined;

  return (
    <div className={`${sections.wide} ${styles.page}`} data-editor-section="contacto">
      <Flower name="gipsofila" width={130} className={styles.flower} />

      <section className={styles.info} aria-labelledby="oph-contact-info">
        <Kicker>{contacto.kicker}</Kicker>
        <h1 id="oph-contact-info" className={styles.heading}>
          <Heading value={contacto.infoHeading} />
        </h1>
        <p className={styles.lede}>{contacto.lede}</p>

        <dl className={styles.rows}>
          {contacto.info.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt className={styles.rowLabel}>{row.label}</dt>
              <dd className={styles.rowValue}>
                <RowValue label={row.label} value={row.value} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.formColumn} aria-labelledby="oph-contact-form">
        <h2 id="oph-contact-form" className={styles.heading}>
          <Heading value={contacto.formHeading} />
        </h2>
        <EnquiryForm
          subjects={contacto.subjects}
          success={contacto.success}
          {...(preselected ? { defaultSubject: preselected } : {})}
        />
      </section>
    </div>
  );
}

function Heading({ value }: { value: SplitHeading }) {
  return (
    <>
      {value.lead}
      <span className={styles.emphasis}>{value.emphasis}</span>
    </>
  );
}

/** Emails and Instagram handles become links; everything else is text. */
function RowValue({ label, value }: { label: string; value: string }) {
  const trimmed = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return <a href={`mailto:${trimmed}`}>{trimmed}</a>;
  }
  if (/^@[\w.]+$/.test(trimmed) && /insta/i.test(label)) {
    return (
      <a
        href={`https://www.instagram.com/${trimmed.slice(1)}/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {trimmed}
      </a>
    );
  }
  return <>{value}</>;
}
