/**
 * ScraplingEngine types — the TypeScript-native 3-tier fetching layer.
 *
 * Mirrors the Scrapling conceptual model (Fetcher → StealthyFetcher →
 * DynamicFetcher) using Node.js-native primitives: fetch() for the first
 * two tiers, Playwright for the dynamic tier. No Python runtime required.
 *
 * Every analyzer in src/lib/extraction/v7/ consumes a RawPage produced
 * by this layer — it is the single point of contact between "how we fetch"
 * and "how we understand design."
 */

/* -------------------------------------------------------------------------- */
/*  Fetch modes                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Three-tier fetching strategy:
 *  static  — native fetch() with browser-like request headers. Fast, no JS.
 *  stealth — fetch() with rotating UA, randomised timing, referrer spoofing.
 *            Handles light bot-protection without a headless browser.
 *  dynamic — Playwright Chromium. Full JS execution, computed styles,
 *            layout measurements, screenshots, network-idle wait.
 */
export type FetchMode = "static" | "stealth" | "dynamic";

/* -------------------------------------------------------------------------- */
/*  Fetch options                                                             */
/* -------------------------------------------------------------------------- */

export interface FetchOptions {
  /** ms; default 12 000. */
  timeout?: number;
  /** Capture desktop + tablet + mobile screenshots (dynamic mode only). */
  takeScreenshots?: boolean;
  /** Wait for networkidle before capturing (dynamic mode only). */
  waitForNetworkIdle?: boolean;
  /** CSS selector to wait for before capturing (dynamic mode only). */
  waitForSelector?: string;
  /** Scroll the full page to trigger lazy-loading (dynamic mode only). */
  scrollToBottom?: boolean;
  /**
   * Extract computed styles for the listed CSS selectors (dynamic only).
   * Leave empty to skip. Extracting too many selectors adds latency.
   */
  computedStyleSelectors?: string[];
  /** Max number of elements to measure for layout metrics. Default 200. */
  maxLayoutElements?: number;
}

/* -------------------------------------------------------------------------- */
/*  Raw output                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The single output type from ScraplingEngine.fetch().
 * All downstream analyzers operate on this object.
 */
export interface RawPage {
  /** Requested URL (before redirects). */
  url: string;
  /** Resolved URL after all redirects. */
  finalUrl: string;
  /** Final rendered HTML (post-JS for dynamic mode). */
  html: string;
  /** Tier that was actually used. */
  mode: FetchMode;
  httpStatus: number | null;
  responseHeaders: Record<string, string>;

  /** True when every fetch tier was denied (4xx, network error). */
  blocked: boolean;
  /**
   * True when a bot-protection challenge (Cloudflare, Turnstile, etc.)
   * was detected in the response. A challenge page is technically a
   * successful fetch, but the HTML carries no site content.
   */
  challengeDetected: boolean;

  /**
   * CSS computed-style snapshots for requested selectors (dynamic only).
   * Key = CSS selector; value = { property: computedValue }.
   */
  computedStyles?: ComputedStyleMap;

  /** Actual layout measurements from the rendered viewport (dynamic only). */
  layoutMetrics?: LayoutMetrics;

  /** PNG screenshots captured at three viewports (dynamic only, opt-in). */
  screenshots?: Screenshots;

  /** URLs of external resources discovered in the page. */
  resources?: PageResources;

  timings: {
    fetchMs: number;
    renderMs?: number;
    screenshotMs?: number;
    totalMs: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Computed styles                                                           */
/* -------------------------------------------------------------------------- */

/** CSS selector → map of CSS property names → computed string values. */
export type ComputedStyleMap = Record<string, ComputedStyle>;

/** The subset of CSS properties extracted for design analysis. */
export interface ComputedStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  backgroundColor: string;
  backgroundImage: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  display: string;
  position: string;
  zIndex: string;
  opacity: string;
  transform: string;
  transition: string;
  animation: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap: string;
  borderRadius: string;
  boxShadow: string;
  maxWidth: string;
  width: string;
  height: string;
}

/* -------------------------------------------------------------------------- */
/*  Layout metrics                                                            */
/* -------------------------------------------------------------------------- */

export interface LayoutMetrics {
  viewport: { width: number; height: number };
  documentHeight: number;
  devicePixelRatio: number;
  /** Top-N elements measured via getBoundingClientRect(). */
  elements: ElementMetric[];
}

export interface ElementMetric {
  /** Identifies the element in the DOM tree. */
  selector: string;
  tagName: string;
  /** Heading level if tagName is H1–H6; null otherwise. */
  headingLevel: number | null;
  /** Inferred section role: "hero", "nav", "footer", or null. */
  sectionRole: string | null;
  rect: BoundingRect;
  /** Fraction of viewport width occupied. 0–1. */
  viewportWidthFraction: number;
  /** Fraction of viewport height where the element begins. 0–N (>1 = below fold). */
  topFraction: number;
  computedStyle: ComputedStyle;
  /** Text content (trimmed), max 200 chars. */
  textSnippet?: string;
}

export interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
  /** x + width */
  right: number;
  /** y + height */
  bottom: number;
}

/* -------------------------------------------------------------------------- */
/*  Screenshots                                                               */
/* -------------------------------------------------------------------------- */

export interface Screenshots {
  /** 1440 × 900 */
  desktop?: ScreenshotData;
  /** 768 × 1024 */
  tablet?: ScreenshotData;
  /** 390 × 844 */
  mobile?: ScreenshotData;
}

export interface ScreenshotData {
  /** base64-encoded PNG */
  base64: string;
  width: number;
  height: number;
  /** ms taken */
  capturedMs: number;
}

/* -------------------------------------------------------------------------- */
/*  Resources                                                                 */
/* -------------------------------------------------------------------------- */

export interface PageResources {
  stylesheets: string[];
  scripts: string[];
  fonts: string[];
  images: string[];
  videos: string[];
}
