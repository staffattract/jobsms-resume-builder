"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { sanitizeCheckoutReturnPath } from "@/lib/stripe/checkout-return-path";

type PollState = "idle" | "polling" | "ready" | "timeout";

export function CheckoutReturnClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canceled = searchParams.get("canceled") === "1";
  const sessionId = searchParams.get("session_id");
  const fallbackHome = sanitizeCheckoutReturnPath(
    searchParams.get("return_path"),
  );

  const afterCheckoutHref = fallbackHome ?? "/resumes";

  const [pollState, setPollState] = useState<PollState>(() => {
    if (canceled || !sessionId) {
      return "idle";
    }
    return "polling";
  });

  useEffect(() => {
    if (canceled || !sessionId) {
      return;
    }
    let cancelled = false;

    async function run() {
      let attempts = 0;
      while (!cancelled && attempts < 45) {
        attempts += 1;
        const res = await fetch("/api/me/entitlements", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as { canDownloadPdf?: boolean };
          if (data.canDownloadPdf) {
            if (!cancelled) {
              setPollState("ready");
            }
            return;
          }
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (!cancelled) {
        setPollState("timeout");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [canceled, sessionId]);

  useEffect(() => {
    if (pollState === "ready" && afterCheckoutHref) {
      router.replace(afterCheckoutHref);
    }
  }, [pollState, router, afterCheckoutHref]);

  if (canceled) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Checkout canceled
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No charges were made. You can return and try again anytime.
        </p>
        <p className="mt-4">
          <Link
            href={afterCheckoutHref}
            className="text-sm text-blue-600 underline"
          >
            Continue
          </Link>
        </p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Billing
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing to show here. Open checkout from the resume editor to start your plan
          and export PDFs.
        </p>
        <p className="mt-4">
          <Link
            href={afterCheckoutHref}
            className="text-sm text-blue-600 underline"
          >
            Continue
          </Link>
        </p>
      </div>
    );
  }

  if (pollState === "polling") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Confirming your purchase…
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This usually takes a few seconds while we activate PDF downloads on
          your account.
        </p>
      </div>
    );
  }

  if (pollState === "ready") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Redirecting…
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Taking you back to continue — if nothing happens,
          {" "}
          <Link href={afterCheckoutHref} className="text-blue-600 underline">
            open this link
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Still processing
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t confirm the update yet. Refresh this page in a moment,
        or check that your Stripe webhook is configured and receiving events.
      </p>
      <p className="mt-4">
        <Link
          href={afterCheckoutHref}
          className="text-sm text-blue-600 underline"
        >
          Continue
        </Link>
      </p>
    </div>
  );
}
