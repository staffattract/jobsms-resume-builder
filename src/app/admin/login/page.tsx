import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSignInForm } from "./admin-sign-in-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAnalyticsAuthorized } from "@/lib/auth/admin-access";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user && isAdminAnalyticsAuthorized(user.email)) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-zinc-950 font-sans text-zinc-100 antialiased">
      <header className="border-b border-zinc-800/90 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            ← Home
          </Link>
          <span className="text-sm font-semibold tracking-tight text-white">
            Admin
          </span>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Admin sign in
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Internal analytics only. Use the account configured in{" "}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
              ADMIN_ANALYTICS_EMAIL
            </code>
            .
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <AdminSignInForm />
        </div>
      </div>
    </div>
  );
}
