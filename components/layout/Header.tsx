'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { isActive, PRIMARY_NAV, UTILITY_NAV } from '@/lib/navigation';

import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname();
  const { count, open, isOpen: cartOpen } = useCart();
  const menuId = useId();
  const burgerRef = useRef<HTMLButtonElement>(null);

  /*
   * The menu is derived, not synchronised: we remember the route it was opened
   * on, so navigating away closes it, and the cart being open closes it too
   * (the two are mutually exclusive). Both behaviours come from the handoff,
   * and deriving them avoids a cascade of effect-driven re-renders.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt === pathname && !cartOpen;

  const setMenuOpen = useCallback(
    (open: boolean) => setOpenedAt(open ? pathname : null),
    [pathname],
  );

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, setMenuOpen]);

  function openCart() {
    setMenuOpen(false);
    open();
  }

  return (
    <header className={styles.header}>
      {/* Desktop */}
      <div className={styles.desktopInner}>
        <nav className={styles.nav} aria-label="Principal">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={isActive(pathname, item) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className={styles.wordmark} aria-label="Ophelia — página inicial">
          <Image
            src="/brand/logo-azul.png"
            alt="Ophelia"
            width={585}
            height={413}
            className={styles.wordmarkImage}
            priority
          />
        </Link>

        <div className={styles.utilities}>
          {UTILITY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.utilityLink}
              aria-current={isActive(pathname, item) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <button type="button" onClick={openCart} aria-label="Abrir o cesto" className={styles.cartButton}>
            <Image src="/brand/cesto.png" alt="" width={120} height={120} className={styles.cartIcon} />
            <span className={styles.cartCount} aria-hidden="true">
              {count}
            </span>
            <span className="oph-visually-hidden">{count} artigos no cesto</span>
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobileInner}>
        <button
          ref={burgerRef}
          type="button"
          className={styles.burger}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/" aria-label="Ophelia — página inicial" className={styles.mobileWordmarkLink}>
          <Image
            src="/brand/logo-azul.png"
            alt="Ophelia"
            width={585}
            height={413}
            className={styles.mobileWordmark}
            priority
          />
        </Link>

        <button type="button" onClick={openCart} aria-label="Abrir o cesto" className={styles.mobileCart}>
          <Image src="/brand/cesto.png" alt="" width={120} height={120} className={styles.mobileCartIcon} />
          <span className={styles.mobileCartCount} aria-hidden="true">
            {count}
          </span>
          <span className="oph-visually-hidden">{count} artigos no cesto</span>
        </button>
      </div>

      {menuOpen ? (
        <nav id={menuId} className={styles.menuPanel} aria-label="Menu principal">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.menuLink}
              aria-current={isActive(pathname, item) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <hr className={styles.menuRule} />
          <div className={styles.menuUtilities}>
            {UTILITY_NAV.map((item, index) => (
              <span key={item.href}>
                {index > 0 ? <span aria-hidden="true">· </span> : null}
                <Link href={item.href}>{item.label}</Link>
              </span>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
