import Image from 'next/image';

import styles from './Watercolour.module.css';

type Placement = 'topRight' | 'topLeft' | 'full';

const PLACEMENT_CLASS: Record<Placement, string> = {
  topRight: styles.washTopRight as string,
  topLeft: styles.washTopLeft as string,
  full: styles.washFull as string,
};

/**
 * Hydrangea wash behind section headers and the Quem Somos opening.
 * Purely decorative — announced to nobody, never intercepts a pointer.
 *
 * Set `priority` when the wash sits above the fold: on a page whose hero has no
 * photograph yet, it is the largest thing painted and would otherwise be a
 * lazily-loaded LCP element.
 */
export function Watercolour({
  placement,
  priority = false,
}: {
  placement: Placement;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/flowers-bg.png"
      alt=""
      aria-hidden="true"
      width={1400}
      height={1811}
      priority={priority}
      className={`${styles.wash} ${PLACEMENT_CLASS[placement]}`}
      sizes={placement === 'full' ? '100vw' : '(max-width: 767px) 60vw, 40vw'}
    />
  );
}

/** Wildflower border across the hero base. Always above the fold. */
export function HeroFrame() {
  return (
    <Image
      src="/brand/flowers-frame.png"
      alt=""
      aria-hidden="true"
      width={1600}
      height={2070}
      priority
      className={styles.heroFrame}
      sizes="100vw"
    />
  );
}
