import puppeteer from "puppeteer";

function getLaunchOptions() {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();

  return {
    headless: true as const,
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
  try {
    const browser = await puppeteer.launch(getLaunchOptions());

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
    if (process.env.NODE_ENV === "production") {
      console.error("[pdf] render failed:", message);
    } else {
      console.error("[pdf] render failed:", message, {
        customChromium: Boolean(process.env.PUPPETEER_EXECUTABLE_PATH?.trim()),
      });
    }
    throw error;
  }
}
