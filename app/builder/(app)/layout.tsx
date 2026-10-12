import { Nav } from '@/components/builder/Nav';
import { ShopOptionsProvider } from '@/components/builder/ShopOptions';
import styles from '@/components/builder/editor.module.css';
import { SECTIONS, THEME_SECTION } from '@/lib/builder/schema';
import { requireSession } from '@/lib/builder/session';

export const dynamic = 'force-dynamic';

/** Every screen behind this layout requires a session. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();

  const pages = SECTIONS.filter((section) =>
    ['home-hero', 'home-collections', 'home-favourites', 'home-story', 'home-sections'].includes(
      section.id,
    ),
  ).map((section) => ({
    href: `/builder/secao/${section.id}`,
    label: section.title.replace('Início — ', ''),
  }));

  const others = SECTIONS.filter(
    (section) => !section.id.startsWith('home-') && section.id !== 'reviews',
  ).map((section) => ({ href: `/builder/secao/${section.id}`, label: section.title }));

  return (
    <ShopOptionsProvider>
      <div className={styles.shell}>
        <Nav
          groups={[
            {
              title: 'Geral',
              items: [
                { href: '/builder', label: 'Mapa do site' },
                { href: '/builder/secoes', label: 'Todas as secções' },
              ],
            },
            { title: 'Página inicial', items: pages },
            {
              title: 'Diário',
              items: [{ href: '/builder/diario', label: 'Artigos' }],
            },
            {
              title: 'Outras páginas',
              items: [
                ...others,
                { href: `/builder/secao/reviews`, label: 'Opiniões' },
                { href: `/builder/secao/${THEME_SECTION.id}`, label: THEME_SECTION.title },
              ],
            },
          ]}
        />
        <main className={styles.main}>{children}</main>
      </div>
    </ShopOptionsProvider>
  );
}
