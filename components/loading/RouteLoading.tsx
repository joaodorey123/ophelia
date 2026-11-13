'use client';

import { useLinkStatus } from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from 'react';

import { routeTarget, type RouteTarget } from '@/lib/route-loading';

import { RouteSkeleton, type SkeletonCatalogue } from './RouteSkeletons';
import styles from './Skeleton.module.css';

/**
 * Route skeletons for client-side navigation.
 *
 * Why not `loading.tsx`: a loading boundary makes the server start streaming
 * before the page has decided whether it exists, so a missing product or
 * collection would answer 200 instead of a real 404. This never touches the
 * server response. It only fills the wait after a click, which is the wait a
 * visitor actually sees, since links are not prefetched on this hosting.
 *
 * The skeleton appears only if the page has not arrived within SHOW_AFTER_MS,
 * so a fast answer never flashes grey.
 */
const SHOW_AFTER_MS = 160;

type Pending = { token: number; target: RouteTarget };

/* ── Link clicks: a tiny store fed by useLinkStatus ───────────────────── */

let tokens = 0;
let linkPending: Pending | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const readLinkPending = () => linkPending;
const readNothing = () => null;

/** Re-clicking the page you are on refreshes it; that needs no skeleton. */
function isCurrentPage(href: string): boolean {
  const url = new URL(href, window.location.href);
  return url.pathname === window.location.pathname && url.search === window.location.search;
}

/**
 * Rendered inside a storefront <Link> whose destination has a skeleton.
 * Renders nothing; it only reports while its link's navigation is pending.
 * When several links are clicked in a row, Next keeps only the last one
 * pending, so the last click always wins here too.
 */
export function LinkPendingSignal({ href }: { href: string }) {
  const { pending } = useLinkStatus();

  // Layout effect: the release lands in the same commit as the new page, so
  // the skeleton and the content never share a frame.
  useLayoutEffect(() => {
    if (!pending) return;
    const target = routeTarget(href);
    if (!target || isCurrentPage(href)) return;

    const mine: Pending = { token: ++tokens, target };
    linkPending = mine;
    emit();

    return () => {
      if (linkPending === mine) {
        linkPending = null;
        emit();
      }
    };
  }, [pending, href]);

  return null;
}

/* ── Provider: link clicks + programmatic navigations ─────────────────── */

type RouteLoadingValue = {
  /** router.push, with the destination's skeleton while it loads. */
  navigate: (href: string) => void;
  shown: RouteTarget | null;
};

const RouteLoadingContext = createContext<RouteLoadingValue>({
  navigate: () => {},
  shown: null,
});

export function useRouteNavigate() {
  return useContext(RouteLoadingContext).navigate;
}

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [pushed, setPushed] = useState<Pending | null>(null);
  const fromLink = useSyncExternalStore(subscribe, readLinkPending, readNothing);
  const [readyToken, setReadyToken] = useState<number | null>(null);

  const pending = fromLink ?? (isNavigating ? pushed : null);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setReadyToken(pending.token), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  const shown = pending && readyToken === pending.token ? pending.target : null;

  const navigate = useCallback(
    (href: string) => {
      const target = routeTarget(href);
      setPushed(target && !isCurrentPage(href) ? { token: ++tokens, target } : null);
      // The transition stays pending until the new page has rendered.
      startTransition(() => router.push(href));
    },
    [router],
  );

  const value = useMemo(() => ({ navigate, shown }), [navigate, shown]);

  return <RouteLoadingContext.Provider value={value}>{children}</RouteLoadingContext.Provider>;
}

/**
 * Sits inside <main>: the current page, or the coming page's skeleton.
 * The current page is hidden, not unmounted, so an interrupted navigation
 * leaves it exactly as it was.
 */
export function RouteLoadingOutlet({
  children,
  catalogue,
}: {
  children: React.ReactNode;
  catalogue: SkeletonCatalogue;
}) {
  const { shown } = useContext(RouteLoadingContext);

  // The skeleton is the top of the next page, so start reading it from the top,
  // as Next does once the page lands.
  useLayoutEffect(() => {
    if (shown) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [shown]);

  return (
    <>
      {/* oph-route-parked is global: page rules that style <body> with :has()
          check it, so a parked page stops dressing the skeleton's document. */}
      <div className={shown ? `${styles.parked} oph-route-parked` : styles.passThrough}>
        {children}
      </div>
      {shown ? <RouteSkeleton target={shown} catalogue={catalogue} /> : null}
    </>
  );
}
