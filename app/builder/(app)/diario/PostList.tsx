'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import styles from '@/components/builder/editor.module.css';
import { PublishBar } from '@/components/builder/PublishBar';
import { usePublish } from '@/components/builder/usePublish';
import { isEqual } from '@/lib/builder/paths';
import { POSTS_FILE, type Post } from '@/lib/builder/posts';

/**
 * The list of articles.
 *
 * Order matters — the storefront shows the first three on the home page — so
 * it is arranged by hand here rather than sorted, and the three that appear on
 * the home page are marked so nobody has to remember the rule.
 */
export function PostList({
  initial,
  storefrontUrl,
}: {
  initial: Post[];
  storefrontUrl: string | null;
}) {
  const [posts, setPosts] = useState<Post[]>(initial);
  const { state, publish, reset } = usePublish();

  const dirty = useMemo(() => !isEqual(posts, initial), [posts, initial]);

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= posts.length) return;
    const next = [...posts];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item as Post);
    setPosts(next);
  }

  function remove(index: number) {
    const post = posts[index];
    if (!post) return;
    if (!window.confirm(`Apagar “${post.title}”? Isto não se pode desfazer daqui.`)) return;
    setPosts(posts.filter((_, position) => position !== index));
  }

  return (
    <>
      <div className={styles.group} style={{ marginTop: 28 }}>
        {posts.map((post, index) => (
          <div className={styles.groupItem} key={post.slug || index}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {post.image && storefrontUrl !== null ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${storefrontUrl}${post.image}`}
                  alt=""
                  style={{
                    width: 92,
                    aspectRatio: '16 / 11',
                    objectFit: 'cover',
                    borderRadius: 3,
                    flex: 'none',
                    background: 'var(--beige)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 92,
                    aspectRatio: '16 / 11',
                    background: 'var(--beige)',
                    borderRadius: 3,
                    flex: 'none',
                  }}
                  aria-hidden
                />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/builder/diario/${encodeURIComponent(post.slug)}`}
                  style={{ fontSize: 15, fontWeight: 500, textDecoration: 'none' }}
                >
                  {post.title || 'Sem título'}
                </Link>
                <p className={styles.cardText}>
                  {post.kicker} · {post.date}
                  {index < 3 ? ' · aparece na página inicial' : ''}
                </p>
              </div>

              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Mover ${post.title} para cima`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => move(index, 1)}
                  disabled={index === posts.length - 1}
                  aria-label={`Mover ${post.title} para baixo`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                  onClick={() => remove(index)}
                  aria-label={`Apagar ${post.title}`}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 ? (
          <p className={styles.groupItem} style={{ color: 'var(--muted)' }}>
            Ainda não há artigos.
          </p>
        ) : null}
      </div>

      <PublishBar
        state={state}
        dirty={dirty}
        idleMessage="Mudaste a ordem ou apagaste artigos."
        onPublish={() => publish({ [POSTS_FILE]: posts }, 'Actualizar a lista do diário')}
        onDiscard={() => {
          setPosts(initial);
          reset();
        }}
        viewUrl={storefrontUrl !== null ? `${storefrontUrl}/diario` : null}
      />
    </>
  );
}
