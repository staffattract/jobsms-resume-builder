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

type Props = {
  counts: AnalyticsCounts;
  campaigns: AdCampaignRow[];
};

export function AnalyticsDashboardView({ counts: c, campaigns }: Props) {
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

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          All events
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Homepage visits" value={visits} />
          <StatCard label="Start Building clicks" value={startClicks} />
          <StatCard label="See Pricing clicks" value={pricingClicks} />
          <StatCard label="Download PDF clicks" value={downloadClicks} />
          <StatCard label="One-time purchases" value={oneTime} />
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
            hint="One-time + subscription successes"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Campaigns (ad_id)
        </h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500">
          Users = signups with stored <code className="text-zinc-400">ad_id</code>.
          Purchases / revenue from analytics events × list prices ($4.99 / $9.99).
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
