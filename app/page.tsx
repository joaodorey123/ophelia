import Image from 'next/image';
import Link from 'next/link';

import { PostCard } from '@/components/blog/PostCard';
import { ProductCard } from '@/components/product/ProductCard';
import { TextLink } from '@/components/ui/Button';
import { TapedPhoto } from '@/components/ui/TapedPhoto';
import { Display, Kicker } from '@/components/ui/Type';
import { catalogue } from '@/lib/commerce';
import { getCollectionsSafe } from '@/lib/commerce/safe';
import type { Product } from '@/lib/commerce/types';
import { home, latestPosts, reviews, site } from '@/lib/content';
import { SHOP_INDEX, collectionPath } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './home.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'Ophelia — pastelaria, brunch e mercearia no Estoril',
  description: site.brand.description,
  path: '/',
});

export const revalidate = 900;

/**
 * The favourites row.
 *
 * The handles are editorial — the client chooses what leads the home page —
 * but the products themselves are Shopify's. A handle that no longer resolves
 * is skipped rather than rendered as a gap, and if none resolve the row falls
 * back to Shopify's own best sellers so the section is never empty.
 */
const FAVOURITES_COUNT = 4;

async function getFavourites(): Promise<Product[]> {
  const wanted = await Promise.all(
    home.favourites.handles.map((handle) => catalogue().getProduct(handle)),
  );
  const chosen = wanted.filter((product): product is Product => product !== null);
  if (chosen.length >= FAVOURITES_COUNT) return chosen.slice(0, FAVOURITES_COUNT);

  // Top up with Shopify's own best sellers so the row is never short.
  const seen = new Set(chosen.map((product) => product.handle));
  const bestSelling = await catalogue().getProducts({
    first: FAVOURITES_COUNT * 2,
    sortKey: 'BEST_SELLING',
  });
  for (const product of bestSelling) {
    if (chosen.length >= FAVOURITES_COUNT) break;
    if (seen.has(product.handle)) continue;
    seen.add(product.handle);
    chosen.push(product);
  }
  return chosen;
}

