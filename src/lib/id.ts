/** Stable random id for client-side list rows (links, jobs, bullets, etc.). */
export function newId(): string {
  return crypto.randomUUID();
}
