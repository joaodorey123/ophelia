'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { getCheckoutUrl } from '@/lib/cart/actions';

/**
 * Hands off to Shopify's hosted checkout. Payment is never collected here.
 *
 * When Shopify is not configured the action returns a message and this button
 * shows it rather than pretending an order was placed.
 */
export function CheckoutButton({
  className,
  errorClassName,
  disabled,
  children = 'finalizar encomenda',
}: {
  className?: string;
  errorClassName?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await getCheckoutUrl();
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setMessage(result.message);
      }
    });
  }

  return (
    <>
      <Button
        variant="primary"
        block
        className={className}
        onClick={onClick}
        disabled={disabled || isPending}
      >
        {isPending ? 'a abrir o pagamento…' : children}
      </Button>
      {message ? (
        <p role="alert" className={errorClassName}>
          {message}
        </p>
      ) : null}
    </>
  );
}
