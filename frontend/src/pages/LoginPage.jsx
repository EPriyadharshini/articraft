import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAppContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
        <h1 className="font-display text-4xl text-forest">Welcome back</h1>
        <p className="mt-3 text-slate-600">Sign in to continue your handmade shopping journey.</p>
        {location.state?.sessionExpired && <div role="alert" className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Your session has expired. Please log in again.</div>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input id="login-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
          </div>
          {error && <div role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>}
          <button type="submit" className="w-full rounded-full bg-forest px-5 py-3 font-medium text-white hover:bg-emerald-900">Login</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New here? <Link to="/signup" className="font-semibold text-forest">Create an account</Link>
        </p>
        <Link to="/forgot-password" className="mt-3 block text-center text-sm font-medium text-slate-500 hover:text-forest">Forgot password?</Link>
      </div>
    </div>
  );
}
