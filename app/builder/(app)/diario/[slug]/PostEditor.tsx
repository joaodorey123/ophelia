'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import styles from '@/components/builder/editor.module.css';
import { FieldControl, StagingProvider, type StagedImage } from '@/components/builder/Fields';
import { PublishBar } from '@/components/builder/PublishBar';
import { usePublish } from '@/components/builder/usePublish';
import { isEqual } from '@/lib/builder/paths';
import { POSTS_FILE, slugify, validatePost, type Post } from '@/lib/builder/posts';
import { POST_FIELDS } from '@/lib/builder/schema';

/**
 * Writing or changing one article.
 *
 * A new article is inserted at the top, because the storefront reads the file
 * newest-first and that is almost always where a new piece belongs; the list
 * screen can move it afterwards.
 */
export function PostEditor({
  post: initialPost,
  allPosts,
  isNew,
  storefrontUrl,
}: {
  post: Post;
  allPosts: Post[];
  isNew: boolean;
  storefrontUrl: string | null;
}) {
  const router = useRouter();
  const [post, setPost] = useState<Post>(initialPost);
  const [staged, setStaged] = useState<Record<string, StagedImage>>({});
  const [showErrors, setShowErrors] = useState(false);
  const { state, publish, reset } = usePublish();

  const dirty = useMemo(
    () => isNew || !isEqual(post, initialPost) || Object.keys(staged).length > 0,
    [isNew, post, initialPost, staged],
  );

  const others = useMemo(
    () => allPosts.filter((entry) => entry.slug !== initialPost.slug),
    [allPosts, initialPost.slug],
  );

  const errors = useMemo(() => validatePost(post, others), [post, others]);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const stage = useCallback((src: string, image: StagedImage) => {
    setStaged((current) => ({ ...current, [src]: image }));
  }, []);

  const stagingValue = useMemo(
    () => ({ staged, stage, storefrontUrl }),
    [staged, stage, storefrontUrl],
  );

  function onChange(next: unknown) {
    const updated = next as Post;
    // The address follows the title until someone edits it themselves, so a
    // new article never needs it filled in by hand.
    if (isNew && updated.title !== post.title && post.slug === slugify(post.title)) {
      updated.slug = slugify(updated.title);
    }
    setPost(updated);
  }

  async function onPublish() {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }

    const next = isNew
      ? [post, ...allPosts]
      : allPosts.map((entry) => (entry.slug === initialPost.slug ? post : entry));

    const images = Object.values(staged).map((image) => ({
      path: image.path,
      base64: image.base64,
    }));

    const ok = await publish(
      { [POSTS_FILE]: next },
      isNew ? `Novo artigo: ${post.title}` : `Actualizar artigo: ${post.title}`,
      images,
    );

    if (ok) {
      setStaged({});
      // A new article now lives at its own address; stay in step with it so a
      // second publish edits rather than duplicates.
      if (isNew || post.slug !== initialPost.slug) {
        router.replace(`/builder/diario/${encodeURIComponent(post.slug)}`);
      }
      router.refresh();
    }
  }

  return (
    <StagingProvider value={stagingValue}>
      <h1 className={styles.pageTitle}>{isNew ? 'Artigo novo' : post.title || 'Artigo'}</h1>
      {!isNew && storefrontUrl !== null ? (
        <a
          className={styles.viewLink}
          href={`${storefrontUrl}/diario/${initialPost.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver no site ↗
        </a>
      ) : null}

      {showErrors && hasErrors ? (
        <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
          <strong>Falta preencher alguma coisa antes de publicar:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.fields}>
        {POST_FIELDS.map((field) => (
          <div key={field.path}>
            <FieldControl field={field} document={post} onChange={onChange} />
            {showErrors && errors[field.path] ? (
              <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors[field.path]}</span>
            ) : null}
          </div>
        ))}
      </div>

      <PublishBar
        state={state}
        dirty={dirty}
        idleMessage={
          isNew ? 'Este artigo ainda não está publicado.' : 'Tens alterações por publicar.'
        }
        onPublish={onPublish}
        onDiscard={
          isNew
            ? undefined
            : () => {
                if (!window.confirm('Descartar as alterações?')) return;
                setPost(initialPost);
                setStaged({});
                setShowErrors(false);
                reset();
              }
        }
        viewUrl={storefrontUrl !== null ? `${storefrontUrl}/diario/${post.slug}` : null}
      />
    </StagingProvider>
  );
}
