import Link from 'next/link';

import { Flower } from '@/components/ui/Flower';
import { Display, Kicker } from '@/components/ui/Type';
import { WornPhoto } from '@/components/ui/WornPhoto';
import { diario, posts } from '@/lib/content';
import { postPath } from '@/lib/navigation';
import { pageMetadata } from '@/lib/seo/metadata';

import styles from './diario.module.css';

export const metadata = pageMetadata({
  title: 'O diário',
  description: diario.lede,
  path: '/diario',
});

/**
 * The diary index, set like a journal: one article after another down a
 * single centred column — a large worn print pinned with a flower, the title
 * in tracked capitals, and the excerpt beneath. Every article is treated the
 * same; there is no featured one, because the client adds them herself.
 */
export default function DiarioPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro} data-editor-section="diario-intro">
        <Flower name="cosmos" width={96} className={styles.introFlower} />
        <Kicker>{diario.kicker}</Kicker>
        <Display as="h1" size="pageSm" className={styles.title}>
          {diario.titleLead}
          <span>{diario.titleEmphasis}</span>
        </Display>
        <p className={styles.lede}>{diario.lede}</p>
      </header>

      <ol className={styles.journal} data-editor-section="diario">
        {posts.map((post, index) => (
          <li key={post.slug} className={styles.entry}>
            <Link href={postPath(post.slug)} className={styles.entryLink}>
              <WornPhoto
                src={post.image}
                alt=""
                ratio="16 / 11"
                variant={index}
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 840px"
              />
              <span className={styles.entryMeta}>
                {post.kicker} · {post.date}
              </span>
              <h2 className={styles.entryTitle}>{post.title}</h2>
              <p className={styles.entryExcerpt}>{post.excerpt}</p>
              <span className={styles.entryRead}>ler o artigo</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
