"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("email", email);
        router.replace("/");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to sign in. Try again.");
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
          <h1 className="mt-3 text-4xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-white/70">
            Sign in to review your monthly plan and sync changes across devices.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li>• Offline editing with auto-save</li>
            <li>• Timestamp-based conflict resolution</li>
            <li>• Secure sync across devices</li>
          </ul>
        </div>

        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
          <h2 className="text-2xl font-semibold">Login</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use your demo credentials to continue.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Email address
              </label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="hire-me@anshumat.org"
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

            {error && (
              <p className="rounded-2xl bg-rose-500/10 px-4 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <a href="/register" className="font-semibold text-slate-900">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
