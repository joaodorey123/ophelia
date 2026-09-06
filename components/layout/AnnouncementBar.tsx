import { site } from '@/lib/content';

import styles from './AnnouncementBar.module.css';

/**
 * The infinite announcement marquee.
 *
 * Duplicating the strip is what makes the -50% translate seamless, so the
 * second copy is aria-hidden: a screen reader reads the three messages once.
 */
export function AnnouncementBar() {
  const { enabled, messages } = site.announcement;
  if (!enabled || messages.length === 0) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        <div className={styles.half}>
          {messages.map((message) => (
            <span key={message} className={styles.message}>
              {message}
            </span>
          ))}
        </div>
        <div className={styles.half} aria-hidden>
          {messages.map((message) => (
            <span key={message} className={styles.message}>
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
