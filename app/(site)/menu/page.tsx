import type { Metadata } from 'next';

import { Flower, type FlowerName } from '@/components/ui/Flower';
import { Display, Kicker } from '@/components/ui/Type';
import { WornPhoto } from '@/components/ui/WornPhoto';
import { menu, type MenuGroup, type MenuItem } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './menu.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Menu brunch',
  description: menu.intro,
  path: '/menu',
});

/**
 * The café's menu, from the printed "menu magazine".
 *
 * Three groups — comer, sobremesas, beber — each a run of sections laid out
 * in newspaper columns, so a long menu reads like the paper one instead of a
 * single endless list. Every word and price is content (content/menu.json),
 * editable in the builder; only the photographs that decorate each group are
 * chosen here.
 */
const GROUPS: {
  id: 'comer' | 'sobremesas' | 'beber';
  photos: { src: string; alt: string }[];
  cutouts: [FlowerName, FlowerName];
}[] = [
  {
    id: 'comer',
    photos: [
      { src: '/photos/casa/02006.jpg', alt: 'Torrada francesa de chocolate e avelã' },
      { src: '/photos/casa/02032.jpg', alt: 'Waffle Rio com frango panado' },
    ],
    cutouts: ['croissants', 'bowl'],
  },
  {
    id: 'sobremesas',
    photos: [
      { src: '/photos/casa/02053.jpg', alt: 'A pavlova da Ophelia com frutos vermelhos' },
      { src: '/photos/casa/02127.jpg', alt: 'Brownie de nibs de cacau' },
    ],
    cutouts: ['pavlova-mao', 'cookie-maos'],
  },
  {
    id: 'beber',
    photos: [
      { src: '/photos/casa/02039.jpg', alt: 'Sumo de laranja e sumo verde' },
      { src: '/photos/casa/02104.jpg', alt: 'Matcha latte' },
    ],
    cutouts: ['batido', 'limonada'],
  },
];

function sectionId(group: string, index: number) {
  return `${group}-${index + 1}`;
}

export default function MenuPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro} data-editor-section="menu">
        <Flower name="croissants" width={170} className={styles.introCutoutLeft} />
        <Flower name="batido" width={150} className={styles.introCutoutRight} />
        <Kicker>{menu.kicker}</Kicker>
        <Display as="h1" size="page" className={styles.title}>
          {menu.title}
        </Display>
        <p className={styles.lede}>{menu.intro}</p>
        <Legend />
      </header>

      <nav className={styles.chips} aria-label="Partes do menu">
        <div className={styles.chipsInner}>
          {GROUPS.map(({ id }) => {
            const group = menu[id];
            return (
              <div key={id} className={styles.chipGroup}>
                <a href={`#${id}`} className={styles.chipGroupLink}>
                  {group.title}
                </a>
                {group.sections.map((section, index) => (
                  <a key={section.title} href={`#${sectionId(id, index)}`} className={styles.chip}>
                    {section.title}
                  </a>
                ))}
              </div>
            );
          })}
        </div>
      </nav>

      {GROUPS.map(({ id, photos, cutouts }, groupIndex) => (
        <MenuGroupBlock
          key={id}
          id={id}
          group={menu[id]}
          photos={photos}
          cutouts={cutouts}
          flip={groupIndex % 2 === 1}
        />
      ))}

      <footer className={styles.notes}>
        <Flower name="ramo" width={90} className={styles.notesFlower} />
        {menu.notes.map((note) => (
          <p key={note.slice(0, 40)}>{note}</p>
        ))}
      </footer>
    </div>
  );
}

