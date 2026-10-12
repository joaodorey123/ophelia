import { notFound } from 'next/navigation';

import { Editor } from '@/components/builder/Editor';
import styles from '@/components/builder/editor.module.css';
import { SetupNotice } from '@/components/builder/SetupNotice';
import { ConfigError, getStorefrontUrl, missingConfig } from '@/lib/builder/config';
import { GitHubError, readFile } from '@/lib/builder/github';
import { findSection } from '@/lib/builder/schema';

export const dynamic = 'force-dynamic';

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = findSection(id);
  if (!section) notFound();

  let document: unknown;
  try {
    const file = await readFile(section.file);
    document = JSON.parse(file.text) as unknown;
  } catch (error) {
    return (
      <>
        <h1 className={styles.pageTitle}>{section.title}</h1>
        {error instanceof ConfigError ? (
          <SetupNotice missing={missingConfig()} />
        ) : (
          <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
            <strong>Não foi possível abrir esta secção.</strong>
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
    <Editor
      title={section.title}
      description={section.description}
      fields={section.fields}
      initial={document}
      file={section.file}
      storefrontUrl={getStorefrontUrl()}
      {...(section.previewPath ? { previewPath: section.previewPath } : {})}
      commitMessage={`Actualizar ${section.title.toLowerCase()}`}
    />
  );
}
