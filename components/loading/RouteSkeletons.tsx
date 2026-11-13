import type { CSSProperties } from 'react';

import { Display, Kicker } from '@/components/ui/Type';
import type { RouteTarget } from '@/lib/route-loading';

import collectionStyles from '@/app/(site)/comprar/collection.module.css';
import productStyles from '@/app/(site)/produto/[handle]/product.module.css';
import searchStyles from '@/app/(site)/pesquisa/search.module.css';
import cardStyles from '@/components/product/ProductCard.module.css';
import galleryStyles from '@/components/product/ProductGallery.module.css';
import purchaseStyles from '@/components/product/ProductPurchase.module.css';
import buttonStyles from '@/components/ui/Button.module.css';
import tapedStyles from '@/components/ui/TapedPhoto.module.css';
import sections from '@/styles/sections.module.css';

import styles from './Skeleton.module.css';

/**
 * The coming page, drawn with the real page's own classes so every block
 * lands where the content will. Whatever is already known (the shop's
 * heading, a collection's name, the filter pills, the search term) is shown
 * for real; only what Shopify has yet to answer is a bone.
 */

export type SkeletonCatalogue = {
  shop: { kicker: string; title: string; lede: string };
  collections: { handle: string; title: string; description: string }[];
};

/** Fills 2, 3 and 4-column grids with whole rows. */
const GRID_CARDS = 12;

/** Card name widths, varied so the grid reads as products, not a pattern. */
const NAME_WIDTHS = ['64%', '48%', '72%', '56%', '68%', '44%'];

export function Bar({ w, h }: { w: string; h?: string }) {
  return (
    <span
      className={styles.bar}
      style={{ '--w': w, ...(h ? { '--h': h } : {}) } as CSSProperties}
    />
  );
}

function CardBones({ index }: { index: number }) {
  return (
    <div className={cardStyles.card}>
      <span className={cardStyles.media} />
      <span className={cardStyles.name}>
        <Bar w={NAME_WIDTHS[index % NAME_WIDTHS.length] ?? '60%'} h="0.62em" />
      </span>
      <span className={cardStyles.price}>
        <Bar w="4.6em" />
      </span>
      <span
        className={`${buttonStyles.base} ${buttonStyles.outline} ${cardStyles.action} ${styles.ghost}`}
      >
        <span className={styles.mask}>juntar ao cesto</span>
      </span>
    </div>
  );
}

function GridBones({ className }: { className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: GRID_CARDS }, (_, index) => (
        <CardBones key={index} index={index} />
      ))}
    </div>
  );
}

