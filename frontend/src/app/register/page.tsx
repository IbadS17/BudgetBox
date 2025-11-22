"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Account created! Redirecting to login.");
        setTimeout(() => router.replace("/login"), 1500);
      } else {
        setError(data.error || "Email exists or error occurred");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to register. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-4 py-12 lg:flex-row lg:items-stretch">
        <div className="w-full max-w-md rounded-3xl bg-white/5 p-8 text-white shadow-2xl ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            BudgetBox
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Create your wallet</h1>
          <p className="mt-2 text-sm text-white/70">
            Register to save personalized budgets, sync with the cloud, and
            resume seamlessly across devices.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li>• Real-time dashboards</li>
            <li>• Device sync with conflict resolution</li>
            <li>• Offline editing with automatic retries</li>
          </ul>
        </div>

        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
          <h2 className="text-2xl font-semibold">Create account</h2>
          <p className="mt-1 text-sm text-slate-500">
            It only takes a minute to get started.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Email address
              </label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Confirm password
              </label>
              <input
                type="password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-rose-500/10 px-4 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-slate-900">
              Sign in instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
