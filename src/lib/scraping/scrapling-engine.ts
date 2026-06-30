/**
 * ScraplingEngine — TypeScript-native 3-tier web fetcher.
 *
 * Conceptually mirrors the Scrapling library (Fetcher → StealthyFetcher →
 * DynamicFetcher) using tools already available in the stack:
 *   Tier 1 (static)  — native fetch() with browser-like headers
 *   Tier 2 (stealth) — enhanced fetch() with rotating UA + referrer spoofing
 *   Tier 3 (dynamic) — Playwright via the existing withPage() helper
 *
 * Auto-tier-selection: start static, escalate on challenge/weakness/block.
 * Explicit mode can be forced via fetchWithMode().
 *
 * No Python runtime. No new npm deps. No Playwright binary download
 * (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 is already set in the environment).
 */

import type { RawPage, FetchMode, FetchOptions, LayoutMetrics, ElementMetric, ComputedStyle, Screenshots } from "./types";

/* -------------------------------------------------------------------------- */
/*  Challenge / weakness detection (shared with existing engine.ts helpers)  */
/* -------------------------------------------------------------------------- */

/** HTML that looks like a bot-protection interstitial (Cloudflare, etc.). */
export function isChallengeHtml(html: string, status?: number | null): boolean {
  if (status === 403 || status === 429) return true;
  if (!html || html.length < 400) return true;
  const lower = html.toLowerCase();
  return (
    lower.includes("just a moment") ||
    lower.includes("checking your browser") ||
    lower.includes("cf-browser-verification") ||
    lower.includes("turnstile") ||
    lower.includes("please enable javascript") ||
    lower.includes("ddos-guard") ||
    /window\._cf_chl/.test(html)
  );
}

/** HTML that needs JavaScript rendering (empty SPA shell, Framer, etc.). */
export function needsDynamicFetch(html: string): boolean {
  const clean = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length < 300) return true;
  // React / Next.js shell with nothing rendered
  if (/<div id="__next">\s*<\/div>/i.test(html)) return true;
  // Framer sites always need JS
  if (/data-framer-name/i.test(html) && clean.length < 1000) return true;
  return false;
}

/* -------------------------------------------------------------------------- */
/*  Browser-like request headers                                              */
/* -------------------------------------------------------------------------- */

const STATIC_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

const STEALTH_UA_POOL = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
];

function stealthHeaders(url: string): Record<string, string> {
  const ua = STEALTH_UA_POOL[Math.floor(Math.random() * STEALTH_UA_POOL.length)];
  const origin = new URL(url).origin;
  return {
    ...STATIC_HEADERS,
    "User-Agent": ua,
    "Referer": `https://www.google.com/search?q=${encodeURIComponent(new URL(url).hostname)}`,
    "Origin": origin,
    "Sec-Fetch-Site": "cross-site",
  };
}

/* -------------------------------------------------------------------------- */
/*  Tier 1 — Static fetcher                                                  */
/* -------------------------------------------------------------------------- */

async function staticFetch(
  url: string,
  timeoutMs: number
): Promise<{ html: string; status: number; headers: Record<string, string> } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: STATIC_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const html = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    return { html, status: res.status, headers };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Tier 2 — Stealth fetcher                                                 */
/* -------------------------------------------------------------------------- */

async function stealthFetch(
  url: string,
  timeoutMs: number
): Promise<{ html: string; status: number; headers: Record<string, string> } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: stealthHeaders(url),
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const html = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    return { html, status: res.status, headers };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Tier 3 — Dynamic fetcher (Playwright)                                    */
/* -------------------------------------------------------------------------- */

/** CSS properties extracted per element for design analysis. */
const COMPUTED_PROPS = [
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing",
  "color", "backgroundColor", "backgroundImage",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "display", "position", "zIndex", "opacity", "transform", "transition", "animation",
  "gridTemplateColumns", "gridTemplateRows", "flexDirection", "justifyContent",
  "alignItems", "gap", "borderRadius", "boxShadow", "maxWidth", "width", "height",
] as const;

/**
 * CSS selectors for which we extract computed styles.
 * Kept small to limit Playwright evaluation overhead.
 */
const STYLE_SELECTORS = [
  "body", "h1", "h2", "h3", "p", "nav", "header", "main", "footer",
  "section:first-of-type", "section:nth-of-type(2)",
  "[class*='hero']", "[class*='cta']", "[class*='card']",
];

