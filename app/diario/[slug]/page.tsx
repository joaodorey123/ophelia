import Link from 'next/link';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/seo/JsonLd';
import { TapedPhoto } from '@/components/ui/TapedPhoto';
import { Display } from '@/components/ui/Type';
import { getPost, posts } from '@/lib/content';
import { postPath } from '@/lib/navigation';
import { clampDescription, pageMetadata } from '@/lib/seo/metadata';
import { articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

import styles from '../diario.module.css';
import sections from '@/styles/sections.module.css';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return pageMetadata({
      title: 'Artigo não encontrado',
      description: 'Este artigo já não existe.',
      path: postPath(slug),
      noIndex: true,
    });
  }

  return pageMetadata({
    title: post.title,
    description: clampDescription(post.excerpt),
    path: postPath(post.slug),
    image: post.image,
    type: 'article',
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  /*
   * The diary is stored newest first, so the oldest article is page one —
   * and a new article simply becomes the next page of the notebook.
   */
  const pageNumber = posts.length - posts.findIndex((entry) => entry.slug === post.slug);

  return (
    <article className={styles.article}>
      <JsonLd
        data={[
          articleSchema(post),
          breadcrumbSchema([
            { name: 'O diário', path: '/diario' },
            { name: post.title, path: postPath(post.slug) },
          ]),
        ]}
      />

      <Link href="/diario" className={styles.back}>
        ← diário
      </Link>

      <div className={styles.sheetWrap}>
        <span className={styles.underSheet} aria-hidden />

        <div className={styles.sheet}>
          <span className={styles.meta}>
            {post.kicker} · {post.date}
          </span>
          <Display as="h1" size="article" className={styles.articleTitle}>
            {post.title}
          </Display>

          <div className={styles.hero}>
            <TapedPhoto
              src={post.image}
              alt=""
              ratio="16 / 11"
              pad={14}
              mountPad={8}
              mountShadow="lg"
              deckle={1}
              priority
              sizes="(max-width: 1000px) 100vw, 820px"
              tapes={[
                { type: 'striped', top: '0', left: '38%', width: 96, height: 22, rotate: -3 },
              ]}
            />
          </div>

          <p className={styles.standfirst}>{post.excerpt}</p>

          <div className={styles.body}>
            {post.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={sections.prose}>
                {paragraph}
              </p>
            ))}
          </div>

          <footer className={styles.foot}>
            <span>
              {post.kicker} · {post.date}
            </span>
            <Link href="/diario">voltar ao diário</Link>
          </footer>

          <span className={styles.pageNumber} aria-hidden>
            pág. {pageNumber}
          </span>
        </div>

        <span className={styles.dogEar} aria-hidden />
        <span className={styles.tapeLeft} aria-hidden />
        <span className={styles.tapeRight} aria-hidden />
      </div>
    </article>
  );
}
