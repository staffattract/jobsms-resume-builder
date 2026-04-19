import { NextResponse } from "next/server";
import { requireVerifiedSessionUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/db";
import { consumePdfEntitlementAfterSuccessfulDownload } from "@/lib/entitlements/entitlement-service";
import { canUserDownloadPdf } from "@/lib/entitlements/resolve-pdf-access";
import { buildResumePdfHtml } from "@/lib/resume/pdf-html";
import { htmlToPdfBuffer } from "@/lib/resume/render-pdf";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lowercase slug: spaces → underscores, strip specials, collapse underscores. */
function sanitizeFilenamePart(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function parseFirstInitialAndLastName(fullName: string | undefined): {
  initial: string;
  lastName: string;
} | null {
  const parts = (fullName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  const first = parts[0]!;
  const initialRaw = first.slice(0, 1);
  const initial = sanitizeFilenamePart(initialRaw);
  const lastToken = parts.length > 1 ? parts[parts.length - 1]! : first;
  const lastName = sanitizeFilenamePart(lastToken);
  if (!initial || !lastName) {
    return null;
  }
  return { initial, lastName };
}

function buildResumePdfFilename(
  content: ResumeContent,
  resumeId: string,
  orderedResumeIds: string[],
): string {
  const parsed = parseFirstInitialAndLastName(content.contact.fullName);
  const jobRaw = content.target.jobTitle?.trim();
  const jobSlug = jobRaw ? sanitizeFilenamePart(jobRaw.replace(/_/g, " ")) : "";

  let base: string;
  if (!parsed) {
    base = "resume";
  } else {
    const nameCore = `${parsed.initial}_${parsed.lastName}`;
    if (jobSlug) {
      base = `${nameCore}_${jobSlug}_resume`;
    } else {
      base = `${nameCore}_resume`;
    }
  }

  const idx = orderedResumeIds.indexOf(resumeId);
  const n = orderedResumeIds.length;
  if (n > 1 && idx > 0) {
    base = `${base}_${idx}`;
  }

  const maxLen = 120;
  const trimmed =
    base.length > maxLen ? base.slice(0, maxLen).replace(/_+$/g, "") : base;
  return trimmed || "resume";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireVerifiedSessionUser();
  if (user instanceof NextResponse) {
    return user;
  }

  const { id } = await context.params;
  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!resume) {
    return new Response("Not found", { status: 404 });
  }

  const entitlementUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      pdfEntitlementTier: true,
      pdfOneTimeDownloadsRemaining: true,
      subscriptionValidUntil: true,
    },
  });
  if (!entitlementUser || !canUserDownloadPdf(entitlementUser)) {
    return NextResponse.json(
      { code: "PDF_ENTITLEMENT_REQUIRED" },
      { status: 403 },
    );
  }

  const content = normalizeResumeContent(resume.content);
  const html = buildResumePdfHtml(resume.title, content);
  const buffer = await htmlToPdfBuffer(html);
  await consumePdfEntitlementAfterSuccessfulDownload(user.id);

  const orderedIds = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const orderedResumeIds = orderedIds.map((r) => r.id);
  const name = buildResumePdfFilename(content, resume.id, orderedResumeIds);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
