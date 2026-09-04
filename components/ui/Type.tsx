import type { ReactNode } from 'react';

import styles from './Type.module.css';

/** Uppercase eyebrow. Terracotta on cream/sand, cream at 70% on blue. */
export function Kicker({
  children,
  ground = 'light',
  className,
}: {
  children: ReactNode;
  ground?: 'light' | 'blue';
  className?: string;
}) {
  return (
    <span
      className={[styles.kicker, ground === 'blue' ? styles.kickerOnBlue : undefined, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

/** Small muted meta line above a card title. */
export function CardKicker({ children }: { children: ReactNode }) {
  return <span className={`${styles.kicker} ${styles.kickerMuted}`}>{children}</span>;
}

/** Form/section label: "Sabor", "Tamanho da caixa". */
export function FieldLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <span className={styles.label} id={id}>
      {children}
    </span>
  );
}

export function SectionHeader({
  kicker,
  title,
  aside,
  action,
  ground = 'light',
  titleId,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  aside?: ReactNode;
  action?: ReactNode;
  ground?: 'light' | 'blue';
  titleId?: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <div>
        {kicker ? <Kicker ground={ground}>{kicker}</Kicker> : null}
        <h2
          id={titleId}
          className={[
            styles.sectionHeadTitle,
            ground === 'blue' ? styles.sectionHeadTitleOnBlue : undefined,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </h2>
      </div>
      {aside ? <p className={styles.sectionHeadAside}>{aside}</p> : null}
      {action}
    </div>
  );
}
