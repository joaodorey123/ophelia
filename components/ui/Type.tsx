import type { CSSProperties, ElementType, ReactNode } from 'react';

import styles from './Type.module.css';

/**
 * The two display faces, as the handoff sizes them.
 *
 * Sizes are named after where they appear rather than by an abstract scale,
 * because the handoff specifies them per screen and a generic xs–xl ladder
 * would quietly round them to the wrong value.
 */

const DISPLAY_SIZE = {
  hero: ['clamp(40px, 5.6vw, 68px)', '1.24'],
  pageXl: ['clamp(40px, 5.6vw, 70px)', '1.24'],
  page: ['clamp(36px, 4.6vw, 54px)', '1.24'],
  pageSm: ['clamp(34px, 4.4vw, 52px)', '1.24'],
  article: ['clamp(30px, 4vw, 48px)', '1.3'],
  product: ['clamp(32px, 3.8vw, 46px)', '1.28'],
  section: ['clamp(29px, 3.6vw, 37px)', '1.3'],
  sectionSm: ['clamp(26px, 3.2vw, 31px)', '1.3'],
  band: ['clamp(30px, 3.4vw, 42px)', '1.34'],
  newsletter: ['clamp(27px, 3.4vw, 40px)', '1.4'],
  quote: ['clamp(25px, 3vw, 36px)', '1.56'],
  lede: ['clamp(24px, 2.9vw, 34px)', '1.62'],
} as const;

export type DisplaySize = keyof typeof DISPLAY_SIZE;

export function Display({
  as: Tag = 'h2',
  size,
  className,
  children,
  id,
}: {
  as?: ElementType;
  size: DisplaySize;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  const [fontSize, lineHeight] = DISPLAY_SIZE[size];
  return (
    <Tag
      id={id}
      className={className ? `${styles.display} ${className}` : styles.display}
      style={{ '--size': fontSize, '--lh': lineHeight } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/**
 * Uppercase eyebrow. The handoff uses four tracking/size pairs; each is named
 * for its role so a component picks one instead of inventing a fifth.
 */
const KICKER = {
  /* estoril · desde 2019 */
  hero: ['9.5px', '0.4em', 'var(--oph-muted-1)'],
  /* section labels, field labels */
  label: ['10.5px', '0.24em', 'var(--oph-muted-1)'],
  /* card meta, footer column headings */
  meta: ['10px', '0.26em', 'var(--oph-muted-4)'],
  /* breadcrumbs, counts */
  ui: ['11px', '0.14em', 'var(--oph-muted-4)'],
  /* attribution under a review */
  attribution: ['10.5px', '0.22em', 'var(--oph-muted-2)'],
  /*
   * Over a photo scrim. White is a contrast requirement here, not a style
   * choice: the handoff measures this at 4.95:1 against the brightest pixel
   * behind it, and the muted blue used elsewhere would not clear 4.5:1.
   */
  onScrim: ['9.5px', '0.4em', '#ffffff'],
} as const;

export type KickerTone = keyof typeof KICKER;

export function Kicker({
  as: Tag = 'span',
  tone = 'hero',
  className,
  children,
}: {
  as?: ElementType;
  tone?: KickerTone;
  className?: string;
  children: ReactNode;
}) {
  const [size, track, colour] = KICKER[tone];
  return (
    <Tag
      className={className ? `${styles.kicker} ${className}` : styles.kicker}
      style={{ '--size': size, '--track': track, '--tone': colour } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
