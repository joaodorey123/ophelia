import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/Button';
import { Flower } from '@/components/ui/Flower';
import { Display, Kicker } from '@/components/ui/Type';
import { WornPhoto } from '@/components/ui/WornPhoto';
import { eventos } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from '../editorial.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Eventos',
  description: eventos.lede,
  path: '/eventos',
});

/**
 * Eventos: a torn print on one side and the words on the other, the same
 * composition as the home page's events band, then a small gallery and the
 * way to ask for a proposal.
 */
export default function EventosPage() {
  const [lead, ...rest] = eventos.images;

  return (
    <div className={styles.page} data-editor-section="eventos">
      <section className={styles.split} aria-labelledby="oph-eventos">
        {lead ? (
          <div className={styles.splitPhoto}>
            <WornPhoto
              src={lead.image}
              alt={lead.alt}
              ratio="4 / 5"
              variant={1}
              sizes="(max-width: 900px) 100vw, 620px"
              priority
            />
            <Flower name="esporas" width={92} className={styles.splitFlower} />
          </div>
        ) : null}

        <div className={styles.splitText}>
          <Kicker>{eventos.kicker}</Kicker>
          <Display as="h1" size="pageXl" id="oph-eventos" className={styles.title}>
            {eventos.title}
          </Display>
          <p className={styles.splitLede}>{eventos.lede}</p>
          {eventos.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={styles.splitBody}>
              {paragraph}
            </p>
          ))}
          <div className={styles.splitCta}>
            <ButtonLink href="/contacto?assunto=Eventos e catering" variant="primary">
              {eventos.cta}
            </ButtonLink>
          </div>
        </div>
      </section>

      {rest.length > 0 ? (
        <div className={`${styles.gallery} ${styles.galleryTwo}`}>
          {rest.map((photo, index) => (
            <WornPhoto
              key={photo.image}
              src={photo.image}
              alt={photo.alt}
              ratio="4 / 5"
              variant={index + 2}
              className={index === 1 ? styles.galleryRaised : undefined}
              sizes="(max-width: 700px) 100vw, 420px"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
