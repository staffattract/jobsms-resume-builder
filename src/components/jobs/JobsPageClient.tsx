"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JobInteractionStatus } from "@/generated/prisma/client";
import { updateResumeContent } from "@/lib/resume/actions";
import type { TailorResult } from "@/lib/ai/actions";
import type { ResumeContent } from "@/lib/resume/types";
import { descriptionFromListing } from "@/lib/jobs/job-description-from-listing";
import { mergeTailorIntoContent } from "@/lib/jobs/tailor-merge";
import type {
  JobsSearchMeta,
  JobListing,
} from "@/lib/jobs/employment-alert-types";
import { isAllowedEmploymentAlertJobUrl } from "@/lib/jobs/job-listing-url";
import { TailorJobModal } from "@/components/resume/TailorJobModal";
import { PdfPaywallModal } from "@/components/resume/PdfPaywallModal";
import {
  btnPrimary,
  btnSecondary,
  labelClass,
} from "@/components/resume/form-classes";

const JOBS_TAILOR_FLOW_V1 = "jobs_tailor_flow_v1";

type TailorFlowBanner = {
  resumeId: string;
  resumeTitle: string;
  job: JobListing;
};

function readTailorBannerFromBrowser(): TailorFlowBanner | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(JOBS_TAILOR_FLOW_V1);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      sessionStorage.removeItem(JOBS_TAILOR_FLOW_V1);
      return null;
    }
    const o = parsed as Partial<TailorFlowBanner>;
    const job = o.job;
    if (
      typeof o.resumeId !== "string" ||
      typeof o.resumeTitle !== "string" ||
      !job ||
      typeof job !== "object" ||
      typeof (job as JobListing).externalJobId !== "string" ||
      typeof (job as JobListing).url !== "string" ||
      !isAllowedEmploymentAlertJobUrl((job as JobListing).url)
    ) {
      sessionStorage.removeItem(JOBS_TAILOR_FLOW_V1);
      return null;
    }
    return {
      resumeId: o.resumeId,
      resumeTitle: o.resumeTitle,
      job: job as JobListing,
    };
  } catch {
    sessionStorage.removeItem(JOBS_TAILOR_FLOW_V1);
    return null;
  }
}

function persistTailorBanner(payload: TailorFlowBanner | null) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (!payload) {
      sessionStorage.removeItem(JOBS_TAILOR_FLOW_V1);
    } else {
      sessionStorage.setItem(JOBS_TAILOR_FLOW_V1, JSON.stringify(payload));
    }
  } catch {
    // ignore quota
  }
}

type InteractionDto = {
  id: string;
  status: JobInteractionStatus;
  clickedAt: string | null;
};

type SearchJobRow = {
  listing: JobListing;
  interaction: InteractionDto | null;
};

type ResumeOption = {
  id: string;
  title: string;
  content: ResumeContent;
};

