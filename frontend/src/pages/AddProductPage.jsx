import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../services/api';

const initial = { name: '', description: '', price: '', stock: '', category: '', material: '', dimensions: '', tags: '' };

export default function AddProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/products/categories').then((response) => setCategories(response.data.data.records || [])).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load categories.'));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      files.forEach((file) => data.append('images', file));
      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/sell');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-shell py-12">
      <h1 className="font-display text-5xl text-forest">Add a product</h1>
      <form onSubmit={submit} className="mt-8 max-w-3xl space-y-5 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
        <div className="grid gap-5 md:grid-cols-2">
          {['name', 'price', 'stock', 'material', 'dimensions'].map((field) => (
            <label key={field} className="text-sm font-medium text-slate-700">
              {field[0].toUpperCase() + field.slice(1)}
              <input required={['name', 'price', 'stock', 'material'].includes(field)} type={['price', 'stock'].includes(field) ? 'number' : 'text'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
            </label>
          ))}
          <label className="text-sm font-medium text-slate-700">Category
            <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest">
              <option value="">Choose category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">Description
          <textarea required minLength={10} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Tags
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="handmade, home, gift" className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Images (up to 6, JPG/PNG/WEBP, 5MB each)
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))} className="mt-2 block w-full text-sm" />
        </label>
        <p className="text-sm leading-6 text-slate-600">Product images are uploaded for marketplace listings. See the <Link to="/privacy" className="text-forest underline">Privacy Policy</Link> for current data-handling details.</p>
        {files.length > 0 && <div className="grid grid-cols-3 gap-3">{files.map((file) => <div key={file.name} className="rounded-xl bg-stone-100 p-3 text-xs text-slate-600">{file.name}</div>)}</div>}
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button disabled={saving} className="rounded-full bg-forest px-6 py-3 font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Publish product'}</button>
      </form>
    </div>
  );
}
