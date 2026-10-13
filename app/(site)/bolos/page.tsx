import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/Button';
import { Flower } from '@/components/ui/Flower';
import { Display, Kicker } from '@/components/ui/Type';
import { WornPhoto } from '@/components/ui/WornPhoto';
import { bolos } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from '../editorial.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Bolos por encomenda',
  description: bolos.lede,
  path: '/bolos',
});

/**
 * Bolos.
 *
 * The full cake catalogue is still being written, so this page says so
 * honestly and sends people to the order form rather than listing cakes and
 * prices that are not real yet. When the catalogue arrives it slots in
 * between the steps and the gallery.
 */
export default function BolosPage() {
  return (
    <div className={styles.page} data-editor-section="bolos">
      <header className={styles.intro}>
        <Flower name="campainha" width={96} className={styles.introFlowerLeft} />
        <Flower name="gipsofila" width={150} className={styles.introFlowerRight} />
        <Kicker>{bolos.kicker}</Kicker>
        <Display as="h1" size="pageXl" className={styles.title}>
          {bolos.title}
        </Display>
        <p className={styles.lede}>{bolos.lede}</p>
      </header>

      <div className={styles.gallery}>
        {bolos.gallery.map((photo, index) => (
          <WornPhoto
            key={photo.image}
            src={photo.image}
            alt={photo.alt}
            ratio="4 / 5"
            variant={index}
            className={index === 1 ? styles.galleryRaised : undefined}
            sizes="(max-width: 700px) 100vw, 380px"
            priority={index === 0}
          />
        ))}
      </div>

      {bolos.notice ? <p className={styles.notice}>{bolos.notice}</p> : null}

      <ol className={styles.steps}>
        {bolos.steps.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden>
              {index + 1}
            </span>
            <h2 className={styles.stepTitle}>{step.title}</h2>
            <p className={styles.stepBody}>{step.body}</p>
          </li>
        ))}
      </ol>

      <div className={styles.cta}>
        <ButtonLink href="/contacto?assunto=Encomenda de bolos" variant="primary">
          {bolos.cta}
        </ButtonLink>
      </div>
    </div>
  );
}
