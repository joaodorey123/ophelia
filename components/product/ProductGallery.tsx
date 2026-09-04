'use client';

import Image from 'next/image';
import { useState } from 'react';

import { ImageSlot } from '@/components/ui/ImageSlot';
import type { ProductImage } from '@/lib/commerce/types';

import styles from './ProductGallery.module.css';

/**
 * Product gallery. Clicking a thumbnail cross-fades the main image, which the
 * handoff asked production to add (the prototype's thumbs were presentational).
 *
 * With no photography yet, the designed slots render with their intended shots
 * as captions and the thumb strip is omitted rather than faked.
 */
export function ProductGallery({
  images,
  productTitle,
  briefs,
}: {
  images: ProductImage[];
  productTitle: string;
  /** Intended shots for the four designed slots, used until photography lands. */
  briefs: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.main}>
          <ImageSlot brief={briefs[0] ?? productTitle} fill priority sizes="(max-width: 767px) 100vw, 45vw" />
        </div>
        <div className={styles.thumbs}>
          {briefs.slice(1, 4).map((brief) => (
            <ImageSlot
              key={brief}
              brief={brief}
              height={120}
              radius="var(--oph-r-sm)"
              sizes="(max-width: 767px) 30vw, 15vw"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        {images.map((image, index) => (
          <div
            key={image.url}
            className={[styles.frame, index === activeIndex ? styles.frameActive : undefined]
              .filter(Boolean)
              .join(' ')}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={image.url}
              alt={image.altText ?? `${productTitle} — imagem ${index + 1}`}
              fill
              sizes="(max-width: 767px) 100vw, 45vw"
              priority={index === 0}
              className={styles.thumbImage}
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <ul className={styles.thumbs}>
          {images.slice(0, 6).map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                className={[
                  styles.thumbButton,
                  index === activeIndex ? styles.thumbButtonActive : undefined,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagem ${index + 1} de ${productTitle}`}
                aria-pressed={index === activeIndex}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 30vw, 15vw"
                  className={styles.thumbImage}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
