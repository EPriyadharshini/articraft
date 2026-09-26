import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatINR } from '../utils/currency';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const load = async () => {
    const [statsResponse, usersResponse, productsResponse, ordersResponse] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users', { params: { limit: 8 } }),
      api.get('/products', { params: { limit: 8 } }),
      api.get('/admin/orders', { params: { limit: 8 } }),
    ]);
    setStats(statsResponse.data.data.stats);
    setUsers(usersResponse.data.data.users || []);
    setProducts(productsResponse.data.data.products || []);
    setOrders(ordersResponse.data.data.orders || []);
  };
  useEffect(() => { load().catch(console.error); }, []);
  if (!stats) return <div className="section-shell py-12 text-slate-600">Loading admin dashboard...</div>;
  const metrics = [['Total users', stats.users], ['Artists', stats.artists], ['Products', stats.products], ['Revenue', formatINR(stats.revenue)]];
  const suspend = async (user) => { await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive }); load(); };
  const remove = async (product) => { await api.delete(`/admin/products/${product.id || product._id}`); load(); };
  return <div className="section-shell py-12"><p className="text-sm uppercase tracking-[0.25em] text-slate-500">Admin panel</p><h1 className="mt-3 font-display text-5xl text-forest">Operations overview</h1><div className="mt-8 grid gap-5 md:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-soft"><div className="text-sm text-slate-500">{label}</div><div className="mt-3 text-3xl font-bold text-forest">{value}</div></div>)}</div><div className="mt-8 grid gap-8 lg:grid-cols-3"><section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft"><h2 className="text-2xl font-semibold text-slate-800">Users</h2><div className="mt-4 space-y-3">{users.map((user) => <div key={user._id} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3"><div><div className="font-medium">{user.name}</div><div className="text-xs text-slate-500">{user.email} · {user.role}</div></div><button onClick={() => suspend(user)} className="text-sm text-forest">{user.isActive ? 'Suspend' : 'Activate'}</button></div>)}</div></section><section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft"><h2 className="text-2xl font-semibold text-slate-800">Products</h2><div className="mt-4 space-y-3">{products.map((product) => <div key={product.id || product._id} className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3"><div><div className="font-medium">{product.name}</div><div className="text-xs text-slate-500">{formatINR(product.price)} · {product.stock} in stock</div></div><button onClick={() => remove(product)} className="text-sm text-rose-600">Remove</button></div>)}</div></section><section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft"><h2 className="text-2xl font-semibold text-slate-800">Orders</h2><div className="mt-4 space-y-3">{orders.map((order) => <div key={order._id} className="rounded-2xl bg-stone-50 px-4 py-3"><div className="font-medium">#{order._id}</div><div className="text-xs text-slate-500">{formatINR(order.total)} · {order.paymentStatus}</div></div>)}</div></section></div></div>;
}
