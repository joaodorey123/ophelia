import type { Metadata } from 'next';
import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { JsonLd } from '@/components/seo/JsonLd';
import { Kicker } from '@/components/ui/Type';
import { Watercolour } from '@/components/ui/Watercolour';
import { CHAPTERS, OPENING_LEAD } from '@/lib/content/story';
import { pageMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structured-data';

import styles from './story.module.css';
import sections from '@/styles/sections.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Quem Somos',
  description:
    'A Ophelia começou na Guarda, entre almoços de domingo e bolos acabados de sair do forno. Em 2019 nasceu como empresa de eventos; em 2022 abrimos portas no Estoril.',
  path: '/quem-somos',
  type: 'article',
});

const crumbs = [
  { name: 'Ophelia', path: '/' },
  { name: 'Quem Somos', path: '/quem-somos' },
];

export default function QuemSomosPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className={styles.opening} aria-labelledby="sobre-title">
        <Watercolour placement="full" priority />
        <div className={styles.openingInner}>
          <Kicker>Quem somos</Kicker>
          <h1 id="sobre-title" className={styles.openingTitle}>
            Não somos uma empresa — somos uma família.
          </h1>
          <p className={styles.openingLead}>{OPENING_LEAD}</p>
        </div>
      </section>

      <section className={sections.sectionTight} aria-label="A nossa história">
        <div className={styles.timeline}>
          {CHAPTERS.map((chapter) => (
            <article key={chapter.year} className={styles.chapter}>
              <div>
                <span className={styles.chapterYear} aria-hidden="true">
                  {chapter.year}
                </span>
                <h2 className={styles.chapterTitle}>
                  <span className="oph-visually-hidden">{chapter.year} — </span>
                  {chapter.title}
                </h2>
                <p className={styles.chapterBody}>{chapter.body}</p>
              </div>
              {/*
                Story imagery sits back behind product imagery — the design
                system's `.washed` treatment, per the handoff.
              */}
              <div className={`${styles.chapterMedia} oph-washed`}>
                <ImageSlot brief={chapter.imageBrief} fill sizes="(max-width: 767px) 100vw, 45vw" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${sections.section} ${sections.groundBlue} ${sections.centred}`}
        data-ground="blue"
        aria-labelledby="sobre-closing"
      >
        <Image
          src="/brand/menu.png"
          alt=""
          aria-hidden="true"
          width={600}
          height={800}
          className={styles.closingProp}
        />
        <h2 id="sobre-closing" className={styles.closingTitle}>
          Porque, para nós, as melhores memórias constroem-se à volta de uma mesa.
        </h2>
        <div className={styles.closingActions}>
          <ButtonLink href="/comprar/cookies" variant="cream" size="lg">
            Comprar as cookies
          </ButtonLink>
          <ButtonLink href="/eventos" variant="outlineCream" size="lg">
            Falar sobre o meu evento
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
