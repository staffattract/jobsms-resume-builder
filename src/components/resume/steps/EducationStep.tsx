"use client";

import type { EducationItem, ResumeContent } from "@/lib/resume/types";
import { newId } from "@/lib/id";
import {
  btnDanger,
  btnSecondary,
  fieldsetClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/resume/form-classes";

type Props = {
  value: ResumeContent["education"];
  onChange: (next: ResumeContent["education"]) => void;
};

export function EducationStep({ value, onChange }: Props) {
  function updateItem(id: string, patch: Partial<EducationItem>) {
    onChange({
      items: value.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Degrees, certifications, or relevant coursework.
      </p>
      {value.items.map((row, ri) => (
        <fieldset key={row.id} className={fieldsetClass}>
          <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Education {ri + 1}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Institution</label>
              <input
                className={inputClass}
                value={row.institution}
                onChange={(e) =>
                  updateItem(row.id, { institution: e.target.value })
                }
                placeholder="University or school name"
              />
            </div>
            <div>
              <label className={labelClass}>Degree</label>
              <input
                className={inputClass}
                value={row.degree ?? ""}
                onChange={(e) =>
                  updateItem(row.id, { degree: e.target.value })
                }
                placeholder="B.S., M.A., Certificate…"
              />
            </div>
            <div>
              <label className={labelClass}>Field of study</label>
              <input
                className={inputClass}
                value={row.field ?? ""}
                onChange={(e) =>
                  updateItem(row.id, { field: e.target.value })
                }
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className={labelClass}>Start</label>
              <input
                className={inputClass}
                value={row.startDate ?? ""}
                onChange={(e) =>
                  updateItem(row.id, { startDate: e.target.value })
                }
                placeholder="YYYY-MM"
              />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input
                className={inputClass}
                value={row.endDate ?? ""}
                onChange={(e) =>
                  updateItem(row.id, { endDate: e.target.value })
                }
                placeholder="YYYY-MM or expected"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Details</label>
              <textarea
                className={textareaClass}
                value={row.details ?? ""}
                onChange={(e) =>
                  updateItem(row.id, { details: e.target.value })
                }
                rows={3}
                placeholder="Honors, GPA if strong, relevant coursework…"
              />
            </div>
          </div>
          <button
            type="button"
            className={`${btnDanger} mt-4`}
            onClick={() =>
              onChange({
                items: value.items.filter((i) => i.id !== row.id),
              })
            }
          >
            Remove this entry
          </button>
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
                institution: "",
              },
            ],
          })
        }
      >
        Add education
      </button>
    </div>
  );
}
