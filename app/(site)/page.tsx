import Image from 'next/image';
import Link from 'next/link';

import { PostCard } from '@/components/blog/PostCard';
import { ProductCard } from '@/components/product/ProductCard';
import { TextLink } from '@/components/ui/Button';
import { Flower, PIN_FLOWERS } from '@/components/ui/Flower';
import { Display, Kicker } from '@/components/ui/Type';
import { WornPhoto } from '@/components/ui/WornPhoto';
import { catalogue } from '@/lib/commerce';
import type { Product } from '@/lib/commerce/types';
import { home, latestPosts, reviews, site } from '@/lib/content';
import { SHOP_INDEX } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './home.module.css';
import paper from '@/styles/paper.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'Ophelia · pastelaria, brunch e mercearia no Estoril',
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
  const favourites = await getFavourites();
  const posts = latestPosts(3);

  return (
    <div className={styles.page}>
      {/* The photograph (or film) on its own. The page still needs a title for
          search engines and screen readers, so it is kept, but only for them. */}
      <section className={styles.hero} data-editor-section="home-hero">
        <h1 className="oph-sr-only">{home.hero.title}</h1>
        {home.hero.video ? (
          <video
            className={styles.heroVideo}
            src={home.hero.video}
            poster={home.hero.image}
            autoPlay
            muted
            loop
            playsInline
            aria-label={home.hero.alt}
          />
        ) : (
          <Image
            className={styles.heroImage}
            src={home.hero.image}
            alt={home.hero.alt}
            fill
            // Taller than wide on a phone, so a cropped landscape needs more width.
            sizes="(max-width: 900px) 140vw, 100vw"
            priority
          />
        )}
      </section>

      <section
        className={styles.story}
        aria-labelledby="oph-story"
        data-editor-section="home-story"
      >
        <Flower name="miosotis" width={150} className={styles.storyFlowerLeft} />
        <Flower name="fresia" width={110} className={styles.storyFlowerRight} />
        <div className={styles.storyInner}>
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
      </section>

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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section
        className={`${sections.wide} ${styles.events}`}
        aria-labelledby="oph-events"
        data-editor-section="home-events"
      >
        <div className={styles.eventsPhoto}>
          <WornPhoto
            src={home.events.image}
            alt={home.events.alt}
            ratio="4 / 5"
            variant={1}
            sizes="(max-width: 900px) 100vw, 720px"
          />
          <Flower name="esporas" width={92} className={styles.eventsFlower} />
        </div>
        <div className={styles.eventsText}>
          <Kicker>{home.events.kicker}</Kicker>
          <Display as="h2" size="section" id="oph-events" className={styles.eventsHeading}>
            {home.events.heading}
          </Display>
          <p className={styles.eventsBody}>{home.events.body}</p>
          <Link href="/eventos" className={styles.eventsButton}>
            {home.events.cta}
          </Link>
        </div>
      </section>

      {posts.length > 0 ? (
        <div className={paper.strip}>
          <span className={paper.shadow} aria-hidden />
          <div className={paper.paper}>
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
                {posts.map((post, index) => (
                  <PostCard key={post.slug} post={post} worn variant={index} />
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      <section
        className={`${sections.wide} ${styles.reviews}`}
        aria-labelledby="oph-reviews"
        data-editor-section="reviews"
      >
        <Display as="h2" size="section" id="oph-reviews" className={styles.reviewsHeading}>
          {home.reviews.heading}
        </Display>
        <div className={styles.reviewGrid}>
          {reviews.map((review, index) => (
            <figure key={review.who} className={styles.review}>
              <Flower
                name={PIN_FLOWERS[index % PIN_FLOWERS.length] ?? 'flor-azul'}
                width={64}
                className={styles.reviewFlower}
              />
              <span className={styles.stars} aria-label="Cinco estrelas em cinco">
                {review.stars}
              </span>
              <blockquote className={styles.quote}>“{review.text}”</blockquote>
              <figcaption className={styles.who}>{review.who}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
