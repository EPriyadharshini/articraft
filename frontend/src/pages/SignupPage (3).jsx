import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAppContext();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
        <h1 className="hero-heading font-display text-4xl text-forest">Create your account</h1>
        <p className="mt-3 text-slate-600">Start selling or collecting artisan goods today.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input id="signup-name" type="text" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input id="signup-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input id="signup-password" type="password" autoComplete="new-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
          </div>
          <div>
            <label htmlFor="signup-role" className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <select id="signup-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest">
              <option value="CUSTOMER">Customer</option>
              <option value="ARTIST">Artist</option>
            </select>
          </div>
          <p className="text-sm text-slate-600">By creating an account, you acknowledge the <Link to="/privacy" className="text-forest underline">Privacy Policy</Link> and <Link to="/terms" className="text-forest underline">Terms &amp; Conditions</Link>.</p>
          {error && <div role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>}
          <button type="submit" className="glow-btn w-full rounded-full bg-forest px-5 py-3 font-medium text-white hover:bg-emerald-900">
            <span className="glow-blob" />
            <span className="glow-inner block w-full text-center">Create account</span>
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already a member? <Link to="/login" className="font-semibold text-forest">Login</Link>
        </p>
      </div>
    </div>
  );
}
