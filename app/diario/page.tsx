import { PostCard } from '@/components/blog/PostCard';
import { Display, Kicker } from '@/components/ui/Type';
import { diario, posts } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './diario.module.css';
import sections from '@/styles/sections.module.css';

export const metadata = pageMetadata({
  title: 'O diário',
  description: diario.lede,
  path: '/diario',
});

/**
 * The diary index.
 *
 * Deliberately uniform: no featured article, no hero, every post the same
 * card. The handoff is explicit about keeping it that way, because the client
 * edits and appends articles themselves.
 */
export default function DiarioPage() {
  return (
    <div className={`${sections.wide} ${styles.page}`}>
      <div className={styles.intro}>
        <Kicker>{diario.kicker}</Kicker>
        <Display as="h1" size="pageSm" className={styles.title}>
          {diario.titleLead}
          <span>{diario.titleEmphasis}</span>
        </Display>
        <p className={styles.lede}>{diario.lede}</p>
      </div>

      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} withExcerpt />
        ))}
      </div>
    </div>
  );
}
