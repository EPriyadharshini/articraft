import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReviewsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/products/mine').then((response) => setProducts(response.data.data.products || [])).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load your product reviews.')); }, []);
  return <div className="section-shell py-12"><h1 className="font-display text-5xl text-forest">Customer reviews</h1>{error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<div className="mt-8 grid gap-4 md:grid-cols-2">{products.length ? products.map((product) => <div key={product.id || product._id} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-soft"><div className="font-semibold text-slate-800">{product.name}</div><div className="mt-2 text-amber-600">★ {product.rating || 0}</div><div className="mt-1 text-sm text-slate-500">{product.reviewCount || 0} reviews</div></div>) : !error && <p className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-8 text-slate-600">You have not published any products yet.</p>}</div></div>;
}
