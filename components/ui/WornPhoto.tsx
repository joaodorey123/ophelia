import Image from 'next/image';
import type { CSSProperties } from 'react';

import { Flower, PIN_FLOWERS } from './Flower';
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
const PIN = ['pinLeft', 'pinRight', 'pinRightLow', 'pinLeftLow'] as const;

export function WornPhoto({
  src,
  alt,
  ratio = '16 / 11',
  sizes,
  variant = 0,
  priority = false,
  pin = 'flower',
  className,
}: {
  src: string;
  alt: string;
  ratio?: string;
  sizes: string;
  variant?: number;
  priority?: boolean;
  pin?: 'flower' | 'tape';
  className?: string;
}) {
  const index = ((variant % 4) + 4) % 4;
  const tape = TAPE[index] ?? 'tapeCornerLeft';
  const flower = PIN_FLOWERS[index] ?? 'flor-azul';

  return (
    <div
      className={[styles.worn, styles[`v${index}`], className].filter(Boolean).join(' ')}
      style={{ '--ratio': ratio } as CSSProperties}
    >
      <span className={styles.shadow} aria-hidden />
      <div className={styles.print}>
        <Image
          className={styles.photo}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
        />
        <span className={styles.grain} aria-hidden />
      </div>
      {pin === 'tape' ? (
        <span className={`${styles.tape} ${styles[tape]}`} aria-hidden />
      ) : (
        <Flower name={flower} width={84} className={`${styles.pin} ${styles[PIN[index]!]}`} />
      )}
    </div>
  );
}
