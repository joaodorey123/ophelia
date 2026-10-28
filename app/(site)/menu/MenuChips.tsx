'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Pixels per second: slow enough to read as a hint, not as motion to follow. */
const SPEED = 14;
/** How long the bar rests at each end before turning round. */
const REST_MS = 2200;
/** Wait for the page to settle before moving anything. */
const START_DELAY_MS = 1500;

/**
 * The menu's row of section links, drifting very slowly sideways so it is
 * clear there are more categories than fit on screen.
 *
 * It only moves when the row actually overflows, never with reduced motion,
 * and stops for good the moment the visitor touches, scrolls, hovers or tabs
 * into it: from then on the row is theirs.
 */
export function MenuChips({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = ref.current;
    if (!row || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let timer = 0;
    let stopped = false;
    let direction = 1;
    let position = row.scrollLeft;
    let last = 0;

    const step = (now: number) => {
      if (stopped) return;
      const max = row.scrollWidth - row.clientWidth;
      if (max <= 1) {
        // Everything fits: check again later in case the window narrows.
        timer = window.setTimeout(() => (frame = requestAnimationFrame(step)), 1000);
        return;
      }
      const elapsed = last ? Math.min(now - last, 100) : 0;
      last = now;
      position += (direction * SPEED * elapsed) / 1000;
      // Turn round only at the end it is heading for.
      if ((direction > 0 && position >= max) || (direction < 0 && position <= 0)) {
        position = Math.max(0, Math.min(position, max));
        row.scrollLeft = position;
        direction = -direction;
        last = 0;
        timer = window.setTimeout(() => (frame = requestAnimationFrame(step)), REST_MS);
        return;
      }
      row.scrollLeft = position;
      frame = requestAnimationFrame(step);
    };

    const events = ['pointerdown', 'pointerenter', 'wheel', 'touchstart', 'focusin', 'keydown'] as const;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      events.forEach((name) => row.removeEventListener(name, stop));
    };
    events.forEach((name) => row.addEventListener(name, stop, { passive: true }));

    timer = window.setTimeout(() => (frame = requestAnimationFrame(step)), START_DELAY_MS);
    return stop;
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
