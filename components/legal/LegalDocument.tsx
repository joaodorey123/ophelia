import { Fragment, type ReactNode } from 'react';

import type { LegalBlock } from '@/lib/legal';
import { SITE } from '@/lib/site';

import styles from '@/app/(site)/legal.module.css';

/**
 * Renders one of the client's legal texts (lib/legal.ts).
 *
 * The text is plain strings, so the email, the phone number and any web
 * address in it are turned into links here rather than marked up by hand.
 */
export function LegalDocument({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className={styles.document}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'h2':
            return (
              <h2 key={index} id={block.id} className={styles.heading}>
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className={styles.subheading}>
                {block.text}
              </h3>
            );
          case 'p':
            return (
              <p key={index} className={styles.body}>
                {linkify(block.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={index} className={styles.list}>
                {block.items.map((item, itemIndex) =>
                  typeof item === 'string' ? (
                    <li key={itemIndex}>{linkify(item)}</li>
                  ) : (
                    <li key={itemIndex}>
                      <strong>{item.lead}</strong> {linkify(item.text)}
                    </li>
                  ),
                )}
              </ul>
            );
        }
      })}
    </div>
  );
}

/* An email, a web address (with or without https://), or the shop's phone number. */
const LINKABLE = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|((?:https?:\/\/|www\.)[^\s,;)]+[^\s,;).:])|(\+351\s?\d{9})/g;

function linkify(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINKABLE)) {
    const [whole, email, url, phone] = match;
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    if (email) {
      parts.push(<a href={`mailto:${email}`}>{email}</a>);
    } else if (url) {
      const href = url.startsWith('http') ? url : `https://${url}`;
      // The shop's own address is a link home, not a new window.
      const own = /callmeophelia\.com$/.test(url);
      parts.push(
        own ? (
          <a href="/">{url}</a>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        ),
      );
    } else if (phone) {
      parts.push(<a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>);
    }
    last = start + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}
