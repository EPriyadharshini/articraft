import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { formatINR } from "../utils/currency";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, user, api, clearCart, setOrders } = useAppContext();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    country: "India",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="section-shell py-12 text-lg text-slate-600">
        Please log in to complete checkout.
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="section-shell py-12 text-lg text-slate-600">
        Your cart is empty. Add a few artisan pieces before checkout.
      </div>
    );
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shipping = subtotal >= 120 ? 0 : 12;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      // TEST MODE: Create the order without Razorpay payment.
      // This endpoint must support creating an unpaid order.
      const response = await api.post("/orders/checkout", {
        shippingAddress: {
          fullName: form.fullName,
          line1: form.address,
          city: form.city,
          country: form.country,
        },
        paymentMethod: "COD",
      });

      const data = response.data.data;

      // Support either a direct order response or the existing
      // checkout response containing an order object.
      const order = data.order || data;

      setOrders((current) => [
        order,
        ...current.filter((item) => item._id !== order._id),
      ]);

      await clearCart();

      navigate("/account?order=confirmed");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-shell py-12">
      <h1 className="font-display text-5xl text-forest">Checkout</h1>

      <form
        onSubmit={handlePlaceOrder}
        className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-800">
            Delivery details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="checkout-full-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <input
                id="checkout-full-name"
                required
                autoComplete="name"
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="checkout-address"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Street address
              </label>
              <input
                id="checkout-address"
                required
                autoComplete="street-address"
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-city"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                City
              </label>
              <input
                id="checkout-city"
                required
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-country"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Country
              </label>
              <input
                id="checkout-country"
                required
                autoComplete="country-name"
                value={form.country}
                onChange={(event) =>
                  setForm({ ...form, country: event.target.value })
                }
                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Razorpay integration temporarily disabled for testing.
              Restore the payment method selection and Razorpay
              checkout when you are ready to enable payments. */}

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <h3 className="font-semibold text-slate-800">Test checkout</h3>
            <p className="mt-1 text-sm text-slate-600">
              Payment is disabled temporarily. Your order will be placed without
              online payment if the backend supports unpaid orders.
            </p>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-600">
            Delivery information is recorded with your order. See the{" "}
            <Link to="/privacy" className="text-forest underline">
              Privacy Policy
            </Link>{" "}
            for current data-handling details.
          </p>
        </div>

        <aside className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-800">Your order</h2>

          <div className="mt-6 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3 text-sm text-slate-600"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatINR(tax)}</span>
            </div>

            <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-semibold text-slate-800">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 w-full rounded-full bg-forest px-5 py-3 font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
