"use client";

import type { ReactNode } from "react";
import type { GalleryPreviewChrome } from "@/lib/resume/templates/preview-gallery-styles";
import { galleryPreviewChrome } from "@/lib/resume/templates/preview-gallery-styles";
import { getResumeTemplateDefinition } from "@/lib/resume/templates/registry";
import { formatResumeDateRange } from "@/lib/resume/format-resume-dates";
import type { ResumeContent } from "@/lib/resume/types";

export type PreviewExportAccess = "allowed" | "pending" | "denied";

type Props = {
  content: ResumeContent;
  title: string;
  /** `pending` = entitlements loading (conservative lock); `denied` = no PDF access; `allowed` = full preview */
  exportAccess: PreviewExportAccess;
  onUnlockClick?: () => void;
  /** Gallery mini-previews: stronger per-template silhouette (editor uses default). */
  previewMode?: "default" | "gallery";
};

const SECTION_TITLE_DEFAULT =
  "mb-3 border-b border-zinc-200 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-700 dark:text-zinc-500";

function SectionHeading({
  children,
  gallery,
}: {
  children: ReactNode;
  gallery: GalleryPreviewChrome | null;
}) {
  return (
    <h3 className={gallery ? gallery.sectionTitle : SECTION_TITLE_DEFAULT}>
      {children}
    </h3>
  );
}

