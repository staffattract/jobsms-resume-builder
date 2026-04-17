"use client";

import type { ExperienceItem, ResumeContent } from "@/lib/resume/types";
import { newId } from "@/lib/id";
import { improveBulletAction } from "@/lib/ai/actions";
import { AiSuggestionInline } from "@/components/resume/AiSuggestionInline";
import {
  btnDanger,
  btnSecondary,
  fieldsetClass,
  inputClass,
  labelClass,
} from "@/components/resume/form-classes";

type Props = {
  resumeId: string;
  value: ResumeContent["experience"];
  onChange: (next: ResumeContent["experience"]) => void;
};

export function ExperienceStep({ resumeId, value, onChange }: Props) {
  function updateItem(id: string, patch: Partial<ExperienceItem>) {
    onChange({
      items: value.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function updateBullet(jobId: string, bulletId: string, text: string) {
    onChange({
      items: value.items.map((i) =>
        i.id === jobId
          ? {
              ...i,
              bullets: i.bullets.map((b) =>
                b.id === bulletId ? { ...b, text } : b,
              ),
            }
          : i,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        List roles newest first. Use bullets for impact and outcomes.
      </p>
      {value.items.map((job, jobIndex) => (
        <fieldset key={job.id} className={fieldsetClass}>
          <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Position {jobIndex + 1}
          </legend>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Employer</label>
              <input
                className={inputClass}
                value={job.employer}
                onChange={(e) =>
                  updateItem(job.id, { employer: e.target.value })
                }
                placeholder="Company name"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Job title</label>
              <input
                className={inputClass}
                value={job.title}
                onChange={(e) =>
                  updateItem(job.id, { title: e.target.value })
                }
                placeholder="Your role"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Location</label>
              <input
                className={inputClass}
                value={job.location ?? ""}
                onChange={(e) =>
                  updateItem(job.id, { location: e.target.value })
                }
                placeholder="City, State / Remote"
              />
            </div>
            <div>
              <label className={labelClass}>Start date</label>
              <input
                className={inputClass}
                value={job.startDate ?? ""}
                onChange={(e) =>
                  updateItem(job.id, { startDate: e.target.value })
                }
                placeholder="YYYY-MM"
              />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input
                className={inputClass}
                value={job.endDate ?? ""}
                onChange={(e) =>
                  updateItem(job.id, {
                    endDate: e.target.value === "" ? null : e.target.value,
                  })
                }
                placeholder="YYYY-MM or leave empty if current"
              />
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <p className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Bullets
            </p>
            <ul className="flex flex-col gap-4">
              {job.bullets.map((b, bi) => (
                <li key={b.id} className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <span
                      className="mt-2 shrink-0 text-zinc-400"
                      aria-hidden
                    >
                      •
                    </span>
                    <input
                      className={`${inputClass} max-w-none flex-1`}
                      value={b.text}
                      onChange={(e) =>
                        updateBullet(job.id, b.id, e.target.value)
                      }
                      placeholder={`Achievement or responsibility ${bi + 1}`}
                    />
                    <button
                      type="button"
                      className={`${btnDanger} shrink-0 self-start`}
                      onClick={() =>
                        onChange({
                          items: value.items.map((i) =>
                            i.id === job.id
                              ? {
                                  ...i,
                                  bullets: i.bullets.filter(
                                    (x) => x.id !== b.id,
                                  ),
                                }
                              : i,
                          ),
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <AiSuggestionInline
                    runLabel="Sharpen this bullet with AI"
                    onGenerate={async () => {
                      const r = await improveBulletAction(resumeId, b.text);
                      return r.ok
                        ? { ok: true, text: r.data.suggestion }
                        : { ok: false, error: r.error };
                    }}
                    onApply={(text) => updateBullet(job.id, b.id, text)}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${btnSecondary} mt-3`}
              onClick={() =>
                onChange({
                  items: value.items.map((i) =>
                    i.id === job.id
                      ? {
                          ...i,
                          bullets: [
                            ...i.bullets,
                            { id: newId(), text: "" },
                          ],
                        }
                      : i,
                  ),
                })
              }
            >
              Add bullet
            </button>
          </div>

          <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <button
              type="button"
              className={btnDanger}
              onClick={() =>
                onChange({
                  items: value.items.filter((i) => i.id !== job.id),
                })
              }
            >
              Remove this job
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className={`${btnSecondary} self-start`}
        onClick={() =>
          onChange({
            items: [
              ...value.items,
              {
                id: newId(),
                employer: "",
                title: "",
                bullets: [],
              },
            ],
          })
        }
      >
        Add job
      </button>
    </div>
  );
}
