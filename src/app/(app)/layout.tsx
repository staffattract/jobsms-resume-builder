import Link from "next/link";
import { redirect } from "next/navigation";
import { AppUserMenu } from "@/components/app/AppUserMenu";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/form-actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-100/90 via-zinc-50/80 to-zinc-100/70 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 shadow-sm shadow-zinc-900/[0.03] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-none">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-5 sm:gap-10">
            <Link
              href="/resumes"
              className="shrink-0 text-lg font-semibold tracking-tight text-zinc-900 transition hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200"
            >
              Resume builder
            </Link>
            <nav
              className="flex items-center gap-0.5"
              aria-label="App navigation"
            >
              <Link
                href="/resumes"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                Resumes
              </Link>
            </nav>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 sm:gap-4">
            <AppUserMenu email={user.email} logoutAction={logoutAction} />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
