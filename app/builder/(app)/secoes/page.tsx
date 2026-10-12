import Link from 'next/link';

import styles from '@/components/builder/editor.module.css';
import { getStorefrontUrl } from '@/lib/builder/config';
import { SECTIONS, THEME_SECTION } from '@/lib/builder/schema';

export const dynamic = 'force-dynamic';

/**
 * Every section as a list.
 *
 * The visual map is the main way in, but not everything appears on it — the
 * announcement bar, the footer, the shipping figures — and a list is easier to
 * scan and to reach with a keyboard. Grouped by where things appear rather
 * than by which file they live in.
 */
export default function SectionsPage() {
  const storefrontUrl = getStorefrontUrl();

  const groups: { title: string; sections: typeof SECTIONS }[] = [
    {
      title: 'Página inicial',
      sections: SECTIONS.filter((section) => section.id.startsWith('home-')),
    },
    {
      title: 'Outras páginas',
      sections: SECTIONS.filter((section) =>
        ['about', 'contacto', 'shop', 'diario-intro', 'reviews'].includes(section.id),
      ),
    },
    {
      title: 'Em todas as páginas',
      sections: SECTIONS.filter((section) => ['site', 'shipping', 'product'].includes(section.id)),
    },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>Todas as secções</h1>
      <p className={styles.pageIntro}>
        Cada secção corresponde a uma parte do site.{' '}
        <Link href="/builder">Voltar ao mapa visual</Link>.
      </p>
      {storefrontUrl !== null ? (
        <a className={styles.viewLink} href={`${storefrontUrl}/`} target="_blank" rel="noreferrer">
          Abrir o site ↗
        </a>
      ) : null}

      {groups.map((group) => (
        <section key={group.title}>
          <h2 className={styles.groupHeading}>{group.title}</h2>
          <div className={styles.cards}>
            {group.sections.map((section) => (
              <Link className={styles.card} href={`/builder/secao/${section.id}`} key={section.id}>
                <span className={styles.cardTitle}>{section.title}</span>
                <span className={styles.cardText}>{section.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className={styles.groupHeading}>Diário</h2>
        <div className={styles.cards}>
          <Link className={styles.card} href="/builder/diario">
            <span className={styles.cardTitle}>Artigos</span>
            <span className={styles.cardText}>
              Escrever um artigo novo, ou mudar um que já está publicado.
            </span>
          </Link>
        </div>
      </section>

      <section>
        <h2 className={styles.groupHeading}>Aspecto</h2>
        <div className={styles.cards}>
          <Link className={styles.card} href={`/builder/secao/${THEME_SECTION.id}`}>
            <span className={styles.cardTitle}>{THEME_SECTION.title}</span>
            <span className={styles.cardText}>{THEME_SECTION.description}</span>
          </Link>
        </div>
      </section>
    </>
  );
}
