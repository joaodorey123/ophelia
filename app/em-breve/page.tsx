import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { Flower } from '@/components/ui/Flower';
import { isGateOn, safeNext } from '@/lib/coming-soon';
import { site } from '@/lib/content';

import '@/styles/tokens.css';
import styles from './em-breve.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Ophelia · em breve' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * The page every visitor sees until launch (see proxy.ts). Outside the (site)
 * group, so no header, footer or cart — just the brand and the password.
 */
export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next, erro } = await searchParams;
  const target = safeNext(next);
  if (!isGateOn()) redirect(target);

  const copy = site.comingSoon;

  return (
    <main className={styles.page}>
      <Flower name="miosotis" width={150} className={styles.flowerLeft} />
      <Flower name="esporas" width={96} className={styles.flowerRight} />

      <div className={styles.card}>
        <Image
          className={styles.logo}
          src="/brand/logo-azul.png"
          alt="Ophelia"
          width={140}
          height={98}
          priority
        />
        <span className={styles.kicker}>{copy.kicker}</span>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.text}>{copy.text}</p>

        <form className={styles.form} method="post" action="/api/em-breve">
          <input type="hidden" name="next" value={target} />
          <label className={styles.label} htmlFor="em-breve-password">
            {copy.passwordLabel}
          </label>
          <input
            id="em-breve-password"
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? 'em-breve-error' : undefined}
          />
          {erro ? (
            <p id="em-breve-error" className={styles.error} role="alert">
              {copy.error}
            </p>
          ) : null}
          <button className={styles.button} type="submit">
            {copy.cta}
          </button>
        </form>
      </div>
    </main>
  );
}
