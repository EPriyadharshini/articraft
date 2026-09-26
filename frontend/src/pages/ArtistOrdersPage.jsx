import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatINR } from '../utils/currency';

const transitions = { Pending: ['Confirmed', 'Cancelled'], Confirmed: ['Processing', 'Cancelled'], Processing: ['Shipped', 'Cancelled'], Shipped: ['Out for Delivery', 'Cancelled'], 'Out for Delivery': ['Delivered'] };

export default function ArtistOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/orders/artist').then((response) => setOrders(response.data.data.orders || [])).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load orders.'));
  useEffect(load, []);

  const updateStatus = async (order, status) => {
    try {
      await api.patch(`/orders/artist/${order.orderId}/${order._id}/status`, { status });
      load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update order status.');
    }
  };

  return (
    <div className="section-shell py-12">
      <h1 className="font-display text-5xl text-forest">Received orders</h1>
      {error && <p className="mt-5 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="mt-8 space-y-4">
        {orders.length ? orders.map((order) => {
          const next = transitions[order.status] || [];
          return <div key={`${order.orderId}-${order._id}`} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-semibold text-slate-800">Order #{order.orderId}</div><div className="text-sm text-slate-500">{order.status} · {formatINR(order.subtotal)}</div></div><select value={order.status} onChange={(event) => updateStatus(order, event.target.value)} className="rounded-full border border-stone-300 px-3 py-2 text-sm"><option value={order.status}>{order.status}</option>{next.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
            <div className="mt-4 text-sm text-slate-600">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</div>
          </div>;
        }) : <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-8 text-slate-500">No seller orders yet.</div>}
      </div>
    </div>
  );
}
