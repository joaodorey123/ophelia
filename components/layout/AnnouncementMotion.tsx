'use client';

import { useEffect } from 'react';

/** How long after the page has loaded the strip starts on its own. */
const SETTLE_MS = 1500;

/**
 * Starts the announcement strip moving, by flagging <html data-moved>, once
 * the page has loaded and settled, or sooner on the visitor's first scroll,
 * tap, key or pointer move. See AnnouncementBar.
 */
export function AnnouncementMotion() {
  useEffect(() => {
    const events = ['scroll', 'pointermove', 'pointerdown', 'keydown', 'touchstart'] as const;
    let timer: number | undefined;
    const stop = () => {
      events.forEach((name) => window.removeEventListener(name, start));
      window.removeEventListener('load', schedule);
      window.clearTimeout(timer);
    };
    function start() {
      document.documentElement.dataset.moved = '';
      stop();
    }
    function schedule() {
      timer = window.setTimeout(start, SETTLE_MS);
    }

    events.forEach((name) => window.addEventListener(name, start, { passive: true, once: true }));
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return stop;
  }, []);
  return null;
}
