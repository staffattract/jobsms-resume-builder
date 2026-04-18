import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsDashboardView } from "@/components/admin/AnalyticsDashboardView";
import { getAdCampaignRows } from "@/lib/analytics/campaign-dashboard";
import { getAnalyticsCounts } from "@/lib/analytics/dashboard-data";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAnalyticsAuthorized } from "@/lib/auth/admin-access";
import { adminLogoutAction } from "@/lib/auth/form-actions";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || !isAdminAnalyticsAuthorized(user.email)) {
    redirect("/admin/login");
  }

  const [counts, campaigns] = await Promise.all([
    getAnalyticsCounts(),
    getAdCampaignRows(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black font-sans text-zinc-100 antialiased">
      <header className="border-b border-zinc-800 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <span className="text-lg font-semibold tracking-tight text-white">
              Admin
            </span>
            <span className="text-xs text-zinc-500">Analytics</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="max-w-[200px] truncate text-xs text-zinc-400 sm:text-sm"
              title={user.email}
            >
              {user.email}
            </span>
            <Link
              href="/resumes"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            >
              Open app
            </Link>
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <AnalyticsDashboardView counts={counts} campaigns={campaigns} />
      </main>
    </div>
  );
}
