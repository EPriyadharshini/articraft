import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const normalize = (item) => ({
  ...(item.product || item),
  id: item.product?._id || item.product?.id || item.id,
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

  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sync = (data) => {
    setCart((data.items || []).filter((item) => item.product).map(normalize));
  };

  // Load cart only for logged-in customers
  useEffect(() => {
    if (user?.role !== "CUSTOMER") {
      setCart([]);
      return;
    }

    setLoading(true);
    setError("");

    api
      .get("/cart")
      .then((response) => {
        sync(response.data.data.cart);
      })
      .catch((requestError) => {
        console.error("Unable to load cart", requestError);
        setError(
          requestError.response?.data?.message || "Unable to load your cart.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const addToCart = async (product) => {
    setError("");

    // Guest users cannot add to cart
    if (user?.role !== "CUSTOMER") {
      setError("Please login to add items to your cart.");
      return;
    }

    try {
      const response = await api.post("/cart/items", {
        productId: product.id || product._id,
      });

      sync(response.data.data.cart);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to add this item to your cart.";

      setError(message);
      throw requestError;
    }
  };

  const updateQuantity = async (id, quantity) => {
    setError("");

    if (user?.role !== "CUSTOMER") {
      setError("Please login to update your cart.");
      return;
    }

    try {
      const response = await api.patch(`/cart/items/${id}`, {
        quantity,
      });

      sync(response.data.data.cart);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to update your cart.";

      setError(message);
      throw requestError;
    }
  };

  const removeFromCart = async (id) => {
    setError("");

    if (user?.role !== "CUSTOMER") {
      return;
    }

    try {
      const response = await api.delete(`/cart/items/${id}`);

      sync(response.data.data.cart);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to remove this item from your cart.";

      setError(message);
      throw requestError;
    }
  };

  const clearCart = async () => {
    setError("");

    if (user?.role !== "CUSTOMER") {
      setCart([]);
      return;
    }

    try {
      await api.delete("/cart");
      setCart([]);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to clear your cart.";

      setError(message);
      throw requestError;
    }
  };

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      setCart,
    }),
    [cart, loading, error],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
