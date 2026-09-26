import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';
import { formatINR } from '../utils/currency';

export default function EarningsPage() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/users/artists/me/stats').then((response) => setStats(response.data.data.stats)).catch(console.error); }, []);
  if (!stats) return <div className="section-shell py-12 text-slate-600">Loading earnings...</div>;
  return <div className="section-shell py-12"><h1 className="font-display text-5xl text-forest">Earnings</h1><div className="mt-8 grid gap-5 md:grid-cols-4">{[['Earnings', formatINR(stats.earnings)], ['Orders', stats.orders], ['Units sold', stats.sold], ['Products', stats.products]].map(([label, value]) => <div key={label} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-soft"><div className="text-sm text-slate-500">{label}</div><div className="mt-3 text-3xl font-bold text-forest">{value}</div></div>)}</div><div className="mt-8 h-80 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-soft"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.salesOverTime}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Bar dataKey="earnings" fill="#1f3a34" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></div>;
}
