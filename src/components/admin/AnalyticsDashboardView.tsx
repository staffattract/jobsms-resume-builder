"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AnalyticsFilterTab } from "@/lib/analytics/date-range";
import type { AdCampaignRow } from "@/lib/analytics/campaign-dashboard";
import type { AnalyticsCounts } from "@/lib/analytics/dashboard-data";

function pct(n: number, d: number): string {
  if (d <= 0) {
    return "—";
  }
  return `${((100 * n) / d).toFixed(1)}%`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

const presetBtnBase =
  "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-semibold transition sm:px-4";
const presetInactive =
  "border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/80";
const presetActive =
  "border-emerald-600/80 bg-emerald-950/50 text-emerald-100 ring-1 ring-emerald-600/30";

type Props = {
  counts: AnalyticsCounts;
  campaigns: AdCampaignRow[];
  activeTab: AnalyticsFilterTab;
  customFrom: string;
  customTo: string;
};

export function AnalyticsDashboardView({
  counts: c,
  campaigns,
  activeTab,
  customFrom: initialFrom,
  customTo: initialTo,
}: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    setFrom(initialFrom);
    setTo(initialTo);
  }, [initialFrom, initialTo]);

  const applyCustom = useCallback(() => {
    const a = from.trim();
    const b = to.trim();
    if (!a || !b) {
      setCustomError("Enter both a start date and an end date.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a) || !/^\d{4}-\d{2}-\d{2}$/.test(b)) {
      setCustomError("Use YYYY-MM-DD for both dates.");
      return;
    }
    if (a > b) {
      setCustomError("Start date cannot be after end date.");
      return;
    }
    setCustomError(null);
    router.push(
      `/admin/dashboard?from=${encodeURIComponent(a)}&to=${encodeURIComponent(b)}`,
    );
  }, [from, to, router]);

  const visits = c.PAGE_VIEW_HOME;
  const startClicks = c.START_BUILDING_CLICK;
  const pricingClicks = c.SEE_PRICING_CLICK;
  const downloadClicks = c.DOWNLOAD_PDF_CLICK;
  const oneTime = c.PURCHASE_ONE_TIME_SUCCESS;
  const subscription = c.PURCHASE_SUBSCRIPTION_SUCCESS;
  const paidTotal = oneTime + subscription;

  return (
    <div className="max-w-5xl">
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Internal funnel (V1). Events are stored in Postgres; purchase counts follow
          successful Stripe checkout application.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Date range
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/dashboard?preset=today"
            className={`${presetBtnBase} ${activeTab === "today" ? presetActive : presetInactive}`}
          >
            Today
          </Link>
          <Link
            href="/admin/dashboard?preset=yesterday"
            className={`${presetBtnBase} ${activeTab === "yesterday" ? presetActive : presetInactive}`}
          >
            Yesterday
          </Link>
          <Link
            href="/admin/dashboard?preset=7d"
            className={`${presetBtnBase} ${activeTab === "7d" ? presetActive : presetInactive}`}
          >
            Last 7 days
          </Link>
          <Link
            href="/admin/dashboard?preset=30d"
            className={`${presetBtnBase} ${activeTab === "30d" ? presetActive : presetInactive}`}
          >
            Last 30 days
          </Link>
          <Link
            href="/admin/dashboard?preset=90d"
            className={`${presetBtnBase} ${activeTab === "90d" ? presetActive : presetInactive}`}
          >
            Last 90 days
          </Link>
          <Link
            href="/admin/dashboard?preset=all"
            className={`${presetBtnBase} ${activeTab === "all" ? presetActive : presetInactive}`}
          >
            All time
          </Link>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-zinc-800/80 pt-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
            <label
              htmlFor="analytics-from"
              className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
            >
              Start
            </label>
            <input
              id="analytics-from"
              type="date"
              value={from}
              onChange={(e) => {
                setCustomError(null);
                setFrom(e.target.value);
              }}
              className="min-h-[2.75rem] w-full appearance-auto rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 shadow-inner scheme-dark focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-600/40"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
            <label
              htmlFor="analytics-to"
              className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
            >
              End
            </label>
            <input
              id="analytics-to"
              type="date"
              value={to}
              onChange={(e) => {
                setCustomError(null);
                setTo(e.target.value);
              }}
              className="min-h-[2.75rem] w-full appearance-auto rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 shadow-inner scheme-dark focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-600/40"
            />
          </div>
          <button
            type="button"
            onClick={() => applyCustom()}
            className={`${presetBtnBase} border-emerald-700/80 bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900/50 sm:mb-0.5`}
          >
            Apply
          </button>
        </div>
        {activeTab === "custom" ? (
          <p className="mt-2 text-[11px] text-zinc-500">
            Custom range (UTC day boundaries). Preset buttons ignore these fields until
            applied.
          </p>
        ) : null}
        {customError ? (
          <p className="mt-2 text-sm font-medium text-red-400">{customError}</p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          All events
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Homepage visits" value={visits} />
          <StatCard label="Start Building clicks" value={startClicks} />
          <StatCard label="See Pricing clicks" value={pricingClicks} />
          <StatCard label="Download PDF clicks" value={downloadClicks} />
          <StatCard label="Standalone PDF purchases" value={oneTime} />
          <StatCard label="Subscription purchases" value={subscription} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Funnel
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Visits" value={visits} />
          <StatCard label="Start clicks" value={startClicks} />
          <StatCard label="Download clicks" value={downloadClicks} />
          <StatCard
            label="Paid conversions"
            value={paidTotal}
            hint="Non-subscription + subscription purchase events"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Campaigns (ad_id)
        </h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500">
          Users = signups with stored <code className="text-zinc-400">ad_id</code> in
          the selected range. Purchases / revenue from analytics events × placeholder
          amounts (standalone PDF + $9.99 per subscription success); $1 intro trial
          charges are not modeled here.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[420px] text-left text-sm text-zinc-200">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">ad_id</th>
                <th className="px-4 py-3 text-right">Users</th>
                <th className="px-4 py-3 text-right">Purchases</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-zinc-500"
                  >
                    No campaign data yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((row) => (
                  <tr
                    key={row.adId}
                    className="border-b border-zinc-800/80 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                      {row.adId}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.users}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.purchases}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-100">
                      ${row.revenueUsd.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Conversion summary
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Start click rate"
            value={pct(startClicks, visits)}
            hint="Start Building ÷ visits"
          />
          <StatCard
            label="Download click rate"
            value={pct(downloadClicks, visits)}
            hint="Download PDF ÷ visits"
          />
          <StatCard
            label="Purchase rate"
            value={pct(paidTotal, visits)}
            hint="Successful purchases ÷ visits"
          />
        </div>
      </section>
    </div>
  );
}
