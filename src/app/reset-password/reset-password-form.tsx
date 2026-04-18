"use client";

import { useActionState } from "react";
import {
  completePasswordResetAction,
  type PasswordResetCompleteState,
} from "@/lib/auth/password-reset-actions";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-inner transition focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-zinc-400";
const btnPrimary =
  "mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-zinc-200 disabled:opacity-50";

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const [state, formAction, pending] = useActionState<
    PasswordResetCompleteState,
    FormData
  >(completePasswordResetAction, {});

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="reset-password" className={labelClass}>
            New password
          </label>
          <input
            id="reset-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="reset-confirm" className={labelClass}>
            Confirm password
          </label>
          <input
            id="reset-confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            placeholder="Repeat password"
          />
        </div>
        {state?.error ? (
          <p className="mt-4 text-center text-sm font-medium text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
