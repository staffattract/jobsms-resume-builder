import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Absolute project root (directory containing this file). Stabilizes Vercel output tracing when multiple lockfiles confuse root inference. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["puppeteer", "pg", "@prisma/adapter-pg"],
};

export default nextConfig;
