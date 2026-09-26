import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('articraft-cart') || '[]');
  } catch {
    return [];
  }
};

const normalize = (item) => ({
  ...(item.product || item),
  id: item.product?._id || item.product?.id || item.id,
  images: (item.product?.images || item.images || []).map((image) => (typeof image === 'string' ? image : image.url)),
  artist: item.product?.artist?.user?.name || item.product?.artist?.name || item.artist || '',
  quantity: item.quantity || 1,
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(readLocal);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const syncedUser = useRef('');

  const sync = (data) => setCart((data.items || []).filter((item) => item.product).map(normalize));

  useEffect(() => {
    if (user?.role !== 'CUSTOMER') {
      localStorage.setItem('articraft-cart', JSON.stringify(cart));
      return;
    }
    if (syncedUser.current === user._id) return;
    syncedUser.current = user._id;
    setLoading(true);
    const anonymousItems = readLocal();
    const mergeAnonymousCart = async () => {
      for (const item of anonymousItems) {
        try {
          await api.post('/cart/items', { productId: item.id || item._id, quantity: item.quantity });
        } catch (error) {
          console.error('Unable to merge cart item', error);
        }
      }
    };
    mergeAnonymousCart()
      .then(() => api.get('/cart'))
      .then((response) => {
        sync(response.data.data.cart);
        localStorage.removeItem('articraft-cart');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const addToCart = async (product) => {
    setError('');
    if (user?.role === 'CUSTOMER') {
      try {
        const response = await api.post('/cart/items', { productId: product.id || product._id });
        sync(response.data.data.cart);
        return;
      } catch (requestError) {
        const message = requestError.response?.data?.message || 'Unable to add this item to your cart.';
        setError(message);
        throw requestError;
      }
    }
    setCart((items) => {
      const id = product.id || product._id;
      const found = items.find((item) => item.id === id);
      if (found && Number.isFinite(product.stock) && found.quantity >= product.stock) {
        setError(`Only ${product.stock} item(s) are available`);
        return items;
      }
      return found ? items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)) : [...items, { ...product, id, quantity: 1 }];
    });
  };

  const updateQuantity = async (id, quantity) => {
    setError('');
    if (user?.role === 'CUSTOMER') {
      try {
        const response = await api.patch(`/cart/items/${id}`, { quantity });
        sync(response.data.data.cart);
        return;
      } catch (requestError) {
        const message = requestError.response?.data?.message || 'Unable to update your cart.';
        setError(message);
        throw requestError;
      }
    }
    setCart((items) => items.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeFromCart = async (id) => {
    setError('');
    if (user?.role === 'CUSTOMER') {
      try {
        const response = await api.delete(`/cart/items/${id}`);
        sync(response.data.data.cart);
        return;
      } catch (requestError) {
        const message = requestError.response?.data?.message || 'Unable to remove this item from your cart.';
        setError(message);
        throw requestError;
      }
    }
    setCart((items) => items.filter((item) => item.id !== id));
  };

  const clearCart = async () => {
    if (user?.role === 'CUSTOMER') await api.delete('/cart');
    setCart([]);
  };

  const value = useMemo(() => ({ cart, loading, error, addToCart, updateQuantity, removeFromCart, clearCart, setCart }), [cart, loading, error, user]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
