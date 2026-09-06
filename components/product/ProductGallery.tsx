'use client';

import Image from 'next/image';
import { useState } from 'react';

import { TapedPhoto } from '@/components/ui/TapedPhoto';
import type { ProductImage } from '@/lib/commerce/types';

import styles from './ProductGallery.module.css';

/**
 * The product gallery: one taped hero print with up to three square
 * thumbnails beneath it.
 *
 * The thumbnails are buttons, not links — they change what the hero shows
 * rather than navigating — and the hero carries the alt text so a screen
 * reader is not read the same photograph four times.
 */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const hero = images[active] ?? images[0] ?? null;

  if (!hero) {
    return <div className={styles.gallery} />;
  }

  return (
    <div className={styles.gallery}>
      <TapedPhoto
        src={hero.url}
        alt={hero.altText ?? title}
        ratio="4 / 5"
        pad={18}
        mountPad={10}
        mountShadow="lg"
        deckle={1}
        priority
        sizes="(max-width: 900px) 100vw, 560px"
        tapes={[
          { type: 'torn', top: '2px', left: '10%', width: 118, height: 30, rotate: -5 },
          { type: 'scotch', bottom: '2px', right: '12%', width: 112, height: 28, rotate: 4 },
        ]}
      />

      {images.length > 1 ? (
        <div className={styles.thumbs}>
          {images.slice(0, 3).map((image, index) => (
            <button
              key={image.url}
              type="button"
              className={`${styles.thumb} ${index === active ? styles.thumbActive : ''}`}
              aria-label={`Ver imagem ${index + 1} de ${title}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              <Image
                className={styles.thumbImage}
                src={image.url}
                alt=""
                fill
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
