import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(
        response.data.message ||
          "If an account exists, reset instructions were created.",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to request reset.",
      );
    }
  };

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-16 glow">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] dark:border-stone-800 dark:bg-[#0f111a] dark:shadow-[0_0_18px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
        <form onSubmit={submit} className="w-full">
          <h1 className="font-display text-4xl text-forest dark:text-slate-100">
            Reset your password
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Request a password reset link for your account.
          </p>

          <label htmlFor="reset-email" className="sr-only">
            Email
          </label>

          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-8 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-slate-900 outline-none transition-all duration-300 hover:border-blue-400 hover:shadow-[0_0_12px_rgba(59,130,246,0.18)] focus:border-blue-500 focus:shadow-[0_0_18px_rgba(59,130,246,0.3)] dark:border-stone-700 dark:bg-[#141824] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-blue-500 dark:focus:border-blue-400"
          />

          {message && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-forest px-5 py-3 font-medium text-white transition hover:bg-emerald-900 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Request reset
          </button>

          <Link
            to="/login"
            className="mt-5 block text-center text-sm font-medium text-forest hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
