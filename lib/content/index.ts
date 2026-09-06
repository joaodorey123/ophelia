import aboutJson from '@/content/about.json';
import contactoJson from '@/content/contacto.json';
import diarioJson from '@/content/diario.json';
import homeJson from '@/content/home.json';
import postsJson from '@/content/posts.json';
import reviewsJson from '@/content/reviews.json';
import shopJson from '@/content/shop.json';
import siteJson from '@/content/site.json';

import type {
  AboutContent,
  ContactoContent,
  DiarioContent,
  HomeContent,
  Post,
  Review,
  ShopContent,
  SiteContent,
} from './types';

/**
 * Editorial content reads. Synchronous and cheap — the JSON is bundled at
 * build time — so callers can treat these as constants.
 *
 * The single cast per file is the type boundary: JSON has no types of its own,
 * and everything downstream is fully typed from here on.
 */

export const site = siteJson as SiteContent;
export const home = homeJson as HomeContent;
export const about = aboutJson as AboutContent;
export const contacto = contactoJson as ContactoContent;
export const diario = diarioJson as DiarioContent;
export const shop = shopJson as ShopContent;
export const reviews = reviewsJson as Review[];

/** Diary articles, newest first — the file is authored in that order. */
export const posts = postsJson as Post[];

export function getPost(slug: string): Post | null {
  return posts.find((post) => post.slug === slug) ?? null;
}

/** The three most recent articles, for the home page. */
export function latestPosts(count = 3): Post[] {
  return posts.slice(0, count);
}

export * from './types';
