import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

type Variant = 'outline' | 'primary';

/**
 * `TextLink` is the handoff's underlined navigation link ("ver tudo",
 * "a nossa história"); `Button` covers the outline and solid navy shapes.
 * Anything that navigates is a Link, anything that acts is a button — the
 * handoff draws that line and so does this.
 */

export function Button({
  variant = 'outline',
  block = false,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
}) {
  const classes = [styles.base, styles[variant], block ? styles.block : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'outline',
  block = false,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const classes = [styles.base, styles[variant], block ? styles.block : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function TextLink({
  href,
  small = false,
  className,
  children,
}: {
  href: string;
  small?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const classes = [styles.link, small ? styles.linkSm : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <Link href={href} className={classes}>
      {/* The rule belongs to the text, so the link box can grow for touch
          without the underline drifting away from the words. */}
      <span className={styles.linkRule}>{children}</span>
    </Link>
  );
}
