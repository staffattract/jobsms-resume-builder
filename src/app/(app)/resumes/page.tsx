import Link from "next/link";
import { ResumeRelativeUpdated } from "@/components/resumes/ResumeRelativeUpdated";
import { UploadResumeButton } from "@/components/resumes/UploadResumeButton";
import { listResumesForCurrentUser } from "@/lib/resume/queries";
import { createResume } from "@/lib/resume/actions";

function statusLabel(status: string) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

export default async function ResumesPage() {
  const resumes = await listResumesForCurrentUser();

  return (
    <div className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-b from-zinc-100/90 to-zinc-50/80 px-4 py-8 dark:from-zinc-950 dark:to-zinc-950 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-200/80 pb-8 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your resumes
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Create tailored versions for different roles, then export when you are
            ready to apply.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-start">
          <form action={createResume} className="w-full sm:w-auto">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-zinc-900/15 transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none dark:hover:bg-white sm:w-auto"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              New resume
            </button>
          </form>
          <UploadResumeButton />
        </div>
      </header>

      {resumes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-zinc-500 dark:text-zinc-400"
              aria-hidden
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No resumes yet
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Start with a blank document and build step by step — contact info,
            experience, and a summary that fits your next role.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <form action={createResume} className="sm:flex-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Create your first resume
              </button>
            </form>
            <div className="sm:flex-1">
              <UploadResumeButton />
            </div>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {resumes.map((r) => (
            <li key={r.id}>
              <Link
                href={`/resumes/${r.id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-100">
                      {r.title?.trim() || "Untitled resume"}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "ARCHIVED"
                          ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-zinc-400"
                        aria-hidden
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <ResumeRelativeUpdated
                        updatedAtIso={r.updatedAt.toISOString()}
                      />
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
