import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/currency';

export default function SellerDashboardPage() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/users/artists/me/stats').then((response) => setStats(response.data.data.stats)).catch(console.error); }, []);
  if (!stats) return <div className="section-shell py-12 text-slate-600">Loading seller dashboard...</div>;
  const cards = [['Orders received', stats.orders], ['Total earnings', formatINR(stats.earnings)], ['Active listings', stats.products], ['Units sold', stats.sold]];
  return <div className="section-shell py-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.25em] text-slate-500">Artist dashboard</p><h1 className="mt-3 font-display text-5xl text-forest">Seller overview</h1></div><div className="flex flex-wrap gap-3"><Link to="/sell/products/new" className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white">Add Product</Link><Link to="/sell/products" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700">My Products</Link><Link to="/sell/orders" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700">View Orders</Link><Link to="/sell/earnings" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700">View Earnings</Link></div></div><div className="mt-8 grid gap-5 md:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-soft"><div className="text-sm text-slate-500">{label}</div><div className="mt-3 text-3xl font-bold text-forest">{value}</div></div>)}</div></div>;
}