export default async function HomePage() {
  const [collections, favourites] = await Promise.all([getCollectionsSafe(), getFavourites()]);

  const byHandle = new Map(collections.map((collection) => [collection.handle, collection]));
  /*
   * Collection cards are editorial artwork over real Shopify collections, so
   * only cards whose collection exists are shown. "ver tudo" has no handle and
   * always points at the shop index.
   */
  const cards = home.collections.cards.filter(
    (card) => card.handle === null || byHandle.has(card.handle),
  );
  /*
   * The "ver tudo" card is a companion to the real collections, not a section
   * of its own: with no collections published there is nothing to browse by,
   * so the whole band is omitted rather than shown with a single card.
   */
  const hasRealCollections = cards.some((card) => card.handle !== null);

  const posts = latestPosts(3);

  return (
    <>
      <section className={styles.hero} data-editor-section="home-hero">
        <Image
          className={styles.heroImage}
          src={home.hero.image}
          alt={home.hero.alt}
          fill
          sizes="100vw"
          priority
        />
        <div className={styles.heroVeil} aria-hidden />

        <div className={styles.heroCard}>
          <span className={styles.heroTapeTop} aria-hidden />
          <span className={styles.heroTapeBottom} aria-hidden />
          <div className={styles.heroInner}>
            <Kicker>{home.hero.kicker}</Kicker>
            <Display as="h1" size="hero" className={styles.heroTitle}>
              {home.hero.title}
            </Display>
            <div className={styles.heroLink}>
              <TextLink href={SHOP_INDEX}>{home.hero.cta}</TextLink>
            </div>
          </div>
        </div>
      </section>

      {hasRealCollections ? (
        <section
          className={`${sections.wide} ${styles.collections}`}
          aria-labelledby="oph-cols"
          data-editor-section="home-collections"
        >
          <div className={sections.header}>
            <Display as="h2" size="section" id="oph-cols">
              {home.collections.heading}
            </Display>
            <span className={sections.headerNote}>{home.collections.note}</span>
          </div>

          <div className={styles.collectionGrid}>
            {cards.map((card, index) => (
              <Link
                key={card.name}
                href={card.handle ? collectionPath(card.handle) : SHOP_INDEX}
                className={styles.collectionCard}
              >
                <TapedPhoto
                  src={card.image}
                  alt=""
                  ratio="4 / 5"
                  pad={14}
                  deckle={index % 2 === 0 ? 1 : 2}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 230px"
                  tapes={[
                    { type: 'kraft', top: '0', left: '26px', width: 78, height: 24, rotate: -5 },
                    {
                      type: 'striped',
                      bottom: '2px',
                      right: '22px',
                      width: 74,
                      height: 20,
                      rotate: 4,
                    },
                  ]}
                />
                <span className={styles.collectionName}>
                  {card.name}
                  <span className={styles.collectionArrow} aria-hidden>
                    →
                  </span>
                </span>
                <p className={styles.collectionNote}>{card.note}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {favourites.length > 0 ? (
        <section
          className={`${sections.wide} ${styles.favourites}`}
          aria-labelledby="oph-fav"
          data-editor-section="home-favourites"
        >
          <div className={sections.header}>
            <Display as="h2" size="section" id="oph-fav">
              {home.favourites.heading}
            </Display>
            <TextLink href={SHOP_INDEX} small>
              {home.favourites.cta}
            </TextLink>
          </div>

          <div className={styles.productGrid}>
            {favourites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 238px"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.story} aria-labelledby="oph-story" data-editor-section="home-story">
        <Image
          className={styles.storyFlowers}
          src="/brand/bg-flowers.png"
          alt=""
          fill
          sizes="100vw"
          aria-hidden
        />
        <div className={`${sections.wide} ${styles.storyInner}`}>
          <TapedPhoto
            src={home.story.image}
            alt={home.story.alt}
            ratio="1 / 1"
            pad={16}
            mountPad={9}
            mountShadow="lg"
            deckle={2}
            sizes="(max-width: 900px) 100vw, 560px"
            tapes={[{ type: 'torn', top: '0', left: '40%', width: 100, height: 29, rotate: -3 }]}
          />

          <div>
            <Kicker>{home.story.kicker}</Kicker>
            <Display as="h2" size="band" id="oph-story" className={styles.storyHeading}>
              {home.story.headingLines.map((line) => (
                <span key={line} className={styles.storyLine}>
                  {line}
                </span>
              ))}
            </Display>
            <p className={styles.storyBody}>{home.story.body}</p>
            <div className={styles.storyLink}>
              <TextLink href="/quem-somos">{home.story.cta}</TextLink>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${sections.wide} ${styles.reviews}`}
        aria-labelledby="oph-reviews"
        data-editor-section="reviews"
      >
        <Display as="h2" size="section" id="oph-reviews" className={styles.reviewsHeading}>
          {home.reviews.heading}
        </Display>
        <div className={styles.reviewGrid}>
          {reviews.map((review) => (
            <figure key={review.who} className={styles.review}>
              <span className={styles.reviewTape} aria-hidden />
              <span className={styles.stars} aria-label="Cinco estrelas em cinco">
                {review.stars}
              </span>
              <blockquote className={styles.quote}>“{review.text}”</blockquote>
              <figcaption className={styles.who}>{review.who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {posts.length > 0 ? (
        <section
          className={`${sections.wide} ${styles.diary}`}
          aria-labelledby="oph-diary"
          data-editor-section="diario"
        >
          <div className={sections.header}>
            <Display as="h2" size="section" id="oph-diary">
              {home.diary.heading}
            </Display>
            <TextLink href="/diario" small>
              {home.diary.cta}
            </TextLink>
          </div>
          <div className={styles.diaryGrid}>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
