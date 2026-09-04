import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/Button';
import { getCustomerAccountConfig } from '@/lib/commerce/config';
import { getCustomer } from '@/lib/customer/api';
import { pageMetadata } from '@/lib/seo/metadata';
import { SITE } from '@/lib/site';

import styles from './account.module.css';

/** Personal — never indexed, never cached. */
export const metadata: Metadata = pageMetadata({
  title: 'Conta',
  description: 'A tua conta Ophelia.',
  path: '/conta',
  noIndex: true,
});

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const configured = getCustomerAccountConfig() !== null;
  const customer = configured ? await getCustomer() : null;

  return (
    <section className={styles.page} aria-labelledby="account-title">
      <h1 id="account-title" className={styles.title}>
        Conta
      </h1>

      {!configured ? (
        <>
          <p className={styles.lead}>
            As contas de cliente são geridas pelo Shopify. Enquanto a ligação não estiver
            configurada, podes encomendar sem criar conta — e falar connosco directamente em{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
          <div className={styles.notice}>
            <h2 className={styles.noticeTitle}>Configuração em falta</h2>
            <p className={styles.noticeCopy}>
              Define <span className={styles.code}>SHOPIFY_CUSTOMER_ACCOUNT_API_URL</span>,{' '}
              <span className={styles.code}>SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID</span> e{' '}
              <span className={styles.code}>SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI</span> para activar
              o início de sessão. Os passos estão em <span className={styles.code}>docs/SHOPIFY.md</span>.
            </p>
          </div>
        </>
      ) : customer ? (
        <>
          <p className={styles.lead}>Olá, {customer.firstName ?? customer.displayName}.</p>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Os teus dados</h2>
            <dl className={styles.definitions}>
              <div>
                <dt>Nome</dt>
                <dd>{customer.displayName}</dd>
              </div>
              {customer.emailAddress ? (
                <div>
                  <dt>Email</dt>
                  <dd>{customer.emailAddress}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className={styles.actions}>
            <ButtonLink href="/conta/encomendas" variant="primary" size="lg">
              Ver as minhas encomendas
            </ButtonLink>
            <ButtonLink href="/conta/sair" variant="outlineBlue" size="lg" prefetch={false}>
              Terminar sessão
            </ButtonLink>
          </div>
        </>
      ) : (
        <>
          <p className={styles.lead}>
            Inicia sessão para veres as tuas encomendas. A autenticação é feita pelo Shopify — não
            guardamos a tua palavra-passe.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/conta/entrar" variant="primary" size="lg" prefetch={false}>
              Iniciar sessão
            </ButtonLink>
            <ButtonLink href="/comprar/cookies" variant="outlineBlue" size="lg">
              Continuar a comprar
            </ButtonLink>
          </div>
        </>
      )}
    </section>
  );
}
