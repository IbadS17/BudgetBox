"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import { useBudgetStore } from "./lib/store/budgetStore";
import { syncBudget } from "./lib/sync";
import ServiceWorkerRegister from "./sw-register";
import LogoutButton from "./components/LogoutButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const syncStatus = useBudgetStore((s) => s.budget.syncStatus);
  const setSyncPending = useBudgetStore((s) => s.setSyncPending);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // -------- FIX: Online/Offline Detection -------- //
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);

    update(); // initial value
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedEmail = localStorage.getItem("email");
    const authed = Boolean(storedEmail);
    setIsAuthenticated(authed);
    setAuthChecked(true);

    if (!authed && !isAuthRoute) {
      router.replace("/login");
    } else if (authed && isAuthRoute) {
      router.replace("/");
    }
  }, [isAuthRoute, router, pathname]);

  const navItems = useMemo(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "Monthly Budget", href: "/budget" },
      { label: "Settings", href: "/settings" },
    ],
    []
  );

  const handleSync = async () => {
    setSyncPending();
    await syncBudget();
  };

  if (isAuthRoute) {
    return (
      <html lang="en">
        <body className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-900">
          <ServiceWorkerRegister />
          {children}
        </body>
      </html>
    );
  }

  if (!authChecked) {
    return (
      <html lang="en">
        <body className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <ServiceWorkerRegister />
          Checking session...
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <ServiceWorkerRegister />
          Redirecting to login...
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-900">
        <ServiceWorkerRegister />
        <div className="flex min-h-screen w-full bg-black/10 backdrop-blur-sm">
          {/* Sidebar */}
          <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-white/5 px-6 py-8 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">
                BudgetBox
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Control Center</h1>
              <p className="mt-2 text-sm text-white/70">
                Monitor spending, sync across devices, and stay on track.
              </p>
            </div>

            <nav className="mt-10 flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-slate-900 shadow-lg"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              {isOnline !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Connection</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isOnline
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-rose-400/20 text-rose-200"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-white/80">
                <span>Status</span>
                <span className="font-semibold text-white">{syncStatus}</span>
              </div>
              <button
                onClick={handleSync}
                className="w-full rounded-xl bg-white/90 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                Sync Now
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
              <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                      Budget snapshot
                    </p>
                    <h2 className="mt-1 text-3xl font-semibold">
                      Welcome back
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSync}
                      className="rounded-2xl bg-white/90 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
                    >
                      Sync Now
                    </button>
                    <LogoutButton />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                  {isOnline !== null && (
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isOnline ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      {isOnline ? "You are online" : "You are offline"}
                    </span>
                  )}
                  <span className="text-white/60">
                    Sync status: {syncStatus}
                  </span>
                </div>
              </header>

              <section className="rounded-3xl bg-white/95 p-6 shadow-2xl shadow-black/10">
                {children}
              </section>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