function formatListingPlace(job: JobListing): string {
  return [job.location, job.state, job.country]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

function snapshotFromListing(
  job: JobListing,
  kw: string,
  loc: string,
): Record<string, string | undefined> {
  const place = formatListingPlace(job);
  return {
    externalJobId: job.externalJobId,
    title: job.title,
    company: job.company.trim() || undefined,
    location: place || undefined,
    jobUrl: job.url,
    keyword: kw,
    searchedLocation: loc,
  };
}

const statusChoices: JobInteractionStatus[] = [
  "NONE",
  "SAVED",
  "APPLIED",
  "IGNORED",
];

function interactionFromResponse(
  data: InteractionDto | null | undefined,
): InteractionDto | null {
  if (!data?.id) {
    return null;
  }
  return {
    id: data.id,
    status: data.status,
    clickedAt: data.clickedAt ?? null,
  };
}

export function JobsPageClient({
  resumes,
  initialKeyword,
  initialLocation,
}: {
  resumes: ResumeOption[];
  initialKeyword?: string;
  initialLocation?: string;
}) {
  const [documents, setDocuments] = useState(() => resumes);
  const defaultResumeId = documents[0]?.id ?? "";

  const [keyword, setKeyword] = useState(initialKeyword ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<SearchJobRow[]>([]);
  const [meta, setMeta] = useState<JobsSearchMeta | null>(null);
  const [lastQuery, setLastQuery] = useState<{
    keyword: string;
    location: string;
  } | null>(null);

  const [resumeId, setResumeId] = useState(defaultResumeId);
  const resume = useMemo(
    () => documents.find((r) => r.id === resumeId),
    [documents, resumeId],
  );
  const tailorFlowJobRef = useRef<JobListing | null>(null);

  const [tailorBanner, setTailorBannerState] = useState<TailorFlowBanner | null>(
    () => readTailorBannerFromBrowser(),
  );

  const setTailorBanner = useCallback((next: TailorFlowBanner | null) => {
    setTailorBannerState(next);
    persistTailorBanner(next);
  }, []);

  const [tailorOpen, setTailorOpen] = useState(false);
  const [tailorJob, setTailorJob] = useState<JobListing | null>(null);

  const [pdfPaywallOpen, setPdfPaywallOpen] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [tailorBannerPdfMessage, setTailorBannerPdfMessage] = useState<
    string | null
  >(null);

  const fetchEntitlements = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/me/entitlements", {
        credentials: "include",
      });
      if (!res.ok) {
        return false;
      }
      const data = (await res.json()) as { canDownloadPdf?: boolean };
      return !!data.canDownloadPdf;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!pdfPaywallOpen) {
      void fetchEntitlements();
    }
  }, [pdfPaywallOpen, fetchEntitlements]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const kw = keyword.trim();
    const loc = location.trim();
    if (!kw || !loc) {
      setError("Keyword and location are required.");
      return;
    }

    setBusy(true);
    try {
      const url = `/api/jobs/search?keyword=${encodeURIComponent(kw)}&location=${encodeURIComponent(loc)}&start=0&limit=25`;
      const res = await fetch(url, { credentials: "include" });
      const data = (await res.json()) as unknown;
      if (!res.ok) {
        throw new Error("Search failed.");
      }

      const body = data as {
        jobs?: SearchJobRow[];
        meta?: JobsSearchMeta;
      };
      const nextRows = Array.isArray(body.jobs) ? body.jobs : [];

      const normalized = nextRows
        .map((r): SearchJobRow | null =>
          r && r.listing && r.listing.externalJobId ? r : null,
        )
        .filter(Boolean) as SearchJobRow[];

      setRows(normalized);
      setMeta(body.meta ?? {});
      setLastQuery({ keyword: kw, location: loc });
    } catch (caught) {
      setRows([]);
      setMeta(null);
      setError(
        caught instanceof Error ? caught.message : "Could not load jobs.",
      );
    } finally {
      setBusy(false);
    }
  };

  const updateRowInteraction = useCallback((jobId: string, next: InteractionDto) => {
    setRows((prev) =>
      prev.map((row) =>
        row.listing.externalJobId === jobId
          ? { ...row, interaction: next }
          : row,
      ),
    );
  }, []);

  const postSnapshot = async (
    path: "click" | "status",
    extra: Record<string, unknown>,
  ) => {
    const res = await fetch(`/api/jobs/${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(extra),
    });
    const data = (await res.json()) as {
      interaction?: InteractionDto | null;
      error?: unknown;
    };
    if (!res.ok) {
      throw new Error("Could not sync with the server.");
    }
    const inter = interactionFromResponse(data.interaction);
    if (!inter || !extra.externalJobId) {
      return;
    }
    updateRowInteraction(String(extra.externalJobId), inter);
  };

  async function maybeRecordClick(job: JobListing) {
    if (!lastQuery) {
      return;
    }
    await postSnapshot(
      "click",
      snapshotFromListing(job, lastQuery.keyword, lastQuery.location),
    );
  }

  /**
   * Open the listing URL (`window.open`).
   * When user came from results with an active query, optionally records a click server-side first.
   */
  async function openJobPostingUrl(
    job: JobListing,
    options: { requireSearchBeforeOpen: boolean; recordClick: boolean },
  ) {
    if (!isAllowedEmploymentAlertJobUrl(job.url)) {
      setError("That listing link is unavailable.");
      return;
    }
    if (options.requireSearchBeforeOpen && !lastQuery) {
      setError("Run a search first before opening listings.");
      return;
    }
    if (options.recordClick && lastQuery) {
      try {
        await maybeRecordClick(job);
      } catch {
        setError(
          "Click could not be recorded; opening the listing anyway.",
        );
      }
    }
    if (!isAllowedEmploymentAlertJobUrl(job.url)) {
      setError("That listing link is unavailable.");
      return;
    }
    window.open(job.url, "_blank", "noopener,noreferrer");
  }

  async function downloadTailoredResumePdf(targetResumeId: string) {
    setPdfDownloading(true);
    setTailorBannerPdfMessage(null);
    try {
      const entRes = await fetch("/api/me/entitlements", {
        credentials: "include",
      });
      if (!entRes.ok) {
        setTailorBannerPdfMessage(
          "Could not verify download access. Please try again.",
        );
        return;
      }
      const ent = (await entRes.json()) as { canDownloadPdf?: boolean };
      if (!ent.canDownloadPdf) {
        setPdfPaywallOpen(true);
        return;
      }

      const res = await fetch(`/api/resume/${targetResumeId}/pdf`, {
        credentials: "include",
      });

      if (res.status === 403) {
        try {
          const body = (await res.json()) as { code?: string };
          if (body?.code === "PDF_ENTITLEMENT_REQUIRED") {
            setPdfPaywallOpen(true);
            return;
          }
        } catch {
          // fall through
        }
        setTailorBannerPdfMessage("Could not generate PDF. Please try again.");
        return;
      }

      if (!res.ok) {
        setTailorBannerPdfMessage("Could not generate PDF. Please try again.");
        return;
      }

      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      let filename = "resume.pdf";
      const m = cd?.match(/filename="([^"]+)"/);
      if (m?.[1]) {
        filename = m[1];
      }
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
      void fetchEntitlements();
    } catch {
      setTailorBannerPdfMessage("Could not generate PDF. Please try again.");
    } finally {
      setPdfDownloading(false);
    }
  }

  async function handleVisitJobFromTailorBanner() {
    if (!tailorBanner) {
      return;
    }
    setTailorBannerPdfMessage(null);
    if (!isAllowedEmploymentAlertJobUrl(tailorBanner.job.url)) {
      setTailorBannerPdfMessage("That listing link is unavailable.");
      return;
    }
    if (lastQuery) {
      try {
        await maybeRecordClick(tailorBanner.job);
      } catch {
        setTailorBannerPdfMessage(
          "Visit could not be recorded; opening the listing anyway.",
        );
      }
    }
    if (!isAllowedEmploymentAlertJobUrl(tailorBanner.job.url)) {
      setTailorBannerPdfMessage("That listing link is unavailable.");
      return;
    }
    window.open(tailorBanner.job.url, "_blank", "noopener,noreferrer");
  }

  async function handleOpenListing(job: JobListing) {
    setError(null);
    await openJobPostingUrl(job, {
      requireSearchBeforeOpen: true,
      recordClick: true,
    });
  }

  async function tailorApply(payload: TailorResult) {
    if (!resume) {
      return;
    }

    const next = mergeTailorIntoContent(resume.content, payload);
    await updateResumeContent(resume.id, next);
    setDocuments((prev) =>
      prev.map((r) => (r.id === resume.id ? { ...r, content: next } : r)),
    );
    const jobSnap = tailorFlowJobRef.current;
    if (jobSnap && isAllowedEmploymentAlertJobUrl(jobSnap.url)) {
      setTailorBanner({
        resumeId: resume.id,
        resumeTitle: resume.title,
        job: jobSnap,
      });
    }
  }

  async function handleStatus(job: JobListing, status: JobInteractionStatus) {
    if (!lastQuery) {
      setError("Run a search first.");
      return;
    }

    try {
      setError(null);
      await postSnapshot("status", {
        ...snapshotFromListing(job, lastQuery.keyword, lastQuery.location),
        status,
      });
    } catch {
      setError("Could not save job status.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="border-b border-zinc-200/80 pb-8 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Jobs
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Search Employment Alert listings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Find roles via our partner XML feed. Save prospects, mark applied, or
          ignore noise — and tailor a resume to any posting without leaving this
          page.
        </p>
      </header>

      {tailorJob && resume ? (
        <TailorJobModal
          key={`${tailorJob.externalJobId}-${tailorOpen ? "o" : "c"}`}
          open={tailorOpen}
          onClose={() => {
            setTailorOpen(false);
            setTailorJob(null);
          }}
          resumeId={resume.id}
          content={resume.content}
          onApply={(d) => void tailorApply(d)}
          initialJobDescription={descriptionFromListing(tailorJob)}
        />
      ) : null}

      <PdfPaywallModal
        open={pdfPaywallOpen}
        onClose={() => setPdfPaywallOpen(false)}
        checkoutReturnPath="/jobs"
      />

      <form
        onSubmit={(e) => void search(e)}
        className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
      >
        <fieldset className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div>
            <label htmlFor="job-keyword" className={labelClass}>
              Keyword
            </label>
            <input
              id="job-keyword"
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-inner shadow-zinc-950/[0.02] outline-none ring-violet-500/20 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-violet-500 dark:focus:ring-violet-900/35"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. product manager"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="job-location" className={labelClass}>
              Location / ZIP
            </label>
            <input
              id="job-location"
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-inner shadow-zinc-950/[0.02] outline-none ring-violet-500/20 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-violet-500 dark:focus:ring-violet-900/35"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ZIP or region"
              autoComplete="off"
            />
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="tailor-resume" className={labelClass}>
              Resume to tailor (optional picker)
            </label>
            {documents.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                No resumes yet —{" "}
                <Link
                  href="/resumes"
                  className="font-semibold text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
                >
                  create one first
                </Link>
                .
              </p>
            ) : (
                <select
                  id="tailor-resume"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                >
                  {documents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex w-full items-end gap-3 sm:w-auto">
            <button
              type="submit"
              className={`${btnPrimary} w-full sm:w-auto`}
              disabled={busy}
            >
              {busy ? "Searching…" : "Search jobs"}
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {tailorBanner ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/45 dark:bg-emerald-950/35 dark:text-emerald-50 sm:px-6 sm:py-5">
          <p className="text-sm font-medium text-emerald-950 dark:text-emerald-50">
            Suggestions saved to{" "}
            <span className="font-semibold">{tailorBanner.resumeTitle}</span>.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-emerald-900/85 dark:text-emerald-100/85">
            Next: download your tailored resume, then open the job listing to apply.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={`${btnPrimary} text-sm`}
              disabled={pdfDownloading}
              onClick={() =>
                void downloadTailoredResumePdf(tailorBanner.resumeId)
              }
            >
              {pdfDownloading ? "Preparing PDF…" : "Download tailored resume"}
            </button>
            <button
              type="button"
              className={`${btnSecondary} text-sm`}
              disabled={pdfDownloading}
              onClick={() => void handleVisitJobFromTailorBanner()}
            >
              Visit job
            </button>
          </div>
          {tailorBannerPdfMessage ? (
            <p
              className="mt-3 text-sm font-medium text-red-800 dark:text-red-200"
              role="alert"
            >
              {tailorBannerPdfMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {meta && Object.keys(meta).length > 0 ? (
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-zinc-500 dark:text-zinc-500">
          {meta.totaljobs ? (
            <div>
              <dt className="inline font-semibold text-zinc-600 dark:text-zinc-400">
                Total:&nbsp;
              </dt>
              <dd className="inline">{meta.totaljobs}</dd>
            </div>
          ) : null}
          {meta.keyword ? (
            <div>
              <dt className="inline font-semibold text-zinc-600 dark:text-zinc-400">
                Feed keyword:&nbsp;
              </dt>
              <dd className="inline">{meta.keyword}</dd>
            </div>
          ) : null}
          {meta.location ? (
            <div>
              <dt className="inline font-semibold text-zinc-600 dark:text-zinc-400">
                Feed location:&nbsp;
              </dt>
              <dd className="inline">{meta.location}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-5">
          {rows.map(({ listing: job, interaction }) => (
            <li
              key={job.externalJobId}
              className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {job.title}
                    </h2>
                    {interaction?.status && interaction.status !== "NONE" ? (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        {interaction.status.replace("_", " ")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {job.company ? (
                      <>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {job.company}
                        </span>
                        {" · "}
                      </>
                    ) : null}
                    <span>{formatListingPlace(job) || "Remote / unspecified"}</span>
                    {job.category ? (
                      <span className="text-zinc-500">
                        {" "}
                        · {job.category}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {job.description.replace(/<[^>]+>/g, " ").slice(0, 600)}
                  </p>
                </div>
                {job.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.logo}
                    alt=""
                    width={96}
                    height={96}
                    className="size-24 shrink-0 rounded-xl border border-zinc-100 object-contain dark:border-zinc-800"
                  />
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  className={`${btnPrimary} shrink-0 text-sm`}
                  onClick={() => void handleOpenListing(job)}
                  disabled={!lastQuery || busy}
                >
                  Visit listing →
                </button>
                {resume ? (
                  <button
                    type="button"
                    className={`${btnSecondary} text-sm`}
                    disabled={busy}
                    onClick={() => {
                      tailorFlowJobRef.current = job;
                      setTailorBanner(null);
                      setTailorJob(job);
                      setTailorOpen(true);
                    }}
                  >
                    Tailor resume to this job
                  </button>
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    Tailoring requires{" "}
                    <Link href="/resumes" className="underline">
                      a resume
                    </Link>
                    .
                  </span>
                )}

                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {statusChoices.map((code) => (
                      <button
                        key={code}
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-45 ${
                          interaction?.status === code
                            ? "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-600 dark:text-white"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
                        }`}
                        disabled={
                          !lastQuery || busy || interaction?.status === code
                        }
                        onClick={() =>
                          interaction?.status !== code &&
                          void handleStatus(job, code)
                        }
                      >
                        {code === "NONE" ? "Reset" : code.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {interaction?.clickedAt ? (
                <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-500">
                  Last tracked visit:&nbsp;
                  {new Date(interaction.clickedAt).toLocaleString()}
                </p>
              ) : null}
              {job.created_date ? (
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                  Posted:&nbsp;{job.created_date}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : busy ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Searching…
        </p>
      ) : lastQuery !== null ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-6 py-14 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/35 dark:text-zinc-400">
          No jobs returned from the feed — try refining your keyword or
          location query.
        </div>
      ) : null}
    </div>
  );
}
