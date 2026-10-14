'use client';

import { useEffect } from 'react';

/**
 * Starts the announcement strip moving on the visitor's first scroll, tap,
 * key or pointer move, by flagging <html data-moved>. See AnnouncementBar.
 */
export function AnnouncementMotion() {
  useEffect(() => {
    const events = ['scroll', 'pointermove', 'pointerdown', 'keydown', 'touchstart'] as const;
    const start = () => {
      document.documentElement.dataset.moved = '';
      events.forEach((name) => window.removeEventListener(name, start));
    };
    events.forEach((name) => window.addEventListener(name, start, { passive: true, once: true }));
    return () => events.forEach((name) => window.removeEventListener(name, start));
  }, []);
  return null;
}
