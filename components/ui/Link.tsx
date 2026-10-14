import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * The storefront's link: next/link without prefetching.
 *
 * The hosting refuses more than ~20 requests in a burst from one visitor, and
 * prefetching every link on screen added 15–27 requests to each page load.
 * The pages are small and pre-rendered, so a click without prefetch is still
 * quick. Pass `prefetch` explicitly to opt a link back in.
 */
export default function Link({ prefetch = false, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}
