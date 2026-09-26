import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/currency';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const loadProducts = () => api.get('/products/mine')
    .then((response) => setProducts(response.data.data.products || []))
    .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load your products.'));

  useEffect(() => { loadProducts(); }, []);

  const removeProduct = async (product) => {
    if (!window.confirm(`Remove “${product.name}” from the marketplace?`)) return;
    try {
      await api.delete(`/products/${product.id || product._id}`);
      loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove this product.');
    }
  };

  return <div className="section-shell py-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.25em] text-slate-500">Artist dashboard</p><h1 className="mt-3 font-display text-5xl text-forest">My products</h1></div><Link to="/sell/products/new" className="rounded-full bg-forest px-5 py-3 font-medium text-white">Add Product</Link></div>{error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<div className="mt-8 space-y-4">{products.length ? products.map((product) => <article key={product.id || product._id} className="flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-soft md:flex-row md:items-center"><img src={product.images?.[0]} alt="" className="h-24 w-full rounded-xl object-cover md:w-32" /><div className="flex-1"><h2 className="text-xl font-semibold text-slate-800">{product.name}</h2><p className="mt-1 text-sm text-slate-500">{formatINR(product.price)} · {product.stock} in stock · {product.isActive ? 'Published' : 'Hidden'}</p></div><div className="flex gap-3"><Link to={`/sell/products/${product.id || product._id}/edit`} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium">Edit Product</Link><button onClick={() => removeProduct(product)} className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">Delete Product</button></div></article>) : <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-8 text-slate-600">You have not published any products yet.</div>}</div></div>;
}
