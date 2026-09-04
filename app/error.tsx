'use client';

import { useEffect } from 'react';

import { Button, ButtonLink } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Type';
import { SITE } from '@/lib/site';

import styles from './status.module.css';

/**
 * Route-level error boundary. Shows the failure honestly, offers a retry, and
 * gives a way out — it does not pretend the page loaded.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the platform logs; the visitor never sees a stack trace.
    console.error(error);
  }, [error]);

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <Kicker>Alguma coisa correu mal</Kicker>
        <h1 className={styles.title}>Não conseguimos carregar esta página.</h1>
        <p className={styles.copy}>
          O problema é nosso, não teu. Tenta outra vez — e se continuar, escreve-nos para{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="lg" onClick={reset}>
            Tentar outra vez
          </Button>
          <ButtonLink href="/" variant="outlineBlue" size="lg">
            Voltar ao início
          </ButtonLink>
        </div>
        {error.digest ? <p className={styles.detail}>Referência: {error.digest}</p> : null}
      </div>
    </section>
  );
}
