export type UploadFileKind = "pdf" | "docx";

export async function extractTextFromUpload(
  buffer: Buffer,
  kind: UploadFileKind,
): Promise<string> {
  if (kind === "pdf") {
    const mod = await import("pdf-parse");
    const pdfParse = mod.default as (
      data: Buffer,
    ) => Promise<{ text?: string }>;
    const res = await pdfParse(buffer);
    return (res.text ?? "").trim();
  }
  const mammoth = await import("mammoth");
  const res = await mammoth.extractRawText({ buffer });
  return (res.value ?? "").trim();
}
