import Image from 'next/image';
import type { CSSProperties } from 'react';

import styles from './WornPhoto.module.css';

/**
 * A worn photograph: rough-edged, grainy, slightly faded, tilted and taped —
 * an old print rather than a crisp digital rectangle. Used for the diary.
 *
 * `variant` picks one of four outlines, tilts and tape placements. Callers
 * pass something like the item's index, so photos side by side never look
 * the same.
 */

const TAPE = ['tapeCornerLeft', 'tapeCornerRight', 'tapeTop', 'tapeTorn'] as const;

export function WornPhoto({
  src,
  alt,
  ratio = '16 / 11',
  sizes,
  variant = 0,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  ratio?: string;
  sizes: string;
  variant?: number;
  priority?: boolean;
  className?: string;
}) {
  const index = ((variant % 4) + 4) % 4;
  const tape = TAPE[index] ?? 'tapeCornerLeft';

  return (
    <div
      className={[styles.worn, styles[`v${index}`], className].filter(Boolean).join(' ')}
      style={{ '--ratio': ratio } as CSSProperties}
    >
      <div className={styles.print}>
        <Image className={styles.photo} src={src} alt={alt} fill sizes={sizes} priority={priority} />
        <span className={styles.grain} aria-hidden />
      </div>
      <span className={`${styles.tape} ${styles[tape]}`} aria-hidden />
    </div>
  );
}
