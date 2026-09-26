import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      const session = response.data.data;
      saveSession(session);
      navigate('/account');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Reset failed.');
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
        <h1 className="font-display text-4xl text-forest">Choose a new password</h1>
        <label htmlFor="new-password" className="sr-only">New password</label>
        <input id="new-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-8 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-forest" />
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button className="mt-5 w-full rounded-full bg-forest px-5 py-3 font-medium text-white">Update password</button>
      </form>
    </div>
  );
}
