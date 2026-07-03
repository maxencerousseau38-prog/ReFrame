import type { Browser, Page } from "playwright";

/**
 * A shared, lazily-launched local headless Chromium (Playwright). This is the
 * zero-config fallback for headless work — screenshots today, and rendering
 * later — so the app does not require an external Browserless service.
 *
 * Everything degrades gracefully: on a host without a browser binary (e.g. some
 * serverless platforms) launch fails and helpers return null, so callers fall
 * back exactly as they do when nothing is configured.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

let browserPromise: Promise<Browser | null> | null = null;

async function launch(): Promise<Browser | null> {
  try {
    const { chromium } = await import("playwright");
    // Honour the environment's egress proxy (Node fetch does automatically;
    // Chromium needs it explicitly). Local addresses stay direct so fixture
    // servers and self-hosted tools keep working.
    const proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    return await chromium.launch({
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      ...(proxyServer
        ? { proxy: { server: proxyServer, bypass: "localhost,127.0.0.1" } }
        : {}),
    });
  } catch {
    return null;
  }
}

async function getBrowser(): Promise<Browser | null> {
  if (!browserPromise) browserPromise = launch();
  let browser = await browserPromise;
  // A crashed/closed browser leaves a stale promise; relaunch once.
  if (browser && !browser.isConnected()) {
    browserPromise = launch();
    browser = await browserPromise;
  }
  return browser;
}

/** Whether a local headless browser is usable here (cached after first probe). */
export async function localBrowserReady(): Promise<boolean> {
  // Keep unit tests hermetic: never launch a real browser under Vitest unless
  // the extraction audit explicitly opts in.
  if (process.env.VITEST && !process.env.AUDIT) return false;
  return (await getBrowser()) !== null;
}

/**
 * Run `fn` with a throwaway page in an isolated context, always cleaned up.
 * Returns null when no local browser is available or the operation throws, so
 * callers can degrade gracefully. HTTPS errors are ignored — these previews are
 * visual only, the URL is already SSRF-validated, and this keeps captures
 * working behind TLS-intercepting proxies.
 */
export async function withPage<T>(
  fn: (page: Page) => Promise<T>,
  opts: { timeoutMs?: number; viewport?: { width: number; height: number } } = {}
): Promise<T | null> {
  const browser = await getBrowser();
  if (!browser) return null;
  let context: Awaited<ReturnType<Browser["newContext"]>> | undefined;
  try {
    context = await browser.newContext({
      userAgent: UA,
      viewport: opts.viewport ?? { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(opts.timeoutMs ?? 20_000);
    return await fn(page);
  } catch {
    return null;
  } finally {
    await context?.close().catch(() => {});
  }
}
