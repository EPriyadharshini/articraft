import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { formatINR } from "../utils/currency";

export default function MyOrders() {
  const { api } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders/my-orders");

        if (active) {
          setOrders(response.data.data.orders || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your orders. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [api]);

  const getOrderStatus = (order) => {
    const statuses = [
      ...new Set(
        (order.sellerOrders || [])
          .map((sellerOrder) => sellerOrder.status)
          .filter(Boolean),
      ),
    ];

    return statuses.length ? statuses.join(", ") : "Pending";
  };

  return (
    <div className="section-shell min-h-screen py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
            Your purchases
          </p>
          <h1 className="mt-2 font-display text-4xl text-forest sm:text-5xl">
            My Orders
          </h1>
          <p className="mt-3 text-slate-600">
            View your orders and track their latest status.
          </p>
        </div>

        <Link
          to="/explore"
          className="rounded-full bg-forest px-5 py-3 font-medium text-white transition hover:bg-emerald-900"
        >
          Continue shopping
        </Link>
      </div>

      {loading && (
        <div className="py-20 text-center text-slate-600">
          Loading your orders...
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700"
        >
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-10 rounded-[2rem] border border-stone-200 bg-white px-6 py-16 text-center shadow-soft">
          <div className="text-5xl">🛍️</div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-800">
            No orders yet
          </h2>
          <p className="mt-3 text-slate-600">
            Your handmade treasures will appear here after you place an order.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-full bg-forest px-6 py-3 font-medium text-white hover:bg-emerald-900"
          >
            Explore products
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="mt-10 space-y-6">
          <p className="text-sm text-slate-500">
            {orders.length} {orders.length === 1 ? "order" : "orders"} found
          </p>

          {orders.map((order) => (
            <section
              key={order._id}
              className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-stone-50 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Order ID
                  </p>
                  <p className="mt-1 break-all font-semibold text-slate-800">
                    #{order._id}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date unavailable"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                    {getOrderStatus(order)}
                  </span>

                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800">
                    Payment: {order.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {(order.items || []).map((item, index) => (
                  <div
                    key={item._id || item.product || index}
                    className="flex items-center gap-4"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded-2xl border border-stone-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 text-2xl">
                        🎨
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatINR(item.price)} each
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold text-slate-800">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 px-6 py-5">
                <div>
                  <p className="text-sm text-slate-500">Order total</p>
                  <p className="mt-1 text-2xl font-bold text-forest">
                    {formatINR(order.total)}
                  </p>
                </div>

                <div className="text-right text-sm text-slate-500">
                  <p>Ship to: {order.shippingAddress?.fullName}</p>
                  <p className="mt-1">
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.country}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
