'use client';

import Link from 'next/link';
import { useState } from 'react';

import styles from './editor.module.css';

export type MapRegion = {
  id: string;
  label: string;
  href: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

export type MapPage = {
  id: string;
  label: string;
  path: string;
  image: string;
  aspect: string;
  regions: MapRegion[];
};

/**
 * The site as a picture you can click.
 *
 * Rather than asking someone to work out which named section corresponds to
 * the bit of the page they want to change, this shows the page and lets them
 * point at it. The regions come from markers in the storefront's own markup,
 * captured by `npm run builder:capture`, so they line up with the real design instead
 * of hand-measured guesses.
 */
export function SiteMap({
  pages,
  storefrontUrl,
}: {
  pages: MapPage[];
  storefrontUrl: string | null;
}) {
  const [activeId, setActiveId] = useState(pages[0]?.id ?? '');
  const active = pages.find((page) => page.id === activeId) ?? pages[0];

  if (!active) {
    return (
      <div className={`${styles.notice} ${styles.noticeInfo}`}>
        Ainda não há imagens do site. Quem trata do site corre <code>npm run builder:capture</code>{' '}
        para as criar.
      </div>
    );
  }

  return (
    <>
      <div className={styles.mapTabs}>
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            className={`${styles.mapTab} ${page.id === active.id ? styles.mapTabActive : ''}`}
            onClick={() => setActiveId(page.id)}
            aria-current={page.id === active.id ? 'page' : undefined}
          >
            {page.label}
          </button>
        ))}
      </div>

      <p className={styles.mapHint}>
        Carrega numa zona da página para a editar.{' '}
        {active.regions.length === 0 ? 'Esta página não tem partes editáveis aqui.' : null}
        {storefrontUrl !== null ? (
          <a href={`${storefrontUrl}${active.path}`} target="_blank" rel="noreferrer">
            Ver esta página no site ↗
          </a>
        ) : null}
      </p>

      <div className={styles.mapFrame} style={{ aspectRatio: active.aspect }}>
        {/* A captured photograph of the page, not a live embed: the storefront
            refuses to be framed by another site, and rightly so. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.mapImage} src={active.image} alt={`A página ${active.label}`} />

        {active.regions.map((region, index) => (
          <Link
            key={`${region.id}-${index}`}
            href={region.href}
            className={styles.mapRegion}
            style={{
              top: `${region.top}%`,
              left: `${region.left}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
            }}
            aria-label={`Editar: ${region.label}`}
          >
            <span className={styles.mapRegionDot} aria-hidden>
              {index + 1}
            </span>
            <span className={styles.mapRegionLabel}>{region.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
