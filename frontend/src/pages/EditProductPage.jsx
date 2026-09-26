import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then((response) => {
        const product = response.data.data.product;
        setForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, material: product.material, dimensions: product.dimensions, tags: (product.tags || []).join(', ') });
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load product.'));
  }, [productId]);

  if (!form) return <div className="section-shell py-12 text-slate-600">{error || 'Loading product...'}</div>;

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.patch(`/products/${productId}`, { ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) });
      navigate('/sell');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update product.');
    }
  };

  return <div className="section-shell py-12"><h1 className="font-display text-5xl text-forest">Edit product</h1><form onSubmit={submit} className="mt-8 max-w-3xl space-y-5 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">{Object.keys(form).map((field) => <label key={field} className="block text-sm font-medium text-slate-700">{field[0].toUpperCase() + field.slice(1)}{field === 'description' ? <textarea rows={5} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3" /> : <input type={['price', 'stock'].includes(field) ? 'number' : 'text'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3" />}</label>)}{error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<button className="rounded-full bg-forest px-6 py-3 font-medium text-white">Save changes</button></form></div>;
}
