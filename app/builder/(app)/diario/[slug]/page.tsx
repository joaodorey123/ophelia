import { notFound } from 'next/navigation';

import styles from '@/components/builder/editor.module.css';
import { SetupNotice } from '@/components/builder/SetupNotice';
import { ConfigError, getStorefrontUrl, missingConfig } from '@/lib/builder/config';
import { GitHubError, readFile } from '@/lib/builder/github';
import { asPosts, blankPost, POSTS_FILE, type Post } from '@/lib/builder/posts';

import { PostEditor } from './PostEditor';

export const dynamic = 'force-dynamic';

/** `/diario/novo` writes a new article; any other slug edits an existing one. */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === 'novo';

  let posts: Post[];
  try {
    const file = await readFile(POSTS_FILE);
    posts = asPosts(JSON.parse(file.text));
  } catch (error) {
    return (
      <>
        <h1 className={styles.pageTitle}>Artigo</h1>
        {error instanceof ConfigError ? (
          <SetupNotice missing={missingConfig()} />
        ) : (
          <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
            <strong>Não foi possível abrir os artigos.</strong>
            <br />
            {error instanceof GitHubError
              ? error.message
              : 'Algo correu mal a ler o conteúdo. Tenta recarregar a página.'}
          </div>
        )}
      </>
    );
  }

  const post = isNew ? blankPost() : posts.find((entry) => entry.slug === slug);
  if (!post) notFound();

  return (
    <PostEditor post={post} allPosts={posts} isNew={isNew} storefrontUrl={getStorefrontUrl()} />
  );
}
