import { randomBytes } from "node:crypto";

/** Opaque session token stored in DB and mirrored in the session cookie. */
export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}
