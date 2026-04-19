import type { LaunchOptions } from "puppeteer-core";

/** Linux serverless (Vercel, Lambda): bundled Chromium — not for local macOS/Windows. */
function usePackagedServerlessChromium(): boolean {
  if (process.env.PUPPETEER_EXECUTABLE_PATH?.trim()) {
    return false;
  }
  return (
    process.env.VERCEL === "1" ||
    Boolean(process.env.AWS_EXECUTION_ENV) ||
    process.env.PDF_USE_PACKAGED_CHROMIUM === "1"
  );
}

function devLaunchOptions(): LaunchOptions {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  return {
    headless: true,
    executablePath: executablePath || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=medium",
    ],
  };
}

/**
 * Render HTML to a PDF buffer (Letter, simple margins).
 * Uses Puppeteer/Chromium — requires Node runtime (not Edge).
 */
export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const nodeEnv = process.env.NODE_ENV ?? "unknown";
  const packaged = usePackagedServerlessChromium();

  console.error("[pdf] launch_context", {
    nodeEnv,
    packagedChromium: packaged,
    vercel: process.env.VERCEL === "1",
  });

  try {
    if (packaged) {
      const puppeteer = await import("puppeteer-core");
      const chromium = (await import("@sparticuz/chromium")).default;
      chromium.setGraphicsMode = false;

      const headless = "shell" as const;
      const executablePath = await chromium.executablePath();
      const launchOptions: LaunchOptions = {
        args: puppeteer.default.defaultArgs({
          args: [...chromium.args, "--font-render-hinting=medium"],
          headless,
        }),
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless,
      };

      const browser = await puppeteer.default.launch(launchOptions);
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "load" });
        const pdf = await page.pdf({
          format: "Letter",
          printBackground: true,
          margin: {
            top: "0.5in",
            bottom: "0.5in",
            left: "0.5in",
            right: "0.5in",
          },
        });
        return Buffer.from(pdf);
      } finally {
        await browser.close();
      }
    }

    const puppeteer = (await import("puppeteer")).default;
    const browser = await puppeteer.launch(devLaunchOptions());
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const pdf = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
          right: "0.5in",
        },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[pdf] render_error", {
      nodeEnv,
      packagedChromium: packaged,
      message: message.slice(0, 200),
    });
    throw error;
  }
}
