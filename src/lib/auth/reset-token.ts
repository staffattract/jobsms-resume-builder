import { randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

/** Cryptographically random URL-safe token (stored in DB; never log). */
export function generatePasswordResetToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}
