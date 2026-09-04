'use client';

import { useState, useTransition } from 'react';

import { getCheckoutUrl } from '@/lib/cart/actions';
import { Button } from '@/components/ui/Button';

/**
 * Hands off to Shopify's hosted checkout. Payment is never collected here.
 *
 * When Shopify is not configured the action returns a message and this button
 * shows it rather than pretending an order was placed.
 */
export function CheckoutButton({
  className,
  disabled,
  children = 'Continuar para pagamento',
}: {
  className?: string;
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
        size="lg"
        block
        className={className}
        onClick={onClick}
        disabled={disabled || isPending}
      >
        {isPending ? 'A abrir o pagamento…' : children}
      </Button>
      {message ? (
        <p role="alert" style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--oph-ink-75)' }}>
          {message}
        </p>
      ) : null}
    </>
  );
}
