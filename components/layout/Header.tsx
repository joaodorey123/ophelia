'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { PRIMARY_NAV, isActive } from '@/lib/navigation';

import styles from './Header.module.css';

/**
 * The two-row sticky header.
 *
 * Below 900px the second row is replaced by a drawer, which the handoff calls
 * out as missing from the prototype and explicitly asks production to add.
 */
export function Header({ wordmark }: { wordmark: string }) {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  /*
   * Every navigation closes the menu and the search sheet — the handoff's
   * routing rule. Adjusted during render rather than in an effect, so the
   * closed state is painted in the same pass as the new route instead of
   * flashing the old panel over it.
   */
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  // The drawer owns the screen while it is open.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    document.body.dataset.scrollLocked = 'true';
    return () => {
      delete document.body.dataset.scrollLocked;
    };
  }, [menuOpen, searchOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    burgerRef.current?.focus();
  }, []);

  // Escape closes, and Tab is trapped inside the panel while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeMenu, menuOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.row1}>
          <div className={styles.left}>
            <button
              ref={burgerRef}
              type="button"
              className={styles.burger}
              aria-expanded={menuOpen}
              aria-label="Abrir menu"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>

            <button
              type="button"
              className={`${styles.utility} ${styles.desktopOnly}`}
              onClick={() => setSearchOpen(true)}
              aria-expanded={searchOpen}
            >
              <SearchIcon />
              pesquisar
            </button>
          </div>

          <Link href="/" className={styles.brand} aria-label="Ophelia — página inicial">
            <Image
              className={styles.logo}
              src="/brand/logo-azul.png"
              alt="Ophelia"
              width={74}
              height={52}
              priority
            />
            <span className={styles.wordmark}>{wordmark}</span>
          </Link>

          <div className={styles.right}>
            <button
              type="button"
              className={`${styles.utility} ${styles.mobileOnly}`}
              onClick={() => setSearchOpen(true)}
              aria-label="Pesquisar"
            >
              <SearchIcon />
            </button>

            <Link href="/contacto" className={`${styles.utility} ${styles.desktopOnly}`}>
              contacto
            </Link>

            <button
              type="button"
              className={styles.basket}
              onClick={open}
              aria-label={`Abrir o cesto, ${count} ${count === 1 ? 'artigo' : 'artigos'}`}
            >
              <Image
                className={styles.basketIcon}
                src="/brand/icon-cesto.png"
                alt=""
                width={20}
                height={26}
              />
              <span className={styles.count} aria-hidden>
                {count}
              </span>
            </button>
          </div>
        </div>

        <div className={styles.row2}>
          <nav className={styles.nav} aria-label="Principal">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item);
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
          </nav>
        </div>
      </header>

      {menuOpen ? (
        <>
          <div className={styles.veil} onClick={closeMenu} aria-hidden />
          <div
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>menu</span>
              <button type="button" className={styles.close} onClick={closeMenu} aria-label="Fechar">
                ×
              </button>
            </div>

            <nav className={styles.panelNav} aria-label="Principal">
              {PRIMARY_NAV.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.panelLink} ${active ? styles.panelLinkActive : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className={styles.panelFoot}>
              <button
                type="button"
                className={styles.utility}
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
              >
                <SearchIcon />
                pesquisar
              </button>
              <span>info@callmeophelia.com</span>
            </div>
          </div>
        </>
      ) : null}

      {searchOpen ? <SearchOverlay onClose={() => setSearchOpen(false)} /> : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M15.8 15.8 21 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden focusable="false">
      <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
