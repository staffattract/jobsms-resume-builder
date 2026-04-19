import Link from "next/link";

const linkClass =
  "font-medium text-zinc-500 transition hover:text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-zinc-900 bg-zinc-950/50">
      <div className="mx-auto max-w-5xl px-4 py-5 text-center text-xs text-zinc-600 sm:px-6 sm:py-6">
        <nav
          className="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          aria-label="Legal"
        >
          <Link href="/terms" className={linkClass}>
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
        </nav>
        <p className="mb-2 text-zinc-500">
          Contact:{" "}
          <a
            href="mailto:support@resumeblues.com"
            className="font-medium text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition hover:text-zinc-300 hover:decoration-zinc-500"
          >
            support@resumeblues.com
          </a>
        </p>
        <p>© {year} ResumeBlues</p>
      </div>
    </footer>
  );
}
