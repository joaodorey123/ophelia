import { Flower, type FlowerName } from '@/components/ui/Flower';
import { Display, Kicker } from '@/components/ui/Type';
import { WornPhoto } from '@/components/ui/WornPhoto';
import { about } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './story.module.css';

export const metadata = pageMetadata({
  title: 'Quem somos',
  description:
    'A história da Ophelia: da Guarda ao Estoril, de uma empresa de eventos a uma pastelaria de família.',
  path: '/quem-somos',
});

/** One flower per chapter, at the edge of its photographs. */
const CHAPTER_FLOWERS: FlowerName[] = ['ramo', 'papoila', 'esporas', 'cosmos'];

/**
 * Quem somos, set the way the client asked for: airy, centred, editorial.
 *
 * The story is told in chapters. Each pairs a narrow column of text with two
 * overlapping prints, alternating sides, and a thin rule runs down the page
 * from one chapter to the next — the thread of the story.
 */
export default function AboutPage() {
  return (
    <div className={styles.page} data-editor-section="about">
      <header className={styles.intro}>
        <Kicker className={styles.kicker}>{about.intro.kicker}</Kicker>
        <Display as="h1" size="pageXl" className={styles.title}>
          {about.intro.title}
        </Display>
        <Display as="p" size="lede" className={styles.lede}>
          {about.intro.lines.map((line) => (
            <span key={line} className={styles.ledeLine}>
              {line}
            </span>
          ))}
        </Display>
        <span className={styles.thread} aria-hidden />
      </header>

      {about.chapters.map((chapter, index) => {
        const [first, second] = chapter.images;
        const flip = index % 2 === 1;
        return (
          <section
            key={chapter.title}
            className={`${styles.chapter} ${flip ? styles.chapterFlip : ''}`}
            aria-labelledby={`oph-chapter-${index}`}
          >
            <div className={styles.photos}>
              {first ? (
                <WornPhoto
                  src={first.image}
                  alt={first.alt}
                  ratio="4 / 5"
                  variant={index}
                  className={styles.photoBack}
                  sizes="(max-width: 900px) 72vw, 420px"
                  priority={index === 0}
                />
              ) : null}
              {second ? (
                <WornPhoto
                  src={second.image}
                  alt={second.alt}
                  ratio="4 / 5"
                  variant={index + 2}
                  className={styles.photoFront}
                  sizes="(max-width: 900px) 52vw, 320px"
                />
              ) : null}
              <Flower
                name={CHAPTER_FLOWERS[index % CHAPTER_FLOWERS.length] ?? 'ramo'}
                width={110}
                className={styles.chapterFlower}
              />
            </div>

            <div className={styles.text}>
              <Kicker className={styles.kicker}>{chapter.kicker}</Kicker>
              <Display
                as="h2"
                size="section"
                id={`oph-chapter-${index}`}
                className={styles.chapterTitle}
              >
                {chapter.title}
              </Display>
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        );
      })}

      <section className={styles.closing} aria-labelledby="oph-closing">
        <span className={styles.thread} aria-hidden />
        <Kicker className={styles.kicker}>{about.closing.kicker}</Kicker>
        <p className={styles.closingBody}>{about.closing.body}</p>
        <Display as="h2" size="band" id="oph-closing" className={styles.signature}>
          {about.closing.signature}
        </Display>
        <Flower name="prado" width={520} className={styles.meadow} />
      </section>
    </div>
  );
}
