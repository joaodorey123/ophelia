'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ShopOption = { handle: string; title: string; image: string | null };

type ShopState = {
  loading: boolean;
  connected: boolean;
  reachable: boolean;
  products: ShopOption[];
  collections: ShopOption[];
};

const initial: ShopState = {
  loading: true,
  connected: false,
  reachable: false,
  products: [],
  collections: [],
};

const ShopContext = createContext<ShopState>(initial);

/**
 * The shop's products and categories, fetched once and shared by every picker.
 *
 * When the shop is not connected the pickers degrade to a plain text field —
 * the editor stays usable, it just cannot offer a list to choose from.
 */
export function ShopOptionsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ShopState>(initial);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/builder/loja')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Omit<ShopState, 'loading'> | null) => {
        if (cancelled) return;
        setState({
          loading: false,
          connected: data?.connected ?? false,
          reachable: data?.reachable ?? false,
          products: data?.products ?? [],
          collections: data?.collections ?? [],
        });
      })
      .catch(() => {
        if (!cancelled) setState({ ...initial, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <ShopContext.Provider value={state}>{children}</ShopContext.Provider>;
}

export function useShopOptions(): ShopState {
  return useContext(ShopContext);
}
