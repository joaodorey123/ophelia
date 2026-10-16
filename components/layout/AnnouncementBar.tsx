import { site } from '@/lib/content';

import { AnnouncementMotion } from './AnnouncementMotion';
import styles from './AnnouncementBar.module.css';

/**
 * The infinite announcement marquee.
 *
 * Duplicating the strip is what makes the -50% translate seamless, so the
 * second copy is aria-hidden: a screen reader reads the three messages once.
 */
export function AnnouncementBar() {
  const { enabled } = site.announcement;
  // A message left blank in the builder would show as an empty gap.
  const messages = site.announcement.messages.map((message) => message.trim()).filter(Boolean);
  if (!enabled || messages.length === 0) return null;

  return (
    <div className={styles.bar}>
      <AnnouncementMotion />
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
