declare module "@sparticuz/chromium" {
  interface Chromium {
    args: string[];
    defaultViewport: {
      width: number;
      height: number;
      deviceScaleFactor?: number;
      isMobile?: boolean;
      hasTouch?: boolean;
      isLandscape?: boolean;
    } | null;
    executablePath(input?: string): Promise<string>;
    headless: boolean | "shell";
    setGraphicsMode: boolean;
  }
  const chromium: Chromium;
  export default chromium;
}
