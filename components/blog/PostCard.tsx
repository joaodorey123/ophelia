import Image from 'next/image';
import Link from '@/components/ui/Link';

import type { Post } from '@/lib/content';
import { postPath } from '@/lib/navigation';

import styles from './PostCard.module.css';

/**
 * One diary card: a clean, upright photograph with its words underneath.
 * The handoff is explicit that the diary is deliberately uniform, with no
 * featured article. `withExcerpt` is the only difference between uses.
 */
export function PostCard({
  post,
  withExcerpt = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
}: {
  post: Post;
  withExcerpt?: boolean;
  sizes?: string;
}) {
  return (
    <Link href={postPath(post.slug)} className={styles.card}>
      <div className={styles.media}>
        <Image className={styles.image} src={post.image} alt="" fill sizes={sizes} />
      </div>
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
