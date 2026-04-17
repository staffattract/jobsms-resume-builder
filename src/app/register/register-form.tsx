"use client";

import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/lib/auth/form-actions";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-inner transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-zinc-400";
const btnPrimary =
  "mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-zinc-200 disabled:opacity-50";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    {},
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
      <form action={formAction}>
        <div>
          <label htmlFor="register-name" className={labelClass}>
            Name <span className="font-normal normal-case text-zinc-500">(optional)</span>
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            className={inputClass}
            placeholder="Jordan Lee"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="register-email" className={labelClass}>
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="register-password" className={labelClass}>
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </div>
        {state?.error ? (
          <p className="mt-4 text-center text-sm font-medium text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
