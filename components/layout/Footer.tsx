import Image from 'next/image';
import Link from 'next/link';

import { BRAND_FOOTER_NAV, SHOP_FOOTER_NAV } from '@/lib/navigation';
import { SITE } from '@/lib/site';

import styles from './Footer.module.css';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className={styles.footer} data-ground="blue">
      <div className={styles.grid}>
        <div>
          <Image
            src="/brand/logo-branco.png"
            alt="Ophelia"
            width={585}
            height={413}
            className={styles.wordmark}
          />
          <p className={styles.blurb}>
            Comida, doces e presentes feitos por uma família da Guarda. Loja no Estoril.
          </p>
        </div>

        <nav className={styles.column} aria-label="Comprar">
          <span className={styles.columnTitle}>Comprar</span>
          {SHOP_FOOTER_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.column} aria-label="Ophelia">
          <span className={styles.columnTitle}>Ophelia</span>
          {BRAND_FOOTER_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div>
          <span className={styles.columnTitle}>Newsletter</span>
          <p className={styles.newsletterCopy}>Receitas, novidades e um lugar à mesa.</p>
          <NewsletterForm />
          <address className={styles.contact}>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <br />
            <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
          </address>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>
          © {new Date().getFullYear()} {SITE.name} · Estoril, Portugal
        </span>
        <span>{SITE.tagline}</span>
      </div>
    </footer>
  );
}
