'use client';

import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/Button';
import type { CartLineAttribute } from '@/lib/commerce/types';

/**
 * Adds one merchandise line to the cart.
 *
 * The handoff has every add raise the toast, and card and detail adds also
 * open the drawer — so `openDrawer` defaults to true and callers opt out.
 */
export function AddToCartButton({
  variantId,
  productTitle,
  quantity = 1,
  attributes,
  available = true,
  openDrawer = true,
  variant = 'outline',
  block = false,
  className,
  children,
}: {
  variantId: string | null;
  productTitle: string;
  quantity?: number;
  attributes?: CartLineAttribute[];
  available?: boolean;
  openDrawer?: boolean;
  variant?: 'outline' | 'primary';
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { add, isPending } = useCart();
  const disabled = !variantId || !available || isPending;

  return (
    <Button
      variant={variant}
      block={block}
      className={className}
      disabled={disabled}
      aria-label={`Juntar ${productTitle} ao cesto`}
      onClick={() => {
        if (!variantId) return;
        add(
          [
            {
              merchandiseId: variantId,
              quantity,
              ...(attributes && attributes.length > 0 ? { attributes } : {}),
            },
          ],
          { openDrawer, toastLabel: productTitle },
        );
      }}
    >
      {available ? children : 'esgotado'}
    </Button>
  );
}
