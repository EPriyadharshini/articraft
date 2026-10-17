import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/currency';

export default function SellerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/users/artists/me/stats').then((response) => response.data?.data?.stats),
      api.get('/users/artists/me').then((response) => response.data?.data?.artist).catch(() => null),
    ])
      .then(([loadedStats, loadedArtist]) => {
        if (loadedStats) setStats(loadedStats);
        if (loadedArtist) setArtist(loadedArtist);
      })
      .catch(console.error);
  }, []);

  if (!stats) return <div className="section-shell py-12 text-slate-600 dark:text-slate-400">Loading seller dashboard...</div>;

  const cards = [
    ['Orders received', stats.orders],
    ['Total earnings', formatINR(stats.earnings)],
    ['Active listings', stats.products],
    ['Units sold', stats.sold],
  ];

  return (
    <div className="section-shell py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-blue-400">Artist dashboard</p>
          <h1 className="mt-3 font-display text-5xl text-forest dark:text-slate-100">Seller overview</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {artist?.id && (
            <Link
              to={`/artist/${artist.id}`}
              className="rounded-full border border-forest bg-forest/10 px-4 py-2 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white dark:border-blue-500/50 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white"
            >
              View Public Profile
            </Link>
          )}
          <Link
            to="/sell/products/new"
            className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Add Product
          </Link>
          <Link
            to="/sell/products"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-[#0f111a] dark:text-slate-200"
          >
            My Products
          </Link>
          <Link
            to="/sell/orders"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-[#0f111a] dark:text-slate-200"
          >
            View Orders
          </Link>
          <Link
            to="/sell/earnings"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-[#0f111a] dark:text-slate-200"
          >
            View Earnings
          </Link>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-soft dark:border-stone-800 dark:bg-[#0f111a]">
            <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-3 text-3xl font-bold text-forest dark:text-blue-400">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
