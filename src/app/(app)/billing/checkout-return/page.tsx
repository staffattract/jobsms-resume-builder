import { Suspense } from "react";
import { CheckoutReturnClient } from "./checkout-return-client";

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-600">Loading…</p>}>
      <CheckoutReturnClient />
    </Suspense>
  );
}
