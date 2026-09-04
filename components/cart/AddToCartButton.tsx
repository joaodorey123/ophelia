'use client';

import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useCart } from '@/components/cart/CartProvider';
import type { CartLineAttribute } from '@/lib/commerce/types';

/**
 * Adds one merchandise line to the cart.
 *
 * `openDrawer` follows the handoff: adds from the product page open the
 * drawer, adds from a card only raise the toast.
 */
export function AddToCartButton({
  variantId,
  productTitle,
  quantity = 1,
  attributes,
  available = true,
  openDrawer = false,
  variant = 'outlineBlue',
  size = 'sm',
  className,
  children,
}: {
  variantId: string | null;
  productTitle: string;
  quantity?: number;
  attributes?: CartLineAttribute[];
  available?: boolean;
  openDrawer?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  const { add, isPending } = useCart();

  const disabled = !variantId || !available || isPending;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      aria-label={`Adicionar ${productTitle} ao cesto`}
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
      {available ? children : 'Esgotado'}
    </Button>
  );
}
