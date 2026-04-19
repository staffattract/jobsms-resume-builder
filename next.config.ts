import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Absolute project root (directory containing this file). Stabilizes Vercel output tracing when multiple lockfiles confuse root inference. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "pg",
    "@prisma/adapter-pg",
  ],
  /**
   * Externalized `@sparticuz/chromium` is not fully traced from JS imports alone;
   * ship `bin/` (and the rest of the package) with the PDF route handler bundle on Vercel.
   * Key: picomatch against normalized app route path (see `normalizeAppPath` → `/api/resume/[id]/pdf`).
   */
  outputFileTracingIncludes: {
    "/api/resume/\\[id\\]/pdf": [
      "node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
