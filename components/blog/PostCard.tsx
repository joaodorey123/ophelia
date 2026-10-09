import Image from 'next/image';
import Link from 'next/link';

import { WornPhoto } from '@/components/ui/WornPhoto';
import type { Post } from '@/lib/content';
import { postPath } from '@/lib/navigation';

import styles from './PostCard.module.css';

/**
 * One diary card. The index and the home page use the same card — the handoff
 * is explicit that the diary is deliberately uniform, with no featured article.
 * `withExcerpt` is the only difference: the index shows one, the home page does
 * not.
 */
export function PostCard({
  post,
  withExcerpt = false,
  worn = false,
  variant = 0,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
}: {
  post: Post;
  withExcerpt?: boolean;
  /** Show the photo as a worn, taped print — the diary's own look. */
  worn?: boolean;
  /** Which worn variant; pass the card's index so neighbours differ. */
  variant?: number;
  sizes?: string;
}) {
  return (
    <Link href={postPath(post.slug)} className={styles.card}>
      {worn ? (
        <WornPhoto
          className={styles.wornMedia}
          src={post.image}
          alt=""
          ratio="16 / 11"
          sizes={sizes}
          variant={variant}
        />
      ) : (
        <div className={styles.media}>
          <Image className={styles.image} src={post.image} alt="" fill sizes={sizes} />
        </div>
      )}
      <span className={styles.meta}>
        {post.kicker} · {post.date}
      </span>
      <span className={withExcerpt ? styles.titleLarge : styles.title}>{post.title}</span>
      {withExcerpt ? (
        <>
          <p className={styles.excerpt}>{post.excerpt}</p>
          <span className={styles.read}>ler</span>
        </>
      ) : null}
    </Link>
  );
}
