/**
 * Headless rendering, env-driven with graceful degradation (same pattern as the
 * KV / email / Stripe adapters: no SDK, just fetch to an HTTP endpoint).
 *
 * Most of the modern web is JavaScript-rendered or behind bot protection, so a
 * plain HTML fetch returns an empty shell. When a render service is configured,
 * the analyzer asks it to execute the page and return the real, post-JS HTML.
 *
 * We target the Browserless `/content` REST API, which is self-hostable
 * (Docker, one container) or available as a cloud endpoint, so there is no
 * chromium binary to ship in the app itself. Configure:
 *   BROWSERLESS_URL    e.g. https://chrome.browserless.io  or  http://localhost:3000
 *   BROWSERLESS_TOKEN  API token (optional for a self-hosted, unauthenticated box)
 *
 * Without BROWSERLESS_URL, isRenderConfigured() is false and the analyzer keeps
 * doing the plain static fetch it does today.
 */

const RENDER_URL = process.env.BROWSERLESS_URL;
const RENDER_TOKEN = process.env.BROWSERLESS_TOKEN;

export function isRenderConfigured(): boolean {
  return Boolean(RENDER_URL);
}

/**
 * Return the page's rendered HTML via the render service, or null if rendering
 * is unconfigured, times out, or fails. Callers must have already validated the
 * URL (SSRF guard) before calling this.
 */
export async function renderHtml(targetUrl: string): Promise<string | null> {
  if (!RENDER_URL) return null;
  const base = RENDER_URL.replace(/\/$/, "");
  const endpoint = `${base}/content${RENDER_TOKEN ? `?token=${encodeURIComponent(RENDER_TOKEN)}` : ""}`;

  // Stay within the analyze route's 30s budget (≈7s static fetch + this): cap the
  // whole render at 22s, and the in-browser navigation a little under that.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22_000);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        gotoOptions: { waitUntil: "networkidle2", timeout: 18000 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html && html.length > 200 ? html : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
