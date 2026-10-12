'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import styles from './editor.module.css';

export type NavItem = { href: string; label: string };

export function Nav({ groups }: { groups: { title: string; items: NavItem[] }[] }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/builder/session', { method: 'DELETE' });
    router.replace('/builder/entrar');
    router.refresh();
  }

  return (
    <nav className={styles.sidebar} aria-label="Secções">
      <Link className={styles.brand} href="/builder">
        Ophelia
      </Link>

      {groups.map((group) => (
        <div className={styles.navGroup} key={group.title}>
          <span className={styles.navTitle}>{group.title}</span>
          {group.items.map((item) => {
            const active =
              item.href === '/builder' ? pathname === '/builder' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}

      <div className={styles.sidebarFoot}>
        <button type="button" className={styles.signOut} onClick={signOut}>
          Terminar sessão
        </button>
      </div>
    </nav>
  );
}