type DynResult = {
  html: string;
  status: number;
  headers: Record<string, string>;
  computedStyles?: import("./types").ComputedStyleMap;
  layoutMetrics?: LayoutMetrics;
  screenshots?: Screenshots;
};

async function dynamicFetch(
  url: string,
  opts: FetchOptions
): Promise<DynResult | null> {
  // Dynamic import so this module remains loadable without Playwright
  let withPage: typeof import("../server/browser").withPage;
  try {
    ({ withPage } = await import("../server/browser"));
  } catch {
    return null;
  }

  const timeoutMs = opts.timeout ?? 20_000;

  const result = await withPage(
    async (page) => {
      let status = 200;

      page.on("response", (res) => {
        if (res.url() === url || res.url().startsWith(url.split("?")[0])) {
          status = res.status();
        }
      });

      const ok = await page
        .goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs })
        .then(() => true)
        .catch(() => false);

      if (!ok) return null;

      // Wait for network idle (best-effort)
      if (opts.waitForNetworkIdle !== false) {
        await page.waitForLoadState("networkidle", { timeout: 6_000 }).catch(() => {});
      }

      // Scroll to trigger lazy-loading
      if (opts.scrollToBottom !== false) {
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            let y = 0;
            const step = () => {
              y += window.innerHeight;
              window.scrollTo(0, y);
              if (y < document.body.scrollHeight && y < 15_000) setTimeout(step, 100);
              else resolve();
            };
            step();
          });
        }).catch(() => {});
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
      }

      // Wait for optional selector
      if (opts.waitForSelector) {
        await page.waitForSelector(opts.waitForSelector, { timeout: 5_000 }).catch(() => {});
      }

      const html = await page.content();

      // Extract computed styles
      const styleSelectors = opts.computedStyleSelectors ?? STYLE_SELECTORS;
      const computedStyles: import("./types").ComputedStyleMap = {};
      for (const sel of styleSelectors) {
        try {
          const style = await page.evaluate((s) => {
            const el = document.querySelector(s);
            if (!el) return null;
            const cs = window.getComputedStyle(el);
            const props = [
              "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing",
              "color", "backgroundColor", "backgroundImage",
              "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
              "marginTop", "marginRight", "marginBottom", "marginLeft",
              "display", "position", "zIndex", "opacity", "transform", "transition",
              "animation", "gridTemplateColumns", "gridTemplateRows", "flexDirection",
              "justifyContent", "alignItems", "gap", "borderRadius", "boxShadow",
              "maxWidth", "width", "height",
            ] as const;
            return Object.fromEntries(props.map((p) => [p, cs[p as keyof CSSStyleDeclaration] ?? ""]));
          }, sel);
          if (style) computedStyles[sel] = style as unknown as ComputedStyle;
        } catch {
          // selector not found — skip
        }
      }

      // Extract layout metrics
      const maxElements = opts.maxLayoutElements ?? 200;
      let layoutMetrics: LayoutMetrics | undefined;
      try {
        const metrics = await page.evaluate((max: number) => {
          const viewport = { width: window.innerWidth, height: window.innerHeight };
          const dpr = window.devicePixelRatio;
          const docHeight = document.documentElement.scrollHeight;
          const elements: Array<{
            tagName: string;
            rect: { x: number; y: number; width: number; height: number; right: number; bottom: number };
            computedStyle: Record<string, string>;
            textSnippet: string;
          }> = [];
          const allEls = Array.from(document.querySelectorAll(
            "body,h1,h2,h3,h4,h5,h6,p,section,article,nav,header,footer,main,[class*=hero],[class*=hero],[class*=section],[class*=container]"
          )).slice(0, max);
          for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            const cs = window.getComputedStyle(el);
            elements.push({
              tagName: el.tagName.toLowerCase(),
              rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
              computedStyle: {
                fontFamily: cs.fontFamily,
                fontSize: cs.fontSize,
                fontWeight: cs.fontWeight,
                color: cs.color,
                backgroundColor: cs.backgroundColor,
                display: cs.display,
                position: cs.position,
                zIndex: cs.zIndex,
                maxWidth: cs.maxWidth,
                padding: cs.padding,
              },
              textSnippet: (el.textContent ?? "").trim().slice(0, 200),
            });
          }
          return { viewport, dpr, docHeight, elements };
        }, maxElements);

        layoutMetrics = {
          viewport: metrics.viewport,
          documentHeight: metrics.docHeight,
          devicePixelRatio: metrics.dpr,
          elements: metrics.elements.map((el, i) => ({
            selector: `${el.tagName}:nth-of-type(${i + 1})`,
            tagName: el.tagName,
            headingLevel: /^h[1-6]$/.test(el.tagName) ? parseInt(el.tagName[1]) : null,
            sectionRole: el.tagName === "nav" ? "nav" : el.tagName === "footer" ? "footer" : el.tagName === "header" ? "hero" : null,
            rect: el.rect,
            viewportWidthFraction: metrics.viewport.width > 0 ? el.rect.width / metrics.viewport.width : 0,
            topFraction: metrics.viewport.height > 0 ? el.rect.y / metrics.viewport.height : 0,
            computedStyle: el.computedStyle as unknown as ComputedStyle,
            textSnippet: el.textSnippet || undefined,
          })),
        };
      } catch {
        // layout metrics extraction failed — skip
      }

      // Screenshots
      let screenshots: Screenshots | undefined;
      if (opts.takeScreenshots) {
        screenshots = {};
        const viewports: Array<[keyof Screenshots, { width: number; height: number }]> = [
          ["desktop", { width: 1440, height: 900 }],
          ["tablet", { width: 768, height: 1024 }],
          ["mobile", { width: 390, height: 844 }],
        ];
        for (const [key, size] of viewports) {
          try {
            const t0 = Date.now();
            await page.setViewportSize(size);
            await page.waitForTimeout(200);
            const buf = await page.screenshot({ fullPage: false, type: "png" });
            screenshots[key] = {
              base64: buf.toString("base64"),
              width: size.width,
              height: size.height,
              capturedMs: Date.now() - t0,
            };
          } catch {
            // screenshot failed for this viewport
          }
        }
      }

      return { html, status, headers: {} as Record<string, string>, computedStyles, layoutMetrics, screenshots };
    },
    { timeoutMs: timeoutMs + 5_000 }
  );
  return result ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Tier selection & resource discovery                                       */
