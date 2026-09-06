import Image from 'next/image';

import { TapedPhoto, type TapeStrip } from '@/components/ui/TapedPhoto';
import { Display, Kicker } from '@/components/ui/Type';
import { about } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './story.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'Quem somos',
  description:
    'A história da Ophelia: da Guarda ao Estoril, de uma empresa de eventos a uma pastelaria de família.',
  path: '/quem-somos',
});

/**
 * The photo grid alternates tape type and deckle filter across the four
 * prints, and offsets the even columns — the handoff is specific about each,
 * so the recipe is data rather than four near-identical blocks of markup.
 */
const GALLERY: { tape: TapeStrip; deckle: 1 | 2; offset: boolean }[] = [
  {
    tape: { type: 'torn', top: '0', left: '24px', width: 78, height: 24, rotate: -6 },
    deckle: 1,
    offset: false,
  },
  {
    tape: { type: 'striped', bottom: '2px', right: '22px', width: 76, height: 20, rotate: 5 },
    deckle: 2,
    offset: true,
  },
  {
    tape: { type: 'scotch', top: '0', left: '30px', width: 80, height: 22, rotate: -3 },
    deckle: 1,
    offset: false,
  },
  {
    tape: { type: 'kraft', bottom: '2px', right: '26px', width: 74, height: 22, rotate: 4 },
    deckle: 2,
    offset: true,
  },
];

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero}>
        <Image
          className={styles.heroImage}
          src={about.hero.image}
          alt={about.hero.alt}
          fill
          sizes="100vw"
          priority
        />
        <div className={styles.heroScrim}>
          <div>
            <Kicker tone="onScrim" className={styles.heroKicker}>{about.hero.kicker}</Kicker>
            <Display as="h1" size="pageXl" className={styles.heroTitle}>
              {about.hero.title}
            </Display>
          </div>
        </div>
      </section>

      <div className={`${sections.narrow} ${styles.lede}`}>
        <Display as="p" size="lede" className={styles.ledeText}>
          {about.lede.lines.map((line) => (
            <span key={line} className={styles.ledeLine}>
              {line}
            </span>
          ))}
        </Display>

        <div className={styles.story}>
          <div>
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={sections.prose}>
                {paragraph}
              </p>
            ))}
          </div>

          <TapedPhoto
            src={about.story.image}
            alt={about.story.alt}
            ratio="4 / 5"
            pad={16}
            mountPad={9}
            mountShadow="lg"
            deckle={2}
            sizes="(max-width: 900px) 100vw, 520px"
            tapes={[{ type: 'scotch', top: '0', left: '34%', width: 104, height: 28, rotate: -4 }]}
          />
        </div>

        <div className={styles.timeline}>
          {about.timeline.map((entry) => (
            <div key={entry.year} className={styles.entry}>
              <span className={styles.year}>{entry.year}</span>
              <h2 className={styles.entryTitle}>{entry.title}</h2>
              <p className={styles.entryBody}>{entry.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.gallery}>
          {about.gallery.map((photo, index) => {
            const recipe = GALLERY[index % GALLERY.length];
            if (!recipe) return null;
            return (
              <TapedPhoto
                key={photo.image}
                src={photo.image}
                alt={photo.alt}
                ratio="3 / 4"
                pad={12}
                deckle={recipe.deckle}
                className={recipe.offset ? styles.galleryOffset : undefined}
                sizes="(max-width: 640px) 50vw, 260px"
                tapes={[recipe.tape]}
              />
            );
          })}
        </div>
      </div>

      <section className={styles.closing}>
        <Image
          className={styles.frame}
          src="/brand/frame-flowers.png"
          alt=""
          width={1854}
          height={2400}
          aria-hidden
        />
        <div className={styles.closingInner}>
          <Display as="h2" size="quote">
            {about.closing.headingLead}
            <span>{about.closing.headingEmphasis}</span>
          </Display>
          <p className={styles.closingNote}>{about.closing.note}</p>
        </div>
      </section>
    </>
  );
}
