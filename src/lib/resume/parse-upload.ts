export type UploadFileKind = "pdf" | "docx" | "txt";

export function kindFromFileNameOrType(file: {
  name: string;
  type: string;
}): UploadFileKind | "msword" | null {
  const n = file.name.toLowerCase();
  if (file.type === "text/plain" || n.endsWith(".txt")) {
    return "txt";
  }
  if (file.type === "application/pdf" || n.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    n.endsWith(".docx")
  ) {
    return "docx";
  }
  if (file.type === "application/msword" || n.endsWith(".doc")) {
    return "msword";
  }
  return null;
}

export async function extractTextFromUpload(
  buffer: Buffer,
  kind: UploadFileKind,
): Promise<string> {
  if (kind === "txt") {
    return buffer.toString("utf8").trim();
  }
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
