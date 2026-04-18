"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type PasswordResetRequestState,
} from "@/lib/auth/password-reset-actions";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-inner transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-zinc-400";
const btnPrimary =
  "mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-zinc-200 disabled:opacity-50";

const GENERIC_SUCCESS = "If that email exists, we sent a reset link.";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    PasswordResetRequestState,
    FormData
  >(requestPasswordResetAction, {});

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
      {state?.ok ? (
        <div>
          <p className="text-center text-sm font-medium leading-relaxed text-emerald-400/95">
            {GENERIC_SUCCESS}
          </p>
          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link
              href="/login"
              className="font-semibold text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form action={formAction}>
          <div>
            <label htmlFor="forgot-email" className={labelClass}>
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              placeholder="you@company.com"
            />
          </div>
          {state?.error ? (
            <p className="mt-4 text-center text-sm font-medium text-red-400" role="alert">
              {state.error}
            </p>
          ) : null}
          <button type="submit" className={btnPrimary} disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
}
