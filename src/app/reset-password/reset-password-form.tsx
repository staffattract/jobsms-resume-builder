"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
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
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    PasswordResetCompleteState,
    FormData
  >(completePasswordResetAction, {});

  useEffect(() => {
    if (state?.succeeded) {
      router.replace("/login?reset=success");
    }
  }, [state?.succeeded, router]);

  if (state?.succeeded) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center text-sm text-zinc-400 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
        Password updated. Taking you to sign in…
      </div>
    );
  }

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
          <div className="mt-4 space-y-3 text-center">
            <p className="text-sm font-medium text-red-400" role="alert">
              {state.error}
            </p>
            {state.invalidToken ? (
              <p className="text-sm text-zinc-500">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Request a new reset link
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
