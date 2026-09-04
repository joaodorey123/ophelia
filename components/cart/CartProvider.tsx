'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import {
  addToCart,
  refreshCart,
  removeCartLine,
  updateCartLine,
  type CartActionResult,
} from '@/lib/cart/actions';
import type { Cart, CartLineInput } from '@/lib/commerce/types';

type AddOptions = {
  /** PDP adds open the drawer; card adds do not (handoff, Cart drawer → Toast). */
  openDrawer?: boolean;
  /** Toast copy is "<product> no cesto". */
  toastLabel?: string;
};

type CartContextValue = {
  cart: Cart | null;
  count: number;
  isOpen: boolean;
  isPending: boolean;
  error: string | null;
  toast: string | null;
  open: () => void;
  close: () => void;
  add: (lines: CartLineInput[], options?: AddOptions) => void;
  updateLine: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  dismissError: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const TOAST_MS = 2400;

export function CartProvider({
  children,
  initialCart,
}: {
  children: React.ReactNode;
  initialCart: Cart | null;
}) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Cart mutations are serialised through this promise chain. Without it,
   * hammering the + button races two `cartLinesUpdate` calls and the later
   * response can be the older quantity.
   */
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  /*
   * The layout re-renders with a fresh cart after `revalidatePath`, so adopt
   * the server's value when it changes: the server is the authority, and this
   * keeps the drawer correct after a navigation or a change in another tab.
   * Adjusting during render (rather than in an effect) avoids a second pass.
   */
  const [serverCart, setServerCart] = useState(initialCart);
  if (serverCart !== initialCart) {
    setServerCart(initialCart);
    setCart(initialCart);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const flash = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const apply = useCallback((result: CartActionResult) => {
    if (result.ok) {
      setCart(result.cart);
      setError(null);
    } else {
      setError(result.message);
      if (result.cart) setCart(result.cart);
    }
    return result.ok;
  }, []);

  const enqueue = useCallback(
    (task: () => Promise<void>) => {
      const next = queue.current.then(task, task);
      queue.current = next;
      startTransition(async () => {
        await next;
      });
    },
    [startTransition],
  );

  const add = useCallback(
    (lines: CartLineInput[], options: AddOptions = {}) => {
      enqueue(async () => {
        const result = await addToCart(lines);
        const ok = apply(result);
        if (ok) {
          if (options.toastLabel) flash(`${options.toastLabel} no cesto`);
          if (options.openDrawer) setIsOpen(true);
        }
      });
    },
    [apply, enqueue, flash],
  );

  const updateLine = useCallback(
    (lineId: string, quantity: number) => {
      // Optimistic: the stepper must feel immediate even on a slow connection.
      setCart((current) => {
        if (!current) return current;
        const lines =
          quantity <= 0
            ? current.lines.filter((line) => line.id !== lineId)
            : current.lines.map((line) => (line.id === lineId ? { ...line, quantity } : line));
        return {
          ...current,
          lines,
          totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
        };
      });

      enqueue(async () => {
        apply(await updateCartLine(lineId, quantity));
      });
    },
    [apply, enqueue],
  );

  const removeLine = useCallback(
    (lineId: string) => {
      setCart((current) => {
        if (!current) return current;
        const lines = current.lines.filter((line) => line.id !== lineId);
        return {
          ...current,
          lines,
          totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
        };
      });

      enqueue(async () => {
        apply(await removeCartLine(lineId));
      });
    },
    [apply, enqueue],
  );

  const dismissError = useCallback(() => {
    setError(null);
    enqueue(async () => {
      const fresh = await refreshCart();
      setCart(fresh);
    });
  }, [enqueue]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.totalQuantity ?? 0,
      isOpen,
      isPending,
      error,
      toast,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      updateLine,
      removeLine,
      dismissError,
    }),
    [add, cart, dismissError, error, isOpen, isPending, removeLine, toast, updateLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>.');
  return context;
}
