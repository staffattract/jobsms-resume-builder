import Link from "next/link";
import { AppUserMenu } from "@/components/app/AppUserMenu";
import { btnSecondary } from "@/components/resume/form-classes";
import { logoutAction } from "@/lib/auth/form-actions";

const RESUMES_DASHBOARD = "/resumes" as const;

type Props = {
  user: { email: string } | null;
};

/**
 * /build: public (logged-out) header is unchanged. Logged-in users get app-style nav,
 * Resumes + Back to dashboard → `/resumes`, and the account menu.
 */
export function BuildPageHeader({ user }: Props) {
  if (user) {
    return (
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 shadow-sm shadow-zinc-900/[0.03] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-none">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-6">
                <Link
                  href="/build"
                  className="shrink-0 text-lg font-semibold tracking-tight text-zinc-900 transition hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200"
                >
                  Resume builder
                </Link>
                <nav
                  className="flex items-center gap-0.5"
                  aria-label="App navigation"
                >
                  <Link
                    href={RESUMES_DASHBOARD}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  >
                    Resumes
                  </Link>
                </nav>
                <Link
                  href={RESUMES_DASHBOARD}
                  className={`${btnSecondary} w-fit shrink-0`}
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
            <div className="flex shrink-0 justify-end sm:justify-end">
              <AppUserMenu email={user.email} logoutAction={logoutAction} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-zinc-200/90 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          ResumeBlues
        </span>
        <a
          href="/"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Home
        </a>
      </div>
    </header>
  );
}
