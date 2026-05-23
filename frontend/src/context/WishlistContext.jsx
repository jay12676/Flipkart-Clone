import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as wishlistApi from '../api/wishlist.js';
import { useAuth } from './AuthContext.jsx';

const initialState = { items: [], product_ids: [], count: 0 };

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const fresh = await wishlistApi.fetchWishlist();
      setData(fresh);
    } catch {
      setData(initialState);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setData(initialState);
      return;
    }
    refresh();
  }, [user, authLoading, refresh]);

  const toggle = useCallback(
    async (productId) => {
      const next = await wishlistApi.toggleWishlist(productId);
      setData(next);
      return next;
    },
    []
  );

  const productIdSet = useMemo(
    () => new Set(data.product_ids || []),
    [data.product_ids]
  );

  const value = {
    items: data.items,
    productIds: data.product_ids || [],
    count: data.count,
    loading,
    isWishlisted: (productId) => productIdSet.has(productId),
    toggle,
    refresh,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
