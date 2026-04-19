import { NextResponse } from "next/server";
import { requireVerifiedSessionUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/db";
import { consumePdfEntitlementAfterSuccessfulDownload } from "@/lib/entitlements/entitlement-service";
import { canUserDownloadPdf } from "@/lib/entitlements/resolve-pdf-access";
import { buildResumePdfHtml } from "@/lib/resume/pdf-html";
import { htmlToPdfBuffer } from "@/lib/resume/render-pdf";
import { normalizeResumeContent } from "@/lib/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFilename(title: string): string {
  const base = title
    .trim()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return base || "resume";
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
  const name = safeFilename(resume.title);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
