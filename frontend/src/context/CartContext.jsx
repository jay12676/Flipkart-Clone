import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import * as cartApi from '../api/cart.js';
import { useAuth } from './AuthContext.jsx';

const initialState = {
  cart: { items: [], subtotal: 0, shipping_fee: 0, total: 0, item_count: 0 },
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, loading: authLoading } = useAuth();

  const refresh = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await cartApi.fetchCart();
      dispatch({ type: 'SET_CART', payload: data });
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message });
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      dispatch({ type: 'SET_CART', payload: initialState.cart });
      return;
    }
    refresh();
  }, [user, authLoading, refresh]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const data = await cartApi.addToCart(productId, quantity);
    dispatch({ type: 'SET_CART', payload: data });
    return data;
  }, []);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    const data = await cartApi.updateCartQuantity(cartItemId, quantity);
    dispatch({ type: 'SET_CART', payload: data });
    return data;
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    const data = await cartApi.removeFromCart(cartItemId);
    dispatch({ type: 'SET_CART', payload: data });
    return data;
  }, []);

  const value = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    refresh,
    addItem,
    updateQuantity,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
