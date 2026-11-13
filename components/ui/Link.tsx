import NextLink from 'next/link';
import type { ComponentProps } from 'react';

import { LinkPendingSignal } from '@/components/loading/RouteLoading';
import { routeTarget } from '@/lib/route-loading';

/**
 * The storefront's link: next/link without prefetching.
 *
 * The hosting refuses more than ~20 requests in a burst from one visitor, and
 * prefetching every link on screen added 15–27 requests to each page load.
 * The pages are small and pre-rendered, so a click without prefetch is still
 * quick. Pass `prefetch` explicitly to opt a link back in.
 *
 * Links to the pages that read Shopify (shop, collections, products, search)
 * also carry a pending signal, so the destination's skeleton can stand in
 * while the server answers. See components/loading/RouteLoading.tsx.
 */
export default function Link({
  prefetch = false,
  children,
  ...props
}: ComponentProps<typeof NextLink>) {
  const href = typeof props.href === 'string' ? props.href : null;
  const signal = href !== null && routeTarget(href) !== null;

  return (
    <NextLink prefetch={prefetch} {...props}>
      {children}
      {signal ? <LinkPendingSignal href={href} /> : null}
    </NextLink>
  );
}
