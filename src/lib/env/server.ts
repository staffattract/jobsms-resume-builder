/**
 * Central server-side reads for process.env with consistent error messages.
 * Import from `@/lib/env/server` only in server bundles (Route Handlers, Server Actions,
 * `src/lib/**` excluding client-only files).
 */

export function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/** Undefined if missing or whitespace-only */
export function optionalEnvTrim(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}
