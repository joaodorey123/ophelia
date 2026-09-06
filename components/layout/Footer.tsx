import Image from 'next/image';
import Link from 'next/link';

import { NewsletterForm } from '@/components/layout/NewsletterForm';
import { Display } from '@/components/ui/Type';
import type { Collection } from '@/lib/commerce/types';
import { site } from '@/lib/content';
import { SHOP_INDEX, collectionPath } from '@/lib/navigation';

import styles from './Footer.module.css';

/**
 * The newsletter band and footer.
 *
 * The band is hidden on routes that ask for it (the handoff hides it in
 * checkout); pass `newsletter={false}` there.
 *
 * "a loja" is built from the collections Shopify actually has, so the column
 * can never contain a link to a collection that would 404.
 */
export function Footer({
  collections,
  newsletter = true,
}: {
  collections: Collection[];
  newsletter?: boolean;
}) {
  return (
    <>
      {newsletter ? (
        <section className={styles.newsletter} aria-labelledby="oph-newsletter">
          <div className={styles.newsletterInner}>
            <span className={styles.newsletterKicker}>{site.newsletter.kicker}</span>
            <Display
              as="h2"
              size="newsletter"
              id="oph-newsletter"
              className={styles.newsletterHeading}
            >
              {site.newsletter.headingLines.map((line) => (
                <span key={line} className={styles.newsletterLine}>
                  {line}
                </span>
              ))}
            </Display>
            <NewsletterForm />
          </div>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <div className={styles.columns}>
          <div>
            <Link href="/" aria-label="Ophelia — página inicial">
              <Image
                className={styles.logo}
                src="/brand/logo-azul.png"
                alt="Ophelia"
                width={65}
                height={46}
              />
            </Link>
            <p className={styles.tagline}>{site.brand.tagline}</p>
          </div>

          <nav aria-labelledby="oph-footer-loja">
            <span className={styles.heading} id="oph-footer-loja">
              a loja
            </span>
            <div className={styles.list}>
              <Link href={SHOP_INDEX}>todos os produtos</Link>
              {collections.map((collection) => (
                <Link key={collection.handle} href={collectionPath(collection.handle)}>
                  {collection.title.toLowerCase()}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-labelledby="oph-footer-casa">
            <span className={styles.heading} id="oph-footer-casa">
              a casa
            </span>
            <div className={styles.list}>
              <Link href="/quem-somos">quem somos</Link>
              <Link href="/diario">o diário</Link>
              <Link href="/contacto">contacto</Link>
              <Link href="/contacto?assunto=Eventos e catering">eventos &amp; catering</Link>
              <Link href="/contacto?assunto=Presentes corporativos">presentes corporativos</Link>
            </div>
          </nav>

          <div>
            <span className={styles.heading}>{site.footer.helpHeading}</span>
            <div className={`${styles.list} ${styles.help}`}>
              {site.footer.help.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} {site.brand.name} ·{' '}
            <Link href="/termos-e-privacidade#termos">Termos e condições</Link> ·{' '}
            <Link href="/termos-e-privacidade#privacidade">Política de privacidade</Link>
          </p>
          <p>{site.footer.legalRight}</p>
        </div>
      </footer>
    </>
  );
}
