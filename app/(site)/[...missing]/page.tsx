import { notFound } from 'next/navigation';

/**
 * Any URL nothing else matches. Raising notFound() here, inside the (site)
 * group, renders the storefront's 404 within the shop's chrome; the root
 * not-found sits outside every layout and would show it bare.
 */
export default function Missing() {
  notFound();
}
