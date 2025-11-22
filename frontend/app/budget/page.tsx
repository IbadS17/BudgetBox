"use client";

import { useMemo } from "react";
import { useBudgetStore } from "../lib/store/budgetStore";
import { Budget } from "../lib/store/budgetStore";

const fields: { key: keyof Budget; label: string; hint: string }[] = [
  { key: "income", label: "Income", hint: "Total monthly take-home" },
  { key: "bills", label: "Monthly Bills", hint: "Rent, utilities, insurance" },
  { key: "food", label: "Food", hint: "Groceries + dining" },
  { key: "transport", label: "Transport", hint: "Fuel, rides, passes" },
  { key: "subs", label: "Subscriptions", hint: "Streaming & recurring" },
  { key: "misc", label: "Miscellaneous", hint: "Everything else" },
];

export default function BudgetPage() {
  const budget = useBudgetStore((s) => s.budget);
  const updateField = useBudgetStore((s) => s.updateField);

  const totalExpenses =
    budget.bills + budget.food + budget.transport + budget.subs + budget.misc;
  const remaining = budget.income - totalExpenses;

  const timestampFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        dateStyle: "short",
        timeStyle: "medium",
        hour12: false,
        timeZone: "UTC",
      }),
    []
  );

  const formattedUpdatedAt = useMemo(
    () => timestampFormatter.format(new Date(budget.updatedAt)),
    [budget.updatedAt, timestampFormatter]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
          Planner
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Monthly budget controls
        </h1>
        <p className="text-sm text-slate-500">
          Update the categories below. Values are saved locally and synced when
          you are online.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: "Planned income",
            value: budget.income,
            accent: "text-emerald-600",
          },
          {
            label: "Total expenses",
            value: totalExpenses,
            accent: "text-rose-600",
          },
          {
            label: remaining >= 0 ? "Available to save" : "Over budget",
            value: remaining,
            accent: remaining >= 0 ? "text-indigo-600" : "text-rose-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${stat.accent}`}>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(stat.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Category inputs
          </h2>
          <p className="text-sm text-slate-500">
            Precision inputs with numeric keyboards and quick hints.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label
              key={field.key}
              className="group flex flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-slate-200 hover:bg-white"
            >
              <span className="text-sm font-medium text-slate-700">
                {field.label}
              </span>
              <span className="text-xs text-slate-500">{field.hint}</span>
              <input
                type="number"
                inputMode="decimal"
                className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                value={(budget as any)[field.key]}
                onChange={(e) => updateField(field.key, Number(e.target.value))}
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            Sync status:{" "}
            <span className="font-semibold">{budget.syncStatus}</span>
          </span>
          <span>Updated at: {formattedUpdatedAt}</span>
        </div>
      </div>
    </div>
  );
}
