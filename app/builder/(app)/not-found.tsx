import Link from 'next/link';

import styles from '@/components/builder/editor.module.css';

export default function NotFound() {
  return (
    <>
      <h1 className={styles.pageTitle}>Não encontrámos isto</h1>
      <p className={styles.pageIntro}>A página que procuras não existe, ou o artigo foi apagado.</p>
      <p style={{ marginTop: 18 }}>
        <Link href="/builder">Voltar ao início</Link>
      </p>
    </>
  );
}
