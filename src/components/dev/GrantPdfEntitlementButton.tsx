"use client";

import { useState } from "react";

export function GrantPdfEntitlementButton() {
  const [status, setStatus] = useState<string | null>(null);

  async function grant() {
    setStatus("…");
    try {
      const res = await fetch("/api/dev/grant-pdf-entitlement", {
        method: "POST",
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(res.status === 401 ? "Sign in required" : `Error (${res.status})`);
        return;
      }
      setStatus(
        `OK: ${body.pdfEntitlementTier}, ${body.pdfOneTimeDownloadsRemaining} download(s) left`,
      );
    } catch {
      setStatus("Request failed");
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
      <button type="button" onClick={grant} style={{ fontSize: "12px" }}>
        Dev: grant 1 PDF download
      </button>
      {status ? <span style={{ opacity: 0.85 }}>{status}</span> : null}
    </div>
  );
}
