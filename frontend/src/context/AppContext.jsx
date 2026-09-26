import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider, useCart } from './CartContext';
import { WishlistProvider, useWishlist } from './WishlistContext';

const AppContext = createContext(null);

function CombinedContext({ children }) {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (auth.user?.role !== 'CUSTOMER') {
      setOrders([]);
      return;
    }
    api.get('/orders/my-orders')
      .then((response) => setOrders(response.data.data.orders || []))
      .catch(console.error);
  }, [auth.user]);

  return <AppContext.Provider value={{ ...auth, ...cart, ...wishlist, api, orders, setOrders }}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CombinedContext>{children}</CombinedContext>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export const useAppContext = () => useContext(AppContext);
