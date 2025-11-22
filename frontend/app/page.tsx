"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useBudgetStore } from "./lib/store/budgetStore";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const budget = useBudgetStore((s) => s.budget);

  const totalExpenses =
    budget.bills + budget.food + budget.transport + budget.subs + budget.misc;

  const burnRate = budget.income > 0 ? totalExpenses / budget.income : 0;

  const savings = budget.income - totalExpenses;

  const today = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  const monthEndPrediction = Math.round((totalExpenses / today) * daysInMonth);

  const categories = [
    {
      key: "bills",
      label: "Bills",
      barClass: "bg-sky-500/20",
      chartColor: "rgba(56, 189, 248, 0.85)",
      borderColor: "rgba(56, 189, 248, 1)",
    },
    {
      key: "food",
      label: "Food",
      barClass: "bg-emerald-500/20",
      chartColor: "rgba(52, 211, 153, 0.85)",
      borderColor: "rgba(52, 211, 153, 1)",
    },
    {
      key: "transport",
      label: "Transport",
      barClass: "bg-purple-500/20",
      chartColor: "rgba(196, 181, 253, 0.9)",
      borderColor: "rgba(167, 139, 250, 1)",
    },
    {
      key: "subs",
      label: "Subscriptions",
      barClass: "bg-amber-500/20",
      chartColor: "rgba(251, 191, 36, 0.85)",
      borderColor: "rgba(251, 191, 36, 1)",
    },
    {
      key: "misc",
      label: "Misc",
      barClass: "bg-rose-500/20",
      chartColor: "rgba(244, 114, 182, 0.85)",
      borderColor: "rgba(244, 114, 182, 1)",
    },
  ] as const;

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const categoryThresholds: {
    key: (typeof categories)[number]["key"];
    label: string;
    limit: number;
  }[] = [
    { key: "food", label: "Food", limit: 0.4 },
    { key: "subs", label: "Subscriptions", limit: 0.3 },
    { key: "transport", label: "Transport", limit: 0.35 },
    { key: "misc", label: "Miscellaneous", limit: 0.25 },
  ];

  const pieData = {
    labels: categories.map((category) => category.label),
    datasets: [
      {
        data: categories.map((category) => (budget as any)[category.key]),
        backgroundColor: categories.map((category) => category.chartColor),
        borderColor: categories.map((category) => category.borderColor),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const warnings: string[] = [];

  if (budget.income <= 0) {
    warnings.push("Set your monthly income to unlock percentage insights.");
  } else {
    categoryThresholds.forEach(({ key, label, limit }) => {
      const value = (budget as any)[key];
      const ratio = value / budget.income;
      if (ratio >= limit) {
        warnings.push(
          `${label} are ${(ratio * 100).toFixed(
            0
          )}% of your income — try to keep it under ${(limit * 100).toFixed(
            0
          )}%.`
        );
      }
    });

    if (burnRate > 1) {
      warnings.push(
        `Your expenses exceed income by ${currency.format(
          totalExpenses - budget.income
        )} — rebalance the plan.`
      );
    } else if (burnRate >= 0.9) {
      warnings.push(
        "Burn rate is above 90% of income — consider trimming discretionary spend."
      );
    }
  }

  if (savings < 0)
    warnings.push(
      "Expenses currently exceed income — adjust categories to get back on track."
    );

  const suggestions: string[] = [];

  if (budget.income > 0) {
    if (budget.food > budget.income * 0.4)
      suggestions.push("Reduce food spend next month.");

    if (budget.subs > budget.income * 0.3)
      suggestions.push("Consider cancelling unused apps.");

    if (budget.transport > budget.income * 0.35)
      suggestions.push("Look for cheaper commuting options.");
  }

  if (savings < 0) suggestions.push("Your expenses exceed income.");

  if (suggestions.length === 0)
    suggestions.push("All categories look healthy — keep it up!");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Monthly performance snapshot
          </h1>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-700">
            Burn rate {(burnRate * 100).toFixed(0)}%
          </span>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-white">
            {currency.format(totalExpenses)} spent
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: "Total Expenses",
            value: currency.format(totalExpenses),
            tone: "from-rose-500 via-rose-400 to-rose-500",
            detail: `${(
              (totalExpenses / Math.max(budget.income, 1)) *
              100
            ).toFixed(0)}% of income`,
          },
          {
            title: "Savings Potential",
            value: currency.format(Math.max(savings, 0)),
            tone: "from-emerald-500 via-emerald-400 to-emerald-500",
            detail: savings >= 0 ? "Healthy cushion" : "Over budget",
          },
          {
            title: "Month-End Forecast",
            value: currency.format(monthEndPrediction),
            tone: "from-indigo-500 via-indigo-400 to-indigo-500",
            detail: `Day ${today} of ${daysInMonth}`,
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`rounded-3xl bg-linear-to-br ${card.tone} p-px shadow-lg`}
          >
            <div className="rounded-3xl bg-white px-6 py-5">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Category breakdown
            </h3>
            <span className="text-sm text-slate-500">
              Live vs planned spending
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <Pie data={pieData} />
            </div>
            <div className="flex-1 space-y-4">
              {categories.map((category) => (
                <div key={category.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">
                      {category.label}
                    </span>
                    <span className="text-slate-500">
                      {currency.format((budget as any)[category.key])}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${category.barClass}`}
                      style={{
                        width: `${
                          budget.income
                            ? Math.min(
                                ((budget as any)[category.key] /
                                  budget.income) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Warnings</h3>
            <ul className="mt-4 space-y-3">
              {warnings.length === 0 && (
                <li className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                  No anomalies detected.
                </li>
              )}
              {warnings.map((w, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700"
                >
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Suggestions
            </h3>
            <ul className="mt-4 space-y-3">
              {suggestions.map((suggestion, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-blue-500/10 px-4 py-3 text-sm text-blue-700"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              Insights
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              {savings >= 0 ? "On track ✅" : "Action needed ⚠"}
            </h3>
            <p className="mt-2 text-sm text-white/70">
              {savings >= 0
                ? "Great job keeping expenses below income. Consider routing the surplus into savings."
                : "Your expenses exceed income. Adjust discretionary categories to get back on plan."}
            </p>
            <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Forecast savings</span>
                <span className="font-semibold">
                  {currency.format(Math.max(savings, 0))}
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${Math.min(Math.max(burnRate * 100, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
