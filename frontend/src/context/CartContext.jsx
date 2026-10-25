
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const normalize = (item) => ({
  ...(item.product || item),
  id:
    item.product?._id ||
    item.product?.id ||
    item.id ||
    item._id,
  images: (item.product?.images || item.images || []).map((image) =>
    typeof image === "string" ? image : image.url,
  ),
  artist:
    item.product?.artist?.user?.name ||
    item.product?.artist?.name ||
    item.artist ||
    "",
  quantity: item.quantity || 1,
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? user?._id;

  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sync = (data) => {
    setCart(
      (data?.items || [])
        .filter((item) => item.product)
        .map(normalize),
    );
  };

  // Load the cart when the logged-in customer changes.
  useEffect(() => {
    if (!userId) {
      setCart([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");

    api
      .get("/cart")
      .then((response) => {
        if (!cancelled) {
          sync(response.data.data.cart);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          console.error("Unable to load cart", requestError);
          setError(
            requestError.response?.data?.message ||
              "Unable to load your cart.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addToCart = async (product) => {
    setError("");

    if (!userId) {
      window.location.href = "/login";
      return;
    }

    const productId = product.id || product._id;
    const previousCart = cart;

    // Show the item in the UI immediately.
    setCart((current) => {
      const existing = current.find(
        (item) => String(item.id) === String(productId),
      );

      if (existing) {
        return current.map((item) =>
          String(item.id) === String(productId)
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        normalize({ ...product, id: productId, quantity: 1 }),
      ];
    });

    try {
      const response = await api.post("/cart/items", {
        productId,
      });

      sync(response.data.data.cart);
    } catch (requestError) {
      setCart(previousCart);

      const message =
        requestError.response?.data?.message ||
        "Unable to add this item to your cart.";

      setError(message);
      throw requestError;
    }
  };

  // The quantity argument is the NEW quantity, not a delta.
  const updateQuantity = async (id, quantity) => {
    setError("");

    if (!userId) {
      const requestError = new Error("Please login to update your cart.");
      setError(requestError.message);
      throw requestError;
    }

    const previousCart = cart;

    // Update quantity and totals immediately.
    setCart((current) =>
      current.map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantity }
          : item,
      ),
    );

    try {
      const response = await api.patch(`/cart/items/${id}`, {
        quantity,
      });

      sync(response.data.data.cart);
    } catch (requestError) {
      setCart(previousCart);

      setError(
        requestError.response?.data?.message ||
          "Unable to update your cart.",
      );
      throw requestError;
    }
  };

  const removeFromCart = async (id) => {
    setError("");

    if (!userId) return;

    const previousCart = cart;

    // Remove the item immediately.
    setCart((current) =>
      current.filter((item) => String(item.id) !== String(id)),
    );

    try {
      const response = await api.delete(`/cart/items/${id}`);
      sync(response.data.data.cart);
    } catch (requestError) {
      setCart(previousCart);

      setError(
        requestError.response?.data?.message ||
          "Unable to remove this item from your cart.",
      );
      throw requestError;
    }
  };

  const clearCart = async () => {
    setError("");

    if (!userId) {
      setCart([]);
      return;
    }

    const previousCart = cart;

    // Clear the UI immediately.
    setCart([]);

    try {
      await api.delete("/cart");
    } catch (requestError) {
      setCart(previousCart);

      setError(
        requestError.response?.data?.message ||
          "Unable to clear your cart.",
      );
      throw requestError;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