function ShopSkeleton({
  target,
  catalogue,
}: {
  target: Extract<RouteTarget, { kind: 'shop' | 'collection' }>;
  catalogue: SkeletonCatalogue;
}) {
  const { shop, collections } = catalogue;
  const active = target.kind === 'collection' ? target.handle : null;
  const collection = active ? collections.find((entry) => entry.handle === active) : undefined;

  const title = target.kind === 'shop' ? shop.title : collection?.title.toLowerCase();
  const lede =
    target.kind === 'shop' ? shop.lede : collection ? collection.description || shop.lede : null;

  return (
    <div className={`${sections.wide} ${collectionStyles.page}`}>
      <div className={collectionStyles.intro}>
        <Kicker>{shop.kicker}</Kicker>
        <Display as="p" size="page" className={collectionStyles.title}>
          {title ?? <Bar w="7ch" h="0.5em" />}
        </Display>
        <p className={sections.introLede}>{lede ?? <Bar w="80%" />}</p>
      </div>

      {collections.length > 0 ? (
        <div className={collectionStyles.filters}>
          <span
            className={`${collectionStyles.pill} ${active === null ? collectionStyles.pillActive : ''}`}
          >
            tudo
          </span>
          {collections.map((entry) => (
            <span
              key={entry.handle}
              className={`${collectionStyles.pill} ${active === entry.handle ? collectionStyles.pillActive : ''}`}
            >
              {entry.title.toLowerCase()}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.pulse}>
        <p className={collectionStyles.count}>
          <Bar w="5.6em" />
        </p>
        <GridBones className={collectionStyles.grid} />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className={`${sections.mid} ${productStyles.page} ${styles.pulse}`}>
      <p className={productStyles.breadcrumb}>
        <span className={styles.crumb}>
          <Bar w="10em" />
        </span>
      </p>

      <div className={productStyles.layout}>
        {/* The same blank print the gallery mounts: 18px wrap, 10px mount, 4:5. */}
        <div className={galleryStyles.gallery}>
          <div className={tapedStyles.wrap} style={{ '--pad': '18px' } as CSSProperties}>
            <div
              className={tapedStyles.mount}
              style={
                {
                  '--mount-pad': '10px',
                  '--mount-shadow': 'var(--oph-shadow-mount-lg)',
                } as CSSProperties
              }
            >
              <span className={tapedStyles.frame} style={{ '--ratio': '4 / 5' } as CSSProperties} />
            </div>
          </div>
          <div className={galleryStyles.thumbs}>
            {[0, 1, 2].map((index) => (
              <span key={index} className={galleryStyles.thumb} />
            ))}
          </div>
        </div>

        <div>
          <Kicker>
            <Bar w="8em" />
          </Kicker>
          <Display as="p" size="product" className={productStyles.buyTitle}>
            <Bar w="72%" h="0.5em" />
          </Display>

          <div className={purchaseStyles.description}>
            {['100%', '94%', '97%', '62%'].map((width, index) => (
              <span key={index} className={styles.line}>
                <Bar w={width} />
              </span>
            ))}
          </div>

          {/* Most products sell in sizes and offer the handwritten card. */}
          <div className={purchaseStyles.option}>
            <span className={purchaseStyles.optionLabel}>
              <Bar w="11em" />
            </span>
            <div className={purchaseStyles.values}>
              {['5.5em', '5.8em', '6.2em'].map((width) => (
                <span key={width} className={`${purchaseStyles.value} ${styles.ghost}`}>
                  <span className={purchaseStyles.valueName}>
                    <Bar w={width} />
                  </span>
                  <span className={purchaseStyles.valuePrice}>
                    <Bar w="3.2em" />
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className={purchaseStyles.addon}>
            <span className={`${purchaseStyles.checkbox} ${styles.box}`} />
            <span>
              <span className={purchaseStyles.addonTitle}>
                <Bar w="13em" />
              </span>
              <span className={purchaseStyles.addonNote}>
                <Bar w="9em" />
              </span>
            </span>
          </div>

          <div className={purchaseStyles.buy}>
            <span className={`${purchaseStyles.stepper} ${styles.ghost}`}>
              <span className={purchaseStyles.stepperButton} />
              <span className={purchaseStyles.stepperValue} />
              <span className={purchaseStyles.stepperButton} />
            </span>
            <span
              className={`${buttonStyles.base} ${buttonStyles.primary} ${purchaseStyles.add} ${styles.solid}`}
            >
              <span className={styles.mask}>juntar ao cesto</span>
            </span>
          </div>

          <div className={purchaseStyles.panels}>
            {['7em', '9em', '8em'].map((width) => (
              <div key={width} className={purchaseStyles.panelRow}>
                <span className={purchaseStyles.panelButton}>
                  <span className={purchaseStyles.panelTitle}>
                    <Bar w={width} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchSkeleton({ q }: { q: string }) {
  // Kicker and title mirror app/(site)/pesquisa/page.tsx.
  return (
    <div className={`${sections.wide} ${searchStyles.page}`}>
      <div className={searchStyles.intro}>
        <Kicker>a loja</Kicker>
        <Display as="p" size="pageSm" className={searchStyles.title}>
          pesquisar
        </Display>
      </div>

      <div className={searchStyles.form}>
        <span className={`${searchStyles.input} ${styles.control}`}>{q}</span>
        <span className={`${searchStyles.submit} ${styles.control}`}>procurar</span>
      </div>

      <div className={styles.pulse}>
        <p className={searchStyles.count}>
          <Bar w="11em" />
        </p>
        <GridBones className={searchStyles.grid} />
      </div>
    </div>
  );
}

export function RouteSkeleton({
  target,
  catalogue,
}: {
  target: RouteTarget;
  catalogue: SkeletonCatalogue;
}) {
  return (
    <div className={styles.root} aria-busy="true">
      <p className="oph-sr-only" role="status">
        A carregar…
      </p>
      <div aria-hidden>
        {target.kind === 'product' ? (
          <ProductSkeleton />
        ) : target.kind === 'search' ? (
          <SearchSkeleton q={target.q} />
        ) : (
          <ShopSkeleton target={target} catalogue={catalogue} />
        )}
      </div>
    </div>
  );
}
