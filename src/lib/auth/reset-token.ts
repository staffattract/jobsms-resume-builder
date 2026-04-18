import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

export function generatePasswordResetSecret(): { raw: string; hash: string } {
  const raw = randomBytes(TOKEN_BYTES).toString("base64url");
  const hash = hashPasswordResetToken(raw);
  return { raw, hash };
}

export function hashPasswordResetToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
