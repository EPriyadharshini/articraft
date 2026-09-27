import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem('articraft-wishlist') || '[]');
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const syncedUser = useRef('');

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      if (syncedUser.current === user._id) return;

      syncedUser.current = user._id;

      const syncWishlist = async () => {
        const localWishlist = readLocal();

        for (const productId of localWishlist) {
          try {
            await api.post(`/wishlist/${productId}`);
          } catch (error) {
            console.error("Unable to merge wishlist item", error);
          }
        }

        const response = await api.get("/wishlist");

        setWishlist(
          (response.data.data.wishlist.products || []).map(
            (product) => product._id,
          ),
        );

        localStorage.removeItem("articraft-wishlist");
      };

      syncWishlist().catch(console.error);
    } else {
      // Logged out → don't show wishlist items
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (productId) => {
    const exists = wishlist.includes(productId);
    if (user?.role === 'CUSTOMER') {
      if (exists) await api.delete(`/wishlist/${productId}`);
      else await api.post(`/wishlist/${productId}`);
    }
    setWishlist((items) => (exists ? items.filter((id) => id !== productId) : [...items, productId]));
  };

  const value = useMemo(() => ({ wishlist, toggleWishlist }), [wishlist, user]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
