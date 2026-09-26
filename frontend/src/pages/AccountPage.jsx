import { useAppContext } from '../context/AppContext';
import { formatINR } from '../utils/currency';
import { useSearchParams } from 'react-router-dom';

export default function AccountPage() {
  const { user, orders } = useAppContext();
  const [searchParams] = useSearchParams();

  if (!user) {
    return <div className="section-shell py-12 text-lg text-slate-600">Please log in to view your account.</div>;
  }

  return (
    <div className="section-shell py-12">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
        <h1 className="font-display text-5xl text-forest">My account</h1>
        {searchParams.get('order') === 'confirmed' && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Payment confirmed. Your order is now in your order history.</p>}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-stone-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Profile</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">{user.name}</h2>
            <p className="mt-2 text-slate-600">{user.email}</p>
            <p className="mt-2 text-sm text-emerald-700">Role: {user.role}</p>
          </div>
          <div className="rounded-[1.5rem] bg-stone-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Orders</p>
            <p className="mt-4 text-4xl font-bold text-forest">{orders?.length || 0}</p>
            <p className="mt-2 text-slate-600">Total purchases</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-stone-200 bg-white p-5">
          <h2 className="text-2xl font-semibold text-slate-800">Order history</h2>
          {orders?.length ? (
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <div key={order._id || order.id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-slate-700">
                  <div>
                    <div className="font-medium">#{order._id || order.id}</div>
                    <div className="text-sm text-slate-500">{new Date(order.createdAt || order.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatINR(order.total)}</div>
                    <div className="text-sm text-emerald-700">{order.sellerOrders?.map((sellerOrder) => sellerOrder.status).join(', ') || order.status || order.paymentStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-slate-500">No orders yet. Start shopping to see your history here.</div>
          )}
        </div>
      </div>
    </div>
  );
}
