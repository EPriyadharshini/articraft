import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'If an account exists, reset instructions were created.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to request reset.');
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
        <h1 className="font-display text-4xl text-forest">Reset your password</h1>
        <p className="mt-3 text-slate-600">Request a password reset link for your account.</p>
        <label htmlFor="reset-email" className="sr-only">Email</label>
        <input id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-8 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
        {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button className="mt-5 w-full rounded-full bg-forest px-5 py-3 font-medium text-white">Request reset</button>
        <Link to="/login" className="mt-5 block text-center text-sm font-medium text-forest">Back to login</Link>
      </form>
    </div>
  );
}
