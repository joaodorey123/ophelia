import Link from 'next/link';

import styles from '@/components/builder/editor.module.css';
import { SetupNotice } from '@/components/builder/SetupNotice';
import { ConfigError, getStorefrontUrl, missingConfig } from '@/lib/builder/config';
import { GitHubError, readFile } from '@/lib/builder/github';
import { asPosts, POSTS_FILE } from '@/lib/builder/posts';

import { PostList } from './PostList';

export const dynamic = 'force-dynamic';

export default async function DiaryPage() {
  let posts;
  try {
    const file = await readFile(POSTS_FILE);
    posts = asPosts(JSON.parse(file.text));
  } catch (error) {
    return (
      <>
        <h1 className={styles.pageTitle}>Diário</h1>
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

  return (
    <>
      <h1 className={styles.pageTitle}>Diário</h1>
      <p className={styles.pageIntro}>
        Os artigos aparecem no site pela ordem em que estão aqui. Os três primeiros são também os
        que aparecem na página inicial.
      </p>

      <p style={{ marginTop: 18 }}>
        <Link
          className={styles.fileButton}
          href="/builder/diario/novo"
          style={{ textDecoration: 'none' }}
        >
          Escrever artigo novo
        </Link>
      </p>

      <PostList initial={posts} storefrontUrl={getStorefrontUrl()} />
    </>
  );
}
