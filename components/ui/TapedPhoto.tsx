import Image from 'next/image';
import type { CSSProperties } from 'react';

import styles from './TapedPhoto.module.css';

/**
 * The handoff's signature: a photograph on a white paper mount with tape over
 * its corners and a torn (deckle) edge.
 *
 * The four tape types are distinct materials in the design and must not be
 * collapsed into one. Placement is per-instance data — the handoff specifies
 * different corners, sizes and rotations for every photo on the site — so it
 * arrives as props rather than as a variant class.
 */

export type TapeType = 'kraft' | 'torn' | 'striped' | 'scotch';

export type TapeStrip = {
  type: TapeType;
  /** CSS offsets. Give exactly one of top/bottom and one of left/right. */
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: number;
  height: number;
  /** Degrees. The handoff keeps every strip between -7 and +5. */
  rotate: number;
};

export type TapedPhotoProps = {
  src: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "4 / 5". */
  ratio: string;
  tapes: TapeStrip[];
  /** Alternate between the two filters on adjacent photos. */
  deckle?: 1 | 2 | false;
  /** Wrapper padding — the room the tape has to hang off the mount. */
  pad?: number;
  /** White mount padding: the paper border around the print. */
  mountPad?: number;
  mountShadow?: 'sm' | 'lg';
  sizes: string;
  priority?: boolean;
  className?: string;
};

const MOUNT_SHADOW = {
  sm: 'var(--oph-shadow-mount-sm)',
  lg: 'var(--oph-shadow-mount-lg)',
} as const;

export function TapedPhoto({
  src,
  alt,
  ratio,
  tapes,
  deckle = 1,
  pad = 14,
  mountPad = 7,
  mountShadow = 'sm',
  sizes,
  priority = false,
  className,
}: TapedPhotoProps) {
  const wrapStyle = {
    '--pad': `${pad}px`,
    '--ratio': ratio,
  } as CSSProperties;

  const mountStyle = {
    '--mount-pad': `${mountPad}px`,
    '--mount-shadow': MOUNT_SHADOW[mountShadow],
  } as CSSProperties;

  const photoStyle = {
    '--deckle': deckle === false ? 'none' : `url(#ophDeckle${deckle === 2 ? '2' : ''})`,
  } as CSSProperties;

  return (
    <div className={className ? `${styles.wrap} ${className}` : styles.wrap} style={wrapStyle}>
      {tapes.map((tape, index) => (
        <span
          // Strips are a fixed, ordered decoration list — index is stable.
          key={index}
          aria-hidden
          className={`${styles.tape} ${styles[tape.type]}`}
          style={
            {
              '--w': `${tape.width}px`,
              '--h': `${tape.height}px`,
              '--rot': `${tape.rotate}deg`,
              top: tape.top,
              bottom: tape.bottom,
              left: tape.left,
              right: tape.right,
            } as CSSProperties
          }
        />
      ))}

      <div className={styles.mount} style={mountStyle}>
        <span className={styles.frame}>
          <Image
            className={styles.photo}
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            style={photoStyle}
          />
        </span>
      </div>
    </div>
  );
}
