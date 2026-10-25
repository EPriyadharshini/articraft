
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

const readLocal = () => {
  try {
    return JSON.parse(
      localStorage.getItem("articraft-wishlist") || "[]",
    );
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? user?._id;

  const [wishlist, setWishlist] = useState([]);
  const syncedUser = useRef("");

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setWishlist(readLocal());
      syncedUser.current = "";
      return;
    }

    if (syncedUser.current === userId) return;

    const syncWishlist = async () => {
      const localWishlist = readLocal();

      try {
        // Merge local wishlist items concurrently.
        await Promise.allSettled(
          localWishlist.map((productId) =>
            api.post(`/wishlist/${productId}`),
          ),
        );

        const response = await api.get("/wishlist");

        if (cancelled) return;

        setWishlist(
          (response.data.data.wishlist.products || []).map(
            (product) => product._id,
          ),
        );

        localStorage.removeItem("articraft-wishlist");
        syncedUser.current = userId;
      } catch (error) {
        if (!cancelled) {
          console.error("Unable to sync wishlist", error);
        }
      }
    };

    syncWishlist();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleWishlist = async (productId) => {
    if (!userId) return;

    const previousWishlist = wishlist;
    const exists = previousWishlist.includes(productId);

    // Update the wishlist UI immediately.
    setWishlist((current) =>
      exists
        ? current.filter((id) => id !== productId)
        : current.includes(productId)
          ? current
          : [...current, productId],
    );

    try {
      if (exists) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post(`/wishlist/${productId}`);
      }
    } catch (error) {
      // Restore the previous state if the API request fails.
      setWishlist(previousWishlist);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
