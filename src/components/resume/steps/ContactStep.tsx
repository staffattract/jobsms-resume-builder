"use client";

import type { ResumeContact } from "@/lib/resume/types";
import { newId } from "@/lib/id";
import {
  btnDanger,
  btnSecondary,
  fieldsetClass,
  inputClass,
  labelClass,
} from "@/components/resume/form-classes";

type Props = {
  value: ResumeContact;
  onChange: (next: ResumeContact) => void;
};

export function ContactStep({ value, onChange }: Props) {
  function updateLink(
    id: string,
    patch: Partial<{ label: string; url: string }>,
  ) {
    onChange({
      ...value,
      links: value.links.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        How employers can reach you.
      </p>
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="contact-fullName" className={labelClass}>
            Full name
          </label>
          <input
            id="contact-fullName"
            className={inputClass}
            value={value.fullName ?? ""}
            onChange={(e) =>
              onChange({ ...value, fullName: e.target.value })
            }
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            className={inputClass}
            value={value.email ?? ""}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            className={inputClass}
            value={value.phone ?? ""}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-location" className={labelClass}>
            Location
          </label>
          <input
            id="contact-location"
            className={inputClass}
            value={value.location ?? ""}
            onChange={(e) =>
              onChange({ ...value, location: e.target.value })
            }
            placeholder="City, State / Remote"
          />
        </div>
      </div>

      <fieldset className={fieldsetClass}>
        <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Links
        </legend>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          Portfolio, LinkedIn, GitHub, etc.
        </p>
        <ul className="flex flex-col gap-3">
          {value.links.map((link) => (
            <li
              key={link.id}
              className="flex flex-col gap-2 border-b border-zinc-200 pb-3 last:border-0 dark:border-zinc-700 sm:flex-row sm:items-end"
            >
              <div className="min-w-0 flex-1">
                <label className={labelClass}>Label</label>
                <input
                  className={inputClass}
                  placeholder="LinkedIn"
                  value={link.label ?? ""}
                  onChange={(e) =>
                    updateLink(link.id, { label: e.target.value })
                  }
                />
              </div>
              <div className="min-w-0 flex-[2]">
                <label className={labelClass}>URL</label>
                <input
                  className={inputClass}
                  placeholder="https://…"
                  value={link.url ?? ""}
                  onChange={(e) =>
                    updateLink(link.id, { url: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className={`${btnDanger} shrink-0 self-start sm:self-end`}
                onClick={() =>
                  onChange({
                    ...value,
                    links: value.links.filter((l) => l.id !== link.id),
                  })
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`${btnSecondary} mt-2`}
          onClick={() =>
            onChange({
              ...value,
              links: [...value.links, { id: newId(), label: "", url: "" }],
            })
          }
        >
          Add link
        </button>
      </fieldset>
    </div>
  );
}