/* -------------------------------------------------------------------------- */

function discoverResources(html: string, baseUrl: string): import("./types").PageResources {
  const stylesheets: string[] = [];
  const scripts: string[] = [];
  const fonts: string[] = [];
  const images: string[] = [];
  const videos: string[] = [];

  const base = (() => {
    try { return new URL(baseUrl); } catch { return null; }
  })();

  function resolve(href: string): string | null {
    if (!href) return null;
    if (/^https?:\/\//i.test(href)) return href;
    if (!base) return null;
    try { return new URL(href, base.origin).href; } catch { return null; }
  }

  // Stylesheets
  let m: RegExpExecArray | null;
  const ssRe = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  while ((m = ssRe.exec(html))) { const r = resolve(m[1]); if (r) stylesheets.push(r); }
  // Scripts
  const scRe = /<script[^>]+src=["']([^"']+)["']/gi;
  while ((m = scRe.exec(html))) { const r = resolve(m[1]); if (r) scripts.push(r); }
  // Fonts (Google Fonts, Adobe)
  const fRe = /href=["']([^"']*fonts\.(googleapis|gstatic|adobe)\.com[^"']*)["']/gi;
  while ((m = fRe.exec(html))) fonts.push(m[1]);
  // Images
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((m = imgRe.exec(html))) { const r = resolve(m[1]); if (r && !/\.(svg|gif|ico)$/i.test(r)) images.push(r); }
  // Videos
  const vidRe = /<(?:video|source)[^>]+src=["']([^"']+)["']/gi;
  while ((m = vidRe.exec(html))) { const r = resolve(m[1]); if (r) videos.push(r); }

  const dedup = (arr: string[]): string[] => Array.from(new Set(arr));
  return {
    stylesheets: dedup(stylesheets).slice(0, 20),
    scripts: dedup(scripts).slice(0, 20),
    fonts: dedup(fonts).slice(0, 10),
    images: dedup(images).slice(0, 30),
    videos: dedup(videos).slice(0, 5),
  };
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export class ScraplingEngine {
  /**
   * Fetch a URL using the best available tier (auto-escalate).
   * Static → Stealth → Dynamic.
   */
  static async fetch(url: string, opts: FetchOptions = {}): Promise<RawPage> {
    const timeout = opts.timeout ?? 12_000;
    const t0 = Date.now();

    // ── Tier 1: Static ───────────────────────────────────────────────────
    const staticResult = await staticFetch(url, timeout);
    const fetchMs = Date.now() - t0;

    if (
      staticResult &&
      !isChallengeHtml(staticResult.html, staticResult.status) &&
      !needsDynamicFetch(staticResult.html)
    ) {
      const resources = discoverResources(staticResult.html, url);
      return {
        url,
        finalUrl: url,
        html: staticResult.html,
        mode: "static",
        httpStatus: staticResult.status,
        responseHeaders: staticResult.headers,
        blocked: false,
        challengeDetected: false,
        resources,
        timings: { fetchMs, totalMs: Date.now() - t0 },
      };
    }

    // ── Tier 2: Stealth ──────────────────────────────────────────────────
    const t1 = Date.now();
    const stealthResult = await stealthFetch(url, timeout);
    const stealthMs = Date.now() - t1;

    if (
      stealthResult &&
      !isChallengeHtml(stealthResult.html, stealthResult.status) &&
      !needsDynamicFetch(stealthResult.html)
    ) {
      const resources = discoverResources(stealthResult.html, url);
      return {
        url,
        finalUrl: url,
        html: stealthResult.html,
        mode: "stealth",
        httpStatus: stealthResult.status,
        responseHeaders: stealthResult.headers,
        blocked: false,
        challengeDetected: false,
        resources,
        timings: { fetchMs: fetchMs + stealthMs, totalMs: Date.now() - t0 },
      };
    }

    // ── Tier 3: Dynamic (Playwright) ─────────────────────────────────────
    const t2 = Date.now();
    const dynResult = await dynamicFetch(url, { ...opts, timeout: (opts.timeout ?? 20_000) });
    const renderMs = Date.now() - t2;

    if (dynResult) {
      const resources = discoverResources(dynResult.html, url);
      const challenged = isChallengeHtml(dynResult.html, dynResult.status);
      return {
        url,
        finalUrl: url,
        html: dynResult.html,
        mode: "dynamic",
        httpStatus: dynResult.status,
        responseHeaders: dynResult.headers,
        blocked: false,
        challengeDetected: challenged,
        computedStyles: dynResult.computedStyles,
        layoutMetrics: dynResult.layoutMetrics,
        screenshots: dynResult.screenshots,
        resources,
        timings: { fetchMs, renderMs, totalMs: Date.now() - t0 },
      };
    }

    // ── All tiers failed ─────────────────────────────────────────────────
    return {
      url,
      finalUrl: url,
      html: "",
      mode: "static",
      httpStatus: null,
      responseHeaders: {},
      blocked: true,
      challengeDetected: false,
      timings: { fetchMs, totalMs: Date.now() - t0 },
    };
  }

  /** Force a specific fetch tier without auto-escalation. */
  static async fetchWithMode(url: string, mode: FetchMode, opts: FetchOptions = {}): Promise<RawPage> {
    const timeout = opts.timeout ?? 12_000;
    const t0 = Date.now();

    if (mode === "dynamic") {
      const r = await dynamicFetch(url, { ...opts, timeout: opts.timeout ?? 20_000 });
      const fetchMs = Date.now() - t0;
      if (!r) {
        return { url, finalUrl: url, html: "", mode, httpStatus: null, responseHeaders: {}, blocked: true, challengeDetected: false, timings: { fetchMs, totalMs: fetchMs } };
      }
      const resources = discoverResources(r.html, url);
      return { url, finalUrl: url, html: r.html, mode, httpStatus: r.status, responseHeaders: r.headers, blocked: false, challengeDetected: isChallengeHtml(r.html, r.status), computedStyles: r.computedStyles, layoutMetrics: r.layoutMetrics, screenshots: r.screenshots, resources, timings: { fetchMs: 0, renderMs: fetchMs, totalMs: fetchMs } };
    }

    const fn = mode === "stealth" ? stealthFetch : staticFetch;
    const r = await fn(url, timeout);
    const fetchMs = Date.now() - t0;
    if (!r) {
      return { url, finalUrl: url, html: "", mode, httpStatus: null, responseHeaders: {}, blocked: true, challengeDetected: false, timings: { fetchMs, totalMs: fetchMs } };
    }
    const resources = discoverResources(r.html, url);
    return { url, finalUrl: url, html: r.html, mode, httpStatus: r.status, responseHeaders: r.headers, blocked: false, challengeDetected: isChallengeHtml(r.html, r.status), resources, timings: { fetchMs, totalMs: fetchMs } };
  }
}