export function ResumeLivePreview({
  content,
  title,
  exportAccess,
  onUnlockClick,
  previewMode = "default",
}: Props) {
  const { contact, target, summary, experience, skills, education, meta } =
    content;
  const gallery =
    previewMode === "gallery" ? galleryPreviewChrome(meta.templateId) : null;

  const displayName =
    contact.fullName?.trim() ||
    title?.trim() ||
    "Your name";
  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
  ]
    .filter((x) => typeof x === "string" && x.trim() !== "")
    .join(" · ");

  const hasBodyContent =
    !!summary.text?.trim() ||
    experience.items.length > 0 ||
    education.items.length > 0 ||
    skills.groups.some((g) => g.name.trim() || g.items.some((s) => s.trim())) ||
    !!(target.jobTitle || target.company || target.notes);

  const tpl = getResumeTemplateDefinition(meta.templateId);
  const hasSkills = skills.groups.some(
    (g) => g.name.trim() || g.items.some((s) => s.trim()),
  );
  const hasEdu = education.items.length > 0;
  const useTwoColumnLayout =
    tpl.layout === "two-column" && (hasSkills || hasEdu);

  const showLockOverlay = exportAccess !== "allowed";

  return (
    <div className="relative">
      <div
        className="rounded-xl border border-zinc-200/90 bg-zinc-100/90 p-3 shadow-inner dark:border-zinc-700/80 dark:bg-zinc-900/50 md:p-4"
        data-preview-surface
      >
        <div
          className={
            gallery
              ? `${gallery.innerCard}${showLockOverlay ? " min-h-[520px]" : ""}`
              : `relative overflow-hidden rounded-sm bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-zinc-900/[0.04] dark:bg-zinc-50 dark:ring-zinc-900/20${
                  showLockOverlay ? " min-h-[520px]" : ""
                }`
          }
        >
          <div className={gallery ? gallery.innerPad : "p-7 md:p-9"}>
            <header
              className={
                gallery
                  ? gallery.header
                  : "border-b border-zinc-200 pb-6 text-center dark:border-zinc-200"
              }
            >
              <h1
                className={
                  gallery
                    ? gallery.name
                    : "text-[1.65rem] font-semibold tracking-tight text-zinc-950 md:text-[1.75rem]"
                }
              >
                {displayName}
              </h1>
              {contactLine ? (
                <p
                  className={
                    gallery ? gallery.contact : "mt-2 text-[0.8rem] font-medium text-zinc-600"
                  }
                >
                  {contactLine}
                </p>
              ) : null}
              {contact.links.some((l) => l.url) ? (
                <p
                  className={
                    gallery
                      ? gallery.links
                      : "mt-3 text-[0.75rem] text-zinc-700"
                  }
                >
                  {contact.links
                    .filter((l) => l.url)
                    .map((l, i) => (
                      <span key={l.id}>
                        {i > 0 ? (
                          <span className="text-zinc-300 dark:text-zinc-600">
                            {" "}
                            ·{" "}
                          </span>
                        ) : null}
                        <a
                          href={l.url!}
                          className="font-medium text-zinc-800 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-950 dark:text-zinc-700 dark:hover:text-zinc-100"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {l.label?.trim() || l.url}
                        </a>
                      </span>
                    ))}
                </p>
              ) : null}
              <p
                className={
                  gallery
                    ? gallery.badge
                    : "mt-4 text-[0.65rem] font-medium uppercase tracking-wider text-zinc-400"
                }
              >
                {tpl.name} · Live preview
              </p>
            </header>

            {useTwoColumnLayout ? (
              <div
                className={
                  gallery
                    ? `${gallery.twoColGrid} ${gallery.bodyText}`
                    : "mt-8 grid gap-8 text-[0.8125rem] leading-relaxed text-zinc-800 md:grid-cols-[minmax(0,1fr)_min(200px,32%)] md:gap-10"
                }
              >
                <div className={gallery ? gallery.twoColMain : "min-w-0 space-y-8"}>
                  {(target.jobTitle || target.company || target.notes?.trim()) && (
                    <section>
                      <SectionHeading gallery={gallery}>Target role</SectionHeading>
                      {(target.jobTitle || target.company) && (
                        <p className="font-semibold text-zinc-900">
                          {[target.jobTitle, target.company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {target.notes?.trim() ? (
                        <p className="mt-2 whitespace-pre-wrap text-zinc-700">
                          {target.notes}
                        </p>
                      ) : null}
                    </section>
                  )}
                  {summary.text?.trim() ? (
                    <section>
                      <SectionHeading gallery={gallery}>Summary</SectionHeading>
                      <p className="whitespace-pre-wrap text-zinc-800">
                        {summary.text}
                      </p>
                    </section>
                  ) : null}
                  {experience.items.length > 0 ? (
                    <section>
                      <SectionHeading gallery={gallery}>Experience</SectionHeading>
                      <ul className="space-y-6">
                        {experience.items.map((job) => (
                          <li key={job.id}>
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                              <div>
                                <p className="font-semibold text-zinc-950">
                                  {job.title || "Role"}
                                  <span className="font-normal text-zinc-600">
                                    {" "}
                                    · {job.employer || "Company"}
                                  </span>
                                </p>
                                {job.location?.trim() ? (
                                  <p className="text-[0.75rem] text-zinc-500">
                                    {job.location}
                                  </p>
                                ) : null}
                              </div>
                              <p className="shrink-0 text-[0.7rem] font-medium tabular-nums text-zinc-500">
                                {formatResumeDateRange(job.startDate, job.endDate)}
                              </p>
                            </div>
                            {job.bullets.length > 0 ? (
                              <ul className="mt-2 list-disc space-y-1 pl-4 marker:text-zinc-400">
                                {job.bullets.map((b) =>
                                  b.text.trim() ? (
                                    <li key={b.id} className="pl-0.5 text-zinc-800">
                                      {b.text}
                                    </li>
                                  ) : null,
                                )}
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
                <div
                  className={
                    gallery
                      ? gallery.twoColAside
                      : "min-w-0 space-y-6 border-zinc-200 md:border-l md:pl-8 dark:border-zinc-200"
                  }
                >
                  {hasSkills ? (
                    <section>
                      <SectionHeading gallery={gallery}>Skills</SectionHeading>
                      <div className="space-y-4">
                        {skills.groups.map((g) => (
                          <div key={g.id}>
                            {g.name.trim() ? (
                              <p className="text-sm font-semibold text-zinc-900">
                                {g.name}
                              </p>
                            ) : null}
                            {g.items.filter((s) => s.trim()).length > 0 ? (
                              <p className="mt-1 text-zinc-800">
                                {g.items.filter((s) => s.trim()).join(" · ")}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                  {hasEdu ? (
                    <section>
                      <SectionHeading gallery={gallery}>Education</SectionHeading>
                      <ul className="space-y-4">
                        {education.items.map((ed) => (
                          <li key={ed.id}>
                            <p className="font-semibold text-zinc-950">
                              {ed.institution || "Institution"}
                            </p>
                            <p className="text-zinc-800">
                              {[ed.degree, ed.field].filter(Boolean).join(", ")}
                            </p>
                            {(ed.startDate || ed.endDate) ? (
                              <p className="mt-0.5 text-[0.75rem] text-zinc-500">
                                {formatResumeDateRange(ed.startDate, ed.endDate ?? undefined)}
                              </p>
                            ) : null}
                            {ed.details?.trim() ? (
                              <p className="mt-1 whitespace-pre-wrap text-zinc-700">
                                {ed.details}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              </div>
            ) : (
              <div
                className={
                  gallery
                    ? `${gallery.mainStack} ${gallery.bodyText}`
                    : "mt-8 space-y-8 text-[0.8125rem] leading-relaxed text-zinc-800"
                }
              >
                {(target.jobTitle || target.company || target.notes?.trim()) && (
                  <section>
                    <SectionHeading gallery={gallery}>Target role</SectionHeading>
                    {(target.jobTitle || target.company) && (
                      <p className="font-semibold text-zinc-900">
                        {[target.jobTitle, target.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {target.notes?.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap text-zinc-700">
                        {target.notes}
                      </p>
                    ) : null}
                  </section>
                )}

                {summary.text?.trim() ? (
                  <section>
                    <SectionHeading gallery={gallery}>Summary</SectionHeading>
                    <p className="whitespace-pre-wrap text-zinc-800">
                      {summary.text}
                    </p>
                  </section>
                ) : null}

                {experience.items.length > 0 ? (
                  <section>
                    <SectionHeading gallery={gallery}>Experience</SectionHeading>
                    <ul className="space-y-6">
                      {experience.items.map((job) => (
                        <li key={job.id}>
                          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                            <div>
                              <p className="font-semibold text-zinc-950">
                                {job.title || "Role"}
                                <span className="font-normal text-zinc-600">
                                  {" "}
                                  · {job.employer || "Company"}
                                </span>
                              </p>
                              {job.location?.trim() ? (
                                <p className="text-[0.75rem] text-zinc-500">
                                  {job.location}
                                </p>
                              ) : null}
                            </div>
                            <p className="shrink-0 text-[0.7rem] font-medium tabular-nums text-zinc-500">
                              {formatResumeDateRange(job.startDate, job.endDate)}
                            </p>
                          </div>
                          {job.bullets.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-1 pl-4 marker:text-zinc-400">
                              {job.bullets.map((b) =>
                                b.text.trim() ? (
                                  <li key={b.id} className="pl-0.5 text-zinc-800">
                                    {b.text}
                                  </li>
                                ) : null,
                              )}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {hasSkills ? (
                  <section>
                    <SectionHeading gallery={gallery}>Skills</SectionHeading>
                    <div className="space-y-4">
                      {skills.groups.map((g) => (
                        <div key={g.id}>
                          {g.name.trim() ? (
                            <p className="text-sm font-semibold text-zinc-900">
                              {g.name}
                            </p>
                          ) : null}
                          {g.items.filter((s) => s.trim()).length > 0 ? (
                            <p className="mt-1 text-zinc-800">
                              {g.items.filter((s) => s.trim()).join(" · ")}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {education.items.length > 0 ? (
                  <section>
                    <SectionHeading gallery={gallery}>Education</SectionHeading>
                    <ul className="space-y-4">
                      {education.items.map((ed) => (
                        <li key={ed.id}>
                          <p className="font-semibold text-zinc-950">
                            {ed.institution || "Institution"}
                          </p>
                          <p className="text-zinc-800">
                            {[ed.degree, ed.field].filter(Boolean).join(", ")}
                          </p>
                          {(ed.startDate || ed.endDate) ? (
                            <p className="mt-0.5 text-[0.75rem] text-zinc-500">
                              {formatResumeDateRange(ed.startDate, ed.endDate ?? undefined)}
                            </p>
                          ) : null}
                          {ed.details?.trim() ? (
                            <p className="mt-1 whitespace-pre-wrap text-zinc-700">
                              {ed.details}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {!hasBodyContent &&
                !contact.fullName &&
                !contact.email &&
                !contact.phone ? (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    Start editing — your resume appears here in real time.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {showLockOverlay ? (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 top-[32%] bg-gradient-to-b from-transparent via-white/55 to-white dark:via-zinc-50/55 dark:to-zinc-50"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[32%] backdrop-blur-[6px]" />
              <div className="pointer-events-auto absolute inset-x-0 bottom-0 top-[38%] flex flex-col items-center justify-end bg-gradient-to-t from-white via-white/95 to-transparent px-6 pb-8 pt-16 dark:from-zinc-50 dark:via-zinc-50/95">
                {exportAccess === "pending" ? (
                  <div className="w-full max-w-[280px] rounded-2xl border border-zinc-200/90 bg-white/95 p-6 text-center shadow-lg shadow-zinc-900/10 ring-1 ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900/95 dark:ring-white/10">
                    <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <span
                        className="inline-block size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-600 dark:border-t-zinc-200"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Verifying access
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Hang tight
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Confirming whether PDF export is included with your account.
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-[280px] rounded-2xl border border-zinc-200/90 bg-white/95 p-5 text-center shadow-lg shadow-zinc-900/10 ring-1 ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900/95 dark:ring-white/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Preview locked
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Export a polished PDF anytime
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Unlock downloads to save and share your full resume.
                    </p>
                    <button
                      type="button"
                      onClick={onUnlockClick}
                      className="mt-4 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      View plans & pricing
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
