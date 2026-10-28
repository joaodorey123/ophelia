import Link from '@/components/ui/Link';

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
 * The diary index, set like a journal in a zigzag: each article a worn print
 * on one side and its words on the other, the sides swapping from one article
 * to the next. On a phone they stack, print first. Every article is treated
 * the same; there is no featured one, because the client adds them herself.
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
            <Link
              href={postPath(post.slug)}
              className={`${styles.entryLink} ${index % 2 === 1 ? styles.entryFlip : ''}`}
            >
              <WornPhoto
                className={styles.entryPhoto}
                src={post.image}
                alt=""
                ratio="4 / 5"
                variant={index}
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 560px"
              />
              <span className={styles.entryText}>
                <span className={styles.entryMeta}>
                  {post.kicker} · {post.date}
                </span>
                <h2 className={styles.entryTitle}>{post.title}</h2>
                <p className={styles.entryExcerpt}>{post.excerpt}</p>
                <span className={styles.entryRead}>ler o artigo</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