function MenuGroupBlock({
  id,
  group,
  photos,
  cutouts,
  flip,
}: {
  id: string;
  group: MenuGroup;
  photos: { src: string; alt: string }[];
  cutouts: [FlowerName, FlowerName];
  flip: boolean;
}) {
  return (
    <section
      id={id}
      className={styles.group}
      aria-labelledby={`${id}-title`}
      data-editor-section={`menu-${id}`}
    >
      <div className={`${styles.groupHead} ${flip ? styles.groupHeadFlip : ''}`}>
        <div className={styles.groupPhotos}>
          {photos.map((photo, index) => (
            <WornPhoto
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              ratio="4 / 5"
              variant={index + (flip ? 2 : 0)}
              className={index === 0 ? styles.groupPhotoBack : styles.groupPhotoFront}
              sizes="(max-width: 900px) 50vw, 300px"
            />
          ))}
        </div>
        <div className={styles.groupTitleWrap}>
          <Display as="h2" size="pageXl" id={`${id}-title`}>
            {group.title}
          </Display>
          <Flower name={cutouts[0]} width={190} className={styles.groupCutout} />
        </div>
      </div>

      <div className={styles.columns}>
        {group.sections.map((section, index) => (
          <section
            key={section.title}
            id={sectionId(id, index)}
            className={styles.section}
            aria-labelledby={`${sectionId(id, index)}-title`}
          >
            {section.kicker ? <span className={styles.sectionKicker}>{section.kicker}</span> : null}
            <Display
              as="h3"
              size="sectionSm"
              id={`${sectionId(id, index)}-title`}
              className={styles.sectionTitle}
            >
              {section.title}
            </Display>
            {section.note ? <p className={styles.sectionNote}>{section.note}</p> : null}
            <ul className={styles.items}>
              {section.items.map((item) => (
                <Item key={`${item.name}-${item.price}`} item={item} />
              ))}
            </ul>
          </section>
        ))}
        <Flower name={cutouts[1]} width={170} className={styles.columnsCutout} />
      </div>
    </section>
  );
}

function Item({ item }: { item: MenuItem }) {
  return (
    <li className={styles.item}>
      <div className={styles.itemLine}>
        <span className={`${styles.itemName} ${item.highlight ? styles.itemHighlight : ''}`}>
          {item.name}
          {item.highlight ? <span className="oph-sr-only"> ({menu.legend.highlight})</span> : null}
        </span>
        <Marks item={item} />
        <span className={styles.leader} aria-hidden />
        <span className={styles.price}>{item.price} €</span>
      </div>
      {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
    </li>
  );
}

function Marks({ item }: { item: MenuItem }) {
  if (!item.nuts && !item.glutenFree && !item.sesame) return null;
  return (
    <span className={styles.marks}>
      {item.glutenFree ? <Mark kind="glutenFree" /> : null}
      {item.nuts ? <Mark kind="nuts" /> : null}
      {item.sesame ? <Mark kind="sesame" /> : null}
    </span>
  );
}

function Mark({ kind }: { kind: 'nuts' | 'glutenFree' | 'sesame' }) {
  const label = menu.legend[kind];
  return (
    <span className={styles.mark} title={label}>
      <MarkIcon kind={kind} />
      <span className="oph-sr-only">{label}</span>
    </span>
  );
}

function Legend() {
  return (
    <ul className={styles.legend} aria-label="Legenda">
      <li>
        <span className={styles.legendSwatch} aria-hidden />
        {menu.legend.highlight}
      </li>
      {(['glutenFree', 'nuts', 'sesame'] as const).map((kind) => (
        <li key={kind}>
          <span className={styles.mark} aria-hidden>
            <MarkIcon kind={kind} />
          </span>
          {menu.legend[kind]}
        </li>
      ))}
    </ul>
  );
}

/** The paper menu's three marks, redrawn as line icons. */
function MarkIcon({ kind }: { kind: 'nuts' | 'glutenFree' | 'sesame' }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };

  if (kind === 'nuts') {
    // An acorn.
    return (
      <svg {...common}>
        <path d="M5 10c0-3 3-5 7-5s7 2 7 5H5Z" />
        <path d="M12 5V3" />
        <path d="M6.5 10c0 5 2.5 9 5.5 10 3-1 5.5-5 5.5-10" />
      </svg>
    );
  }

  if (kind === 'sesame') {
    // Three seeds.
    return (
      <svg {...common}>
        <ellipse cx="8" cy="9" rx="2.4" ry="4" transform="rotate(-20 8 9)" />
        <ellipse cx="15.5" cy="8" rx="2.4" ry="4" transform="rotate(18 15.5 8)" />
        <ellipse cx="12" cy="17" rx="2.4" ry="4" />
      </svg>
    );
  }

  // An ear of wheat in a ring: sem glúten.
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 18V7" />
      <path d="M12 10c-2 0-3-1.5-3-3 2 0 3 1.5 3 3Zm0 0c2 0 3-1.5 3-3-2 0-3 1.5-3 3Z" />
      <path d="M12 14c-2 0-3-1.5-3-3 2 0 3 1.5 3 3Zm0 0c2 0 3-1.5 3-3-2 0-3 1.5-3 3Z" />
    </svg>
  );
}
