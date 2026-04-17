"use client";

import type { ResumeContent, SkillsGroup } from "@/lib/resume/types";
import { newId } from "@/lib/id";
import {
  btnDanger,
  btnSecondary,
  fieldsetClass,
  inputClass,
  labelClass,
} from "@/components/resume/form-classes";

type Props = {
  value: ResumeContent["skills"];
  onChange: (next: ResumeContent["skills"]) => void;
};

export function SkillsStep({ value, onChange }: Props) {
  function updateGroup(id: string, patch: Partial<SkillsGroup>) {
    onChange({
      groups: value.groups.map((g) =>
        g.id === id ? { ...g, ...patch } : g,
      ),
    });
  }

  function updateSkillText(groupId: string, index: number, text: string) {
    onChange({
      groups: value.groups.map((g) => {
        if (g.id !== groupId) {
          return g;
        }
        const items = [...g.items];
        items[index] = text;
        return { ...g, items };
      }),
    });
  }

  function addSkill(groupId: string) {
    onChange({
      groups: value.groups.map((g) =>
        g.id === groupId ? { ...g, items: [...g.items, ""] } : g,
      ),
    });
  }

  function removeSkill(groupId: string, index: number) {
    onChange({
      groups: value.groups.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.filter((_, i) => i !== index) }
          : g,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Group skills by theme (e.g. Languages, Frameworks). Add or remove
        individual skills in each group.
      </p>
      {value.groups.map((g, gi) => (
        <fieldset key={g.id} className={fieldsetClass}>
          <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Skill group {gi + 1}
          </legend>
          <div className="mb-4">
            <label className={labelClass}>Group name</label>
            <input
              className={inputClass}
              value={g.name}
              onChange={(e) =>
                updateGroup(g.id, { name: e.target.value })
              }
              placeholder="e.g. Engineering"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Skills
            </p>
            <ul className="flex flex-col gap-2">
              {g.items.map((skill, si) => (
                <li key={`${g.id}-${si}`} className="flex gap-2">
                  <input
                    className={`${inputClass} max-w-none flex-1`}
                    value={skill}
                    onChange={(e) =>
                      updateSkillText(g.id, si, e.target.value)
                    }
                    placeholder="e.g. TypeScript"
                  />
                  <button
                    type="button"
                    className={`${btnDanger} shrink-0`}
                    onClick={() => removeSkill(g.id, si)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${btnSecondary} mt-2`}
              onClick={() => addSkill(g.id)}
            >
              Add skill
            </button>
          </div>
          <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <button
              type="button"
              className={btnDanger}
              onClick={() =>
                onChange({
                  groups: value.groups.filter((x) => x.id !== g.id),
                })
              }
            >
              Remove this group
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className={`${btnSecondary} self-start`}
        onClick={() =>
          onChange({
            groups: [
              ...value.groups,
              { id: newId(), name: "New group", items: [] },
            ],
          })
        }
      >
        Add group
      </button>
    </div>
  );
}
