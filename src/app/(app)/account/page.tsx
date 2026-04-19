import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ManageBillingButton } from "@/components/account/ManageBillingButton";
import { requireUser } from "@/lib/auth/require-user";
import { loadAccountBillingForUser } from "@/lib/account/load-account-billing";

export const metadata: Metadata = {
  title: "My account — Resume builder",
  description: "Account, plan, and billing history.",
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AccountPage() {
  const user = await requireUser();

  const data = await loadAccountBillingForUser(user.id);
  if (!data) {
    redirect("/login");
  }

  const showBillingActions = Boolean(data.stripeCustomerId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Account
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          My account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Your profile, plan, and Stripe billing history.
        </p>
      </header>

      <div className="space-y-5">
        <SectionCard title="Account">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{data.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">Member since</dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                {data.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Plan">
          <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {data.planSummary}
          </p>
          <dl className="mt-4 space-y-2 border-t border-zinc-200/80 pt-4 text-sm dark:border-zinc-800">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Access level</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {data.tier === "FREE" && "Free"}
                {data.tier === "ONE_TIME" && "One-time PDF"}
                {data.tier === "SUBSCRIPTION" && "Subscription"}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Subscription active</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {data.tier === "SUBSCRIPTION"
                  ? data.subscriptionActive
                    ? "Yes"
                    : "No"
                  : "—"}
              </dd>
            </div>
            {data.subscriptionDetails ? (
              <>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Stripe status</dt>
                  <dd className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
                    {data.subscriptionDetails.status.replace(/_/g, " ")}
                  </dd>
                </div>
                {data.subscriptionDetails.currentPeriodEnd ? (
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-zinc-500 dark:text-zinc-400">Current period ends</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      {data.subscriptionDetails.currentPeriodEnd.toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </dd>
                  </div>
                ) : null}
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Cancellation</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {data.subscriptionDetails.cancelAtPeriodEnd
                      ? "Ends at period close (Stripe)"
                      : "Not scheduled"}
                  </dd>
                </div>
              </>
            ) : data.tier === "SUBSCRIPTION" && data.stripeSubscriptionId ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Subscription details could not be loaded from Stripe.
              </p>
            ) : null}
          </dl>
        </SectionCard>

        <SectionCard title="Payment history">
          {data.paymentsLoadError ? (
            <p className="text-sm text-amber-800 dark:text-amber-200/90">
              {data.paymentsLoadError}
            </p>
          ) : !data.stripeCustomerId ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No Stripe customer on file yet. After you complete checkout, invoices will
              appear here.
            </p>
          ) : data.payments.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No paid invoices found for this account yet. Some charges may appear after
              checkout completes, depending on Stripe settings.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-2.5 sm:px-4">Date</th>
                    <th className="px-3 py-2.5 sm:px-4">Amount</th>
                    <th className="px-3 py-2.5 sm:px-4">Type</th>
                    <th className="px-3 py-2.5 sm:px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {data.payments.map((row) => (
                    <tr key={row.id} className="text-zinc-800 dark:text-zinc-200">
                      <td className="whitespace-nowrap px-3 py-2.5 sm:px-4">
                        {row.date.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium sm:px-4">
                        {row.amountLabel}
                      </td>
                      <td className="px-3 py-2.5 sm:px-4">{row.typeLabel}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 capitalize sm:px-4">
                        {row.status ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Billing actions">
          {showBillingActions ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Update payment method, view receipts, or cancel your subscription in
                Stripe&apos;s secure billing portal.
              </p>
              <ManageBillingButton />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Billing management becomes available after you complete checkout (trial
              subscription or one-time PDF, when offered) so we can link a Stripe
              customer to your account.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
