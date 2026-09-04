import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'cream' | 'outlineBlue' | 'outlineCream' | 'link';
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

const SIZE_CLASS: Record<ButtonSize, string> = {
  xl: styles.sizeXl as string,
  lg: styles.sizeLg as string,
  md: styles.sizeMd as string,
  sm: styles.sizeSm as string,
  xs: styles.sizeXs as string,
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.primary as string,
  cream: styles.cream as string,
  outlineBlue: styles.outlineBlue as string,
  outlineCream: styles.outlineCream as string,
  link: styles.link as string,
};

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  grow?: boolean;
  className?: string;
};

export function buttonClassName({
  variant = 'primary',
  size = 'lg',
  block,
  grow,
  className,
}: StyleProps): string {
  return [
    variant === 'link' ? undefined : styles.base,
    variant === 'link' ? undefined : SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    block ? styles.block : undefined,
    grow ? styles.grow : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant,
  size,
  block,
  grow,
  className,
  children,
  ...props
}: StyleProps & ComponentProps<'button'> & { children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={buttonClassName({ variant, size, block, grow, className })}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  grow,
  className,
  children,
  ...props
}: StyleProps & ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link {...props} className={buttonClassName({ variant, size, block, grow, className })}>
      {children}
    </Link>
  );
}
