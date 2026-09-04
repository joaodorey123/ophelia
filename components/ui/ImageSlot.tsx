import Image from 'next/image';

import type { ProductImage } from '@/lib/commerce/types';

import styles from './ImageSlot.module.css';

type ImageSlotProps = {
  image?: ProductImage | null;
  /** The intended shot, from the prototype's slot captions. Shown while the
   *  photography is still missing so the gap is visible, not disguised. */
  brief: string;
  /** Accessible description of the photograph once one exists. */
  alt?: string;
  /** Fixed height from the design (e.g. 330 for a favourite card). */
  height?: number | string;
  radius?: string;
  priority?: boolean;
  /** Responsive hint for next/image. Set it per layout to avoid over-fetching. */
  sizes?: string;
  className?: string;
  /** Fill the parent instead of using a fixed height (hero, full-bleed rows). */
  fill?: boolean;
  /** Where the "photography missing" caption sits inside the slot. */
  briefAlign?: 'center' | 'top';
};

export function ImageSlot({
  image,
  brief,
  alt,
  height,
  radius,
  priority = false,
  sizes = '(max-width: 767px) 100vw, 33vw',
  className,
  fill = false,
  briefAlign = 'center',
}: ImageSlotProps) {
  const style: React.CSSProperties = {};
  if (radius) style.borderRadius = radius;
  if (fill) {
    style.position = 'absolute';
    style.inset = 0;
  } else if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={[styles.slot, !image && briefAlign === 'top' ? styles.briefTop : undefined, className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {image ? (
        <Image
          src={image.url}
          alt={alt ?? image.altText ?? ''}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
        />
      ) : (
        <p className={styles.brief}>
          <span className={styles.briefTag}>Fotografia por produzir</span>
          {brief}
        </p>
      )}
    </div>
  );
}
