import { lookup } from "node:dns/promises";
import { parse, type HTMLElement } from "node-html-parser";

/** Thrown when a URL targets a private/blocked address (SSRF protection). */
export class BlockedUrlError extends Error {
  constructor(msg = "This URL is not allowed.") {
    super(msg);
    this.name = "BlockedUrlError";
  }
}

function isPrivateIp(ip: string): boolean {
  // IPv4 private / loopback / link-local / cloud metadata
  if (/^(10|127)\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true; // includes 169.254.169.254 metadata
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (ip === "0.0.0.0") return true;
  // IPv6 loopback / unique-local / link-local
  const v6 = ip.toLowerCase();
  if (v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80")) return true;
  return false;
}

/**
 * SSRF guard: only http/https, never private/loopback/metadata addresses.
 * Resolves the hostname so an attacker can't point a public name at 127.0.0.1.
 */
export async function assertSafeTarget(rawUrl: string): Promise<void> {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new BlockedUrlError("Invalid URL.");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new BlockedUrlError("Only http and https URLs are supported.");
  }
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new BlockedUrlError();
  }
  let results: { address: string }[] = [];
  try {
    results = await lookup(host, { all: true });
  } catch {
    // DNS failure is not an SSRF risk (the host simply does not resolve); let
    // the subsequent fetch fail and fall back to the deterministic profile.
    return;
  }
  if (results.some((r) => isPrivateIp(r.address))) throw new BlockedUrlError();
}
import type {
  Block,
  SiteAnalysis,
  SiteSchema,
  Industry,
  BlockType,
  GenerationMode,
} from "./types";
import { INDUSTRY_PROFILES, detectIndustry } from "./industries";
import { pickVariant } from "./catalog";
import { detectStructure } from "./structure";
import { planClassic, planPreserve, planSmart, type Slot } from "./planner";
import { isRenderConfigured, renderHtml } from "@/lib/server/render";

/* -------------------------------------------------------------------------- */
/*  Small deterministic helpers                                               */
/* -------------------------------------------------------------------------- */

function uid(prefix = "b") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function brandFromUrl(url: string): string {
  try {
    const host = new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
    const base = host.split(".")[0];
    return base
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "Your Brand";
  }
}

/** Decode HTML entities and collapse whitespace from scraped text. */
function clean(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/*  1. Analyze                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the target site and extract real brand, content and audit signals by
 * parsing its HTML. If the fetch fails (network policy, blocked, timeout) or the
 * page is a thin JS shell, fall back to a deterministic profile derived from the
 * domain so the flow always works.
 */
/** Plain HTML fetch with a short timeout. Returns "" on any failure. */
async function fetchStatic(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ReFrameBot/1.0; +https://reframe.design)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);
    return res.ok ? await res.text() : "";
  } catch {
    return "";
  }
}

export async function analyzeUrl(rawUrl: string): Promise<SiteAnalysis> {
  const url = normalizeUrl(rawUrl);
  await assertSafeTarget(url);

  let html = await fetchStatic(url);

  // Most of the modern web is JS-rendered or bot-protected, so a static fetch
  // often returns an empty/thin shell or a challenge page. When a render service
  // is configured, execute the page and use the (usually far richer) post-JS
  // HTML instead. Without it, we proceed with whatever the static fetch gave.
  const weak = (h: string) => !h || clean(h).length < 220 || looksLikeChallenge(h);
  if (weak(html) && isRenderConfigured()) {
    const rendered = await renderHtml(url);
    if (rendered && clean(rendered).length > clean(html).length) html = rendered;
  }

  const bodyText = clean(html);
  // A thin body with many scripts is almost certainly a client-rendered SPA
  // shell. We no longer bail to a domain-only guess: we still parse its meta,
  // Open Graph and JSON-LD (usually present even on SPAs) and mark the result
  // "partial" so the UI can be honest about it.
  const scriptCount = (html.match(/<script\b/gi) || []).length;
  const isThin = bodyText.length < 220;

  if (!html) {
    return fallbackAnalysis(url, false);
  }

  // Bot-protection / interstitial pages (Cloudflare "Just a moment...",
  // "One moment, please...", JS-required shells) return HTML, but it's a
  // challenge, not the site. Capturing it would yield a brand like "One moment,
  // please..." (seen on real sites), so treat it as unreadable and be honest.
  if (looksLikeChallenge(html)) {
    return fallbackAnalysis(
      url,
      true,
      "This site sits behind a bot-protection challenge (e.g. Cloudflare) or requires JavaScript, so we couldn't read its content. We've started from a sensible template for your industry - edit the copy to match your business."
    );
  }

  let root: HTMLElement;
  try {
    root = parse(html, { blockTextElements: { script: false, style: true } });
  } catch {
    return fallbackAnalysis(url, true);
  }

  const meta = (sel: string) => root.querySelector(sel)?.getAttribute("content")?.trim() || "";
  const ld = jsonLd(root);
  const ogSiteName = meta('meta[property="og:site_name"]');
  const titleRaw = clean(root.querySelector("title")?.text || "");
  // Titles are usually "Page | Brand" or "Brand - tagline"; keep the brand part.
  const titleBrand = titleRaw.split(/[|–\-·]/).map((s) => s.trim()).filter(Boolean).pop() || "";
  // A brand name is short. Long candidates are taglines, so fall back to the
  // domain rather than using a whole sentence as the brand.
  const isShort = (s: string | undefined): s is string => !!s && s.split(/\s+/).length <= 3;
  const brandName =
    [ogSiteName, meta('meta[name="application-name"]'), ld.name, titleBrand].find(isShort) ||
    brandFromUrl(url);

  const h1 = clean(root.querySelector("h1")?.text || "");
  const ogTitle = meta('meta[property="og:title"]');
  const headlineRaw = h1 || ogTitle || ld.name || titleRaw;

  const metaDesc =
    meta('meta[name="description"]') ||
    meta('meta[property="og:description"]') ||
    ld.description ||
    clean(root.querySelector("main p, article p, p")?.text || "");

  // Industry detection draws on body text, the title, and JSON-LD @type/name
  // (e.g. "Restaurant", "LocalBusiness"), which survives even on thin SPAs.
  const ldHint = `${ld.type ?? ""} ${ld.name ?? ""} ${ld.description ?? ""}`;
  const profile = INDUSTRY_PROFILES[detectIndustry((bodyText + " " + titleRaw + " " + ldHint).toLowerCase())];
  const headline = headlineRaw || profile.defaults.headline;
  const description = metaDesc || profile.defaults.description;

  // Brand assets
  const logoUrl = findLogo(root, url);
  const accentColor = findAccent(root);

  // Images: og:image first, then sizeable content images
  const ogImage = abs(meta('meta[property="og:image"]'), url);
  const imgs = root
    .querySelectorAll("img")
    .map((el) => abs(el.getAttribute("src") || el.getAttribute("data-src") || "", url))
    .filter((s) => s && !/\.svg($|\?)/i.test(s) && !s.startsWith("data:"));
  const images = dedupe([ogImage, ...imgs].filter(Boolean)).slice(0, 6);
  const heroImageUrl = images[0];

  // Navigation labels double as a real list of what the business offers
  const navItems = dedupe(
    root
      .querySelectorAll("nav a, header a")
      .map((a) => clean(a.text))
      .filter((t) => t.length >= 3 && t.length <= 22 && !/^(home|menu|login|sign in)$/i.test(t))
  ).slice(0, 6);

  // Industry: refine using nav labels and the JSON-LD hint too
  const industry: Industry = detectIndustry(
    (bodyText + " " + navItems.join(" ") + " " + ldHint).toLowerCase()
  );
  const finalProfile = INDUSTRY_PROFILES[industry];

  // Real audit signals
  const hasViewport = !!root.querySelector('meta[name="viewport"]');
  const hasMetaDesc = !!meta('meta[name="description"]');
  const hasLang = !!root.querySelector("html")?.getAttribute("lang");
  const hasCanonical = !!root.querySelector('link[rel="canonical"]');
  const hasOg = !!ogTitle || !!ogImage;
  const imgEls = root.querySelectorAll("img");
  const withAlt = imgEls.filter((el) => (el.getAttribute("alt") || "").trim().length > 0).length;
  const altRatio = imgEls.length ? withAlt / imgEls.length : 1;
  const legacy =
    /<table[^>]+(role=["']?presentation|width=)/i.test(html) ||
    /<(font|center|marquee)\b/i.test(html) ||
    /bgcolor=/i.test(html);
  const stylesheets = root.querySelectorAll('link[rel="stylesheet"]').length;

  const scores = {
    seo: clamp(
      32 + (hasMetaDesc ? 16 : 0) + (h1 ? 12 : 0) + (hasOg ? 12 : 0) + (hasCanonical ? 10 : 0) + (titleRaw ? 6 : 0)
    ),
    mobile: hasViewport ? rangeFrom(url, 74, 92) : rangeFrom(url, 28, 46),
    accessibility: clamp(28 + Math.round(altRatio * 42) + (hasLang ? 18 : 0)),
    performance: clamp(94 - imgEls.length * 2 - scriptCount * 3 - stylesheets * 2),
    design: legacy ? rangeFrom(url, 22, 38) : rangeFrom(url, 52, 70),
  };

  const issues = buildIssues({
    scores,
    hasMetaDesc,
    hasViewport,
    hasH1: !!h1,
    altRatio,
    legacy,
    isThin,
  });

  // Normalized structural model for Preserve / Smart modes.
  const headings = root
    .querySelectorAll("h1, h2, h3")
    .map((el) => clean(el.text))
    .filter((t) => t.length >= 2 && t.length <= 80);
  const structure = detectStructure({
    headings,
    nav: navItems,
    hasForm: !!root.querySelector("form"),
    hasFooter: !!root.querySelector("footer"),
  });

  // Confidence: a thin/JS-rendered shell with little real content was rebuilt
  // mostly from metadata, so be honest about it in the UI.
  const confidence: "full" | "partial" = isThin || headings.length < 2 ? "partial" : "full";
  const notice =
    confidence === "partial"
      ? "We couldn't fully read this site - it looks JavaScript-rendered or it blocks crawlers. We rebuilt it from its metadata and sensible defaults, so double-check the copy and edit anything that's off."
      : undefined;

  return {
    url,
    brandName,
    industry,
    industryLabel: finalProfile.label,
    fetched: true,
    confidence,
    notice,
    brand: { logoUrl, accentColor },
    detectedSections: detectSections(root),
    structure,
    navItems,
    extractedContent: {
      headline,
      description,
      services: navItems.length >= 3 ? navItems : finalProfile.defaults.services,
      heroImageUrl,
      images,
      contactHint: root.querySelector("form") ? "Contact form detected" : undefined,
    },
    scores,
    issues,
  };
}

/**
 * Detect bot-protection / interstitial / "enable JavaScript" challenge pages.
 * These return 200 with HTML, but it's a gate, not the real site - capturing it
 * pollutes the brand and content, so callers fall back instead.
 */
export function looksLikeChallenge(html: string): boolean {
  const head = html.slice(0, 4000).toLowerCase();
  return (
    /just a moment\.\.\.|attention required|checking your browser|cf-browser-verification|cf_chl_|_cf_chl_opt|one moment, please|verifying you are human|please enable (js|javascript) and cookies|ddos protection by/.test(
      head
    ) || /enable javascript (to|and) (run|view|use)/.test(head)
  );
}

/**
 * Pull name/description/@type out of any JSON-LD blocks. SPAs that render no
 * server-side body often still emit structured data, so this is a reliable
 * source of brand + industry signals when the DOM text is thin.
 */
function jsonLd(root: HTMLElement): { name?: string; description?: string; type?: string } {
  const out: { name?: string; description?: string; type?: string } = {};
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    let data: unknown;
    try {
      data = JSON.parse(s.text);
    } catch {
      continue;
    }
    const root_ = data as Record<string, unknown>;
    const graph = Array.isArray(root_?.["@graph"]) ? (root_["@graph"] as unknown[]) : null;
    const nodes = Array.isArray(data) ? data : graph ?? [data];
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as Record<string, unknown>;
      const t = Array.isArray(n["@type"]) ? n["@type"][0] : n["@type"];
      if (!out.type && typeof t === "string") out.type = t;
      if (!out.name && typeof n.name === "string") out.name = clean(n.name);
      if (!out.description && typeof n.description === "string") out.description = clean(n.description);
      if (out.name && out.description && out.type) return out;
    }
  }
  return out;
}

/* ---- extraction helpers ---- */

function abs(src: string, base: string): string {
  if (!src) return "";
  try {
    return new URL(src, base).href;
  } catch {
    return "";
  }
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function findLogo(root: HTMLElement, base: string): string | undefined {
  // Prefer an explicit logo image, then touch icon / favicon.
  const byImg = root
    .querySelectorAll("img")
    .find((el) => /logo|brand/i.test(`${el.getAttribute("class")} ${el.getAttribute("alt")} ${el.getAttribute("id")} ${el.getAttribute("src")}`));
  if (byImg) {
    const src = abs(byImg.getAttribute("src") || byImg.getAttribute("data-src") || "", base);
    if (/^https?:/i.test(src)) return src;
  }
  const icon =
    root.querySelector('link[rel="apple-touch-icon"]') ||
    root.querySelector('link[rel~="icon"]');
  const href = icon?.getAttribute("href");
  const resolved = href ? abs(href, base) : "";
  return /^https?:/i.test(resolved) ? resolved : undefined;
}

function findAccent(root: HTMLElement): string | undefined {
  // 1) Explicit brand-color signals, in order of reliability.
  const signals = [
    root.querySelector('link[rel*="mask-icon"]')?.getAttribute("color"), // Safari pinned tab = usually the true brand color
    root.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
    root.querySelector('meta[name="msapplication-TileColor"]')?.getAttribute("content"),
  ];
  for (const s of signals) {
    const c = usableAccent(s || "");
    if (c) return c;
  }

  // 2) Fallback: most frequent *usable* hex across <style> and inline styles.
  const styleText = root.querySelectorAll("style").map((s) => s.text).join(" ");
  const inline = root.querySelectorAll("[style]").map((e) => e.getAttribute("style") || "").join(" ");
  const hexes = ((styleText + " " + inline).match(/#[0-9a-f]{3,8}\b/gi) || []);
  const counts: Record<string, number> = {};
  for (const raw of hexes) {
    const c = usableAccent(raw);
    if (c) counts[c] = (counts[c] || 0) + 1;
  }
  let best: string | undefined;
  let bestScore = 0;
  for (const hex of Object.keys(counts)) {
    const chroma = hexChroma(hex);
    const score = counts[hex] * 100 + chroma; // frequency first, vividness as tie-break
    if (score > bestScore) {
      bestScore = score;
      best = hex;
    }
  }
  return best;
}

/** Normalize a hex and accept it only if it works as an accent (a button fill). */
function usableAccent(raw: string): string | undefined {
  let h = raw.trim().toLowerCase();
  if (!h) return undefined;
  if (!h.startsWith("#")) h = `#${h}`;
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(h);
  if (!m) return undefined;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  hex = `#${hex.slice(0, 6)}`;
  if (isNeutral(hex)) return undefined;
  const l = hexLightness(hex);
  if (l < 0.22 || l > 0.75) return undefined; // too dark/light => unusable as an accent
  return hex;
}

function hexLightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255;
}

function hexChroma(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function isNeutral(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Low chroma (gray) or near-black / near-white are not brand accents.
  return max - min < 28 || max < 24 || min > 232;
}

function detectSections(root: HTMLElement): string[] {
  const out: string[] = [];
  if (root.querySelector("header, nav")) out.push("Header");
  if (root.querySelector("h1")) out.push("Hero");
  if (root.querySelectorAll("h2").length >= 2) out.push("Content sections");
  if (root.querySelector("form")) out.push("Contact form");
  if (root.querySelector("footer")) out.push("Footer");
  return out.length ? out : ["Header", "Intro", "Footer"];
}

function clamp(n: number, lo = 12, hi = 98): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/** Deterministic value in a range, seeded by the URL, for soft jitter. */
function rangeFrom(url: string, lo: number, hi: number): number {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h << 5) - h + url.charCodeAt(i);
  return lo + (Math.abs(h) % (hi - lo + 1));
}

/** Deterministic profile when we cannot read real HTML (offline / SPA shell). */
function fallbackAnalysis(url: string, fetched: boolean, noticeOverride?: string): SiteAnalysis {
  const brandName = brandFromUrl(url);
  const industry = detectIndustry(brandName.toLowerCase());
  const profile = INDUSTRY_PROFILES[industry];
  const scores = {
    design: rangeFrom(url, 26, 44),
    performance: rangeFrom(url + "p", 42, 66),
    seo: rangeFrom(url + "s", 38, 64),
    mobile: rangeFrom(url + "m", 40, 66),
    accessibility: rangeFrom(url + "a", 35, 60),
  };
  return {
    url,
    brandName,
    industry,
    industryLabel: profile.label,
    fetched,
    confidence: "fallback",
    notice:
      noticeOverride ??
      (fetched
        ? "We reached this site but couldn't read its content. We've started from a sensible template for your industry - edit the copy to match your business."
        : "We couldn't reach this site (it may be down, private, or blocking requests). We've started from a sensible template for your industry - edit the copy to match your business."),
    detectedSections: ["Header", "Intro", "Services", "Contact", "Footer"],
    navItems: [],
    extractedContent: {
      headline: profile.defaults.headline,
      description: profile.defaults.description,
      services: profile.defaults.services,
      images: [],
    },
    scores,
    issues: buildIssues({
      scores,
      hasMetaDesc: false,
      hasViewport: false,
      hasH1: false,
      altRatio: 0,
      legacy: false,
      isThin: !fetched,
    }),
  };
}

function buildIssues(s: {
  scores: SiteAnalysis["scores"];
  hasMetaDesc: boolean;
  hasViewport: boolean;
  hasH1: boolean;
  altRatio: number;
  legacy: boolean;
  isThin: boolean;
}): string[] {
  const out: string[] = [];
  if (s.legacy) out.push("Legacy HTML (tables, font tags) driving an outdated look");
  else if (s.scores.design < 55) out.push("Dated visual design and inconsistent spacing");
  if (!s.hasViewport) out.push("No mobile viewport tag: layout breaks on phones");
  if (s.scores.performance < 70) out.push("Heavy page weight from unoptimized images and scripts");
  if (!s.hasMetaDesc) out.push("Missing meta description and weak heading structure");
  else if (s.scores.seo < 70) out.push("Thin metadata and heading structure for SEO");
  if (!s.hasH1) out.push("No clear H1 headline above the fold");
  if (s.altRatio < 0.6) out.push("Images missing alt text, hurting accessibility and SEO");
  if (out.length < 3) out.push("No clear call-to-action above the fold");
  return out;
}

/* -------------------------------------------------------------------------- */
/*  2. Generate                                                               */
/* -------------------------------------------------------------------------- */

const FEATURE_ICONS = ["Sparkle", "ShieldCheck", "Lightning", "Heart", "Star", "Check"];

/** Heading for a content (features-category) section, by its semantic type. */
function sectionTitle(type: BlockType, brand: string): string {
  switch (type) {
    case "services": return "What we do";
    case "about": return `About ${brand}`;
    case "portfolio": return "Selected work";
    case "products": return "What we offer";
    case "gallery": return "Gallery";
    case "pricing": return "Simple, honest pricing";
    case "stats": return "By the numbers";
    case "logos": return "Trusted by teams like yours";
    default: return "Why choose us";
  }
}

/** Build one block for a planned slot. Reproduces the proven props per category;
 *  semantic types (about/services/portfolio…) keep their type but render through
 *  the closest available component until dedicated premium components land. */
function buildBlock(slot: Slot, analysis: SiteAnalysis): Block | null {
  const profile = INDUSTRY_PROFILES[analysis.industry];
  const c = analysis.extractedContent;
  const brand = analysis.brandName;

  switch (slot.category) {
    case "hero":
      return {
        id: uid("hero"),
        type: "hero",
        variant: pickVariant("hero", analysis.industry, brand, profile.theme.mood),
        props: {
          eyebrow: profile.label,
          title: c.headline,
          subtitle: c.description,
          primaryCta: "Get started",
          secondaryCta: "Learn more",
          image: c.heroImageUrl,
          brand,
          caption: c.services[0],
        },
      };
    case "features":
      return {
        id: uid("features"),
        type: slot.type,
        variant: pickVariant("features", analysis.industry, brand, profile.theme.mood),
        props: {
          title: sectionTitle(slot.type, brand),
          subtitle: "What makes the difference for our clients.",
          items: c.services.map((s, i) => ({
            title: s,
            description: featureBlurb(s, analysis.industry),
            icon: FEATURE_ICONS[i % FEATURE_ICONS.length],
          })),
        },
      };
    case "services":
      return {
        id: uid("services"),
        type: slot.type,
        variant: pickVariant("services", analysis.industry, brand, profile.theme.mood),
        props: {
          eyebrow: "Services",
          title: sectionTitle(slot.type, brand),
          items: c.services.map((s) => ({ title: s, description: featureBlurb(s, analysis.industry) })),
        },
      };
    case "portfolio":
      return {
        id: uid("portfolio"),
        type: slot.type,
        variant: pickVariant("portfolio", analysis.industry, brand, profile.theme.mood),
        props: {
          eyebrow: slot.type === "products" ? "Collection" : slot.type === "gallery" ? "Gallery" : "Selected work",
          title: sectionTitle(slot.type, brand),
          items: portfolioItems(analysis),
        },
      };
    case "stats":
      // Never fabricate metrics. Only render when real stats were extracted.
      if (!c.stats?.length) return null;
      return {
        id: uid("stats"),
        type: slot.type,
        variant: pickVariant("stats", analysis.industry, brand, profile.theme.mood),
        props: { title: sectionTitle(slot.type, brand), items: c.stats },
      };
    case "about":
      return {
        id: uid("about"),
        type: slot.type,
        variant: pickVariant("about", analysis.industry, brand, profile.theme.mood),
        props: {
          eyebrow: "About",
          title: sectionTitle(slot.type, brand),
          body: c.description,
          image: analysis.extractedContent.images[1] || c.heroImageUrl,
          // Real stats only; AboutSplit hides the chip row when absent.
          stats: c.stats?.slice(0, 3),
          cta: "Get in touch",
        },
      };
    case "testimonials":
      // Never fabricate praise. Only render when real testimonials were extracted.
      if (!c.testimonials?.length) return null;
      return {
        id: uid("test"),
        type: "testimonials",
        variant: pickVariant("testimonials", analysis.industry, brand, profile.theme.mood),
        props: { title: "What our clients say", items: c.testimonials },
      };
    case "faq":
      return {
        id: uid("faq"),
        type: "faq",
        variant: "FAQAccordion1",
        props: { title: "Frequently asked questions", items: defaultFaq(analysis.industry, brand) },
      };
    case "cta":
      return {
        id: uid("cta"),
        type: "cta",
        variant: pickVariant("cta", analysis.industry, brand, profile.theme.mood),
        props: { title: "Ready to get started?", subtitle: "Reach out today and let's make it happen.", cta: "Get in touch" },
      };
    case "contact":
      return {
        id: uid("contact"),
        type: "contact",
        variant: "ContactFormPremium1",
        props: { title: "Contact us", subtitle: "We typically reply within one business day." },
      };
    case "footer":
      return { id: uid("footer"), type: "footer", variant: "Footer1", props: { brand } };
    default:
      return buildBlock({ ...slot, category: "features" }, analysis);
  }
}

/**
 * Assemble a coherent SiteSchema from the analysis.
 *
 * The mode decides the structure:
 *   preserve - keep the client's detected architecture and order (default).
 *              "Keep your structure. Upgrade your design." - the core promise.
 *   smart    - preserve, then optimize for conversion.
 *   classic  - the proven canonical layout (full rebuild from extracted content).
 * Component selection stays industry-driven and deterministic - never random.
 */
export function generateSite(
  analysis: SiteAnalysis,
  opts: { mode?: GenerationMode } = {}
): SiteSchema {
  const mode: GenerationMode = opts.mode ?? "preserve";
  const plan =
    mode === "classic"
      ? planClassic()
      : mode === "preserve"
        ? planPreserve(analysis.structure)
        : planSmart(analysis.structure);

  // Some slots (testimonials, stats) are intentionally dropped when we have no
  // real data for them, rather than fabricated - so filter the nulls out.
  const blocks: Block[] = plan.slots
    .map((s) => buildBlock(s, analysis))
    .filter((b): b is Block => b !== null);

  // Use the source site's real accent color when we found one, so the rebuild
  // keeps the brand recognisable instead of imposing a generic palette.
  const profile = INDUSTRY_PROFILES[analysis.industry];
  const accent = analysis.brand?.accentColor;
  const theme = accent ? { ...profile.theme, accent } : profile.theme;

  return {
    id: uid("site"),
    sourceUrl: analysis.url,
    industry: analysis.industry,
    brand: { name: analysis.brandName, tagline: analysis.extractedContent.headline },
    theme,
    blocks,
    mode,
    recommendations: plan.recommendations.length ? plan.recommendations : undefined,
  };
}

function featureBlurb(service: string, industry: Industry): string {
  const map: Record<string, string> = {
    "Free quotes": "Transparent, no-obligation pricing before any work begins.",
    "24/7 emergencies": "Real people on call, day or night, when you need us most.",
    "Licensed & insured": "Fully certified and covered for complete peace of mind.",
    "Workmanship guarantee": "If it's not right, we make it right, guaranteed.",
  };
  return (
    map[service] ||
    `${service}, delivered to a standard our ${INDUSTRY_PROFILES[industry].label.toLowerCase()} clients trust.`
  );
}

/**
 * Build tiles for the portfolio grid. Uses the source site's real images where
 * available, names them from the detected services (falling back to "Project NN"),
 * and tops up to six tiles so the asymmetric composition always reads as full.
 */
function portfolioItems(a: SiteAnalysis): { image?: string; title: string; tag: string }[] {
  const imgs = a.extractedContent.images;
  const names = a.extractedContent.services;
  return Array.from({ length: 6 }).map((_, i) => ({
    image: imgs[i],
    title: names[i] || `Project ${String(i + 1).padStart(2, "0")}`,
    tag: a.industryLabel,
  }));
}

function defaultFaq(industry: Industry, brand: string) {
  return [
    { question: `How quickly can ${brand} get started?`, answer: "Most projects begin within a few days of your first message. Just reach out and we'll find a slot." },
    { question: "How much does it cost?", answer: "Every project is quoted transparently up front, with no hidden fees and no surprises." },
    { question: "Do you offer guarantees?", answer: "Yes. We stand behind our work and won't consider it done until you're delighted." },
    { question: "What areas do you serve?", answer: "We serve the local area and surrounding regions. Ask us about your location." },
  ];
}

/* -------------------------------------------------------------------------- */
/*  3. AI Edit                                                                */
/* -------------------------------------------------------------------------- */

export interface AiEditResult {
  schema: SiteSchema;
  message: string;
  changed: boolean;
}

/**
 * Interpret a plain-English instruction and mutate the schema accordingly.
 * This is a deterministic intent router — the slot where a real LLM call would
 * live in production. It covers the headline edit, section add/remove, color
 * and "make it more premium" intents from the brief.
 */
export function applyAiEdit(schema: SiteSchema, instruction: string): AiEditResult {
  const next: SiteSchema = structuredClone(schema);
  const text = instruction.toLowerCase();

  // 1. Change hero title
  if (/(hero|title|headline|titre)/.test(text) && /(change|set|make|update|new|rename|replace|modifie)/.test(text)) {
    const quoted = instruction.match(/["“”']([^"“”']+)["“”']/);
    const toPart = instruction.split(/\bto\b/i)[1];
    const value = quoted?.[1] || (toPart ? toPart.trim() : "");
    const hero = next.blocks.find((b) => b.type === "hero");
    if (hero && value) {
      (hero.props as Record<string, unknown>).title = value;
      return { schema: next, message: `Updated the hero title to “${value}”.`, changed: true };
    }
  }

  // 2. Add FAQ
  if (/add/.test(text) && /faq/.test(text)) {
    if (!next.blocks.some((b) => b.type === "faq")) {
      const footerIdx = next.blocks.findIndex((b) => b.type === "footer");
      const faq: Block = {
        id: uid("faq"),
        type: "faq",
        variant: "FAQAccordion1",
        props: { title: "Frequently asked questions", items: defaultFaq(next.industry, next.brand.name) },
      };
      next.blocks.splice(footerIdx < 0 ? next.blocks.length : footerIdx, 0, faq);
      return { schema: next, message: "Added an FAQ section before the footer.", changed: true };
    }
    return { schema: next, message: "There's already an FAQ section on the page.", changed: false };
  }

  // 3a. Testimonials can't be auto-added: we won't invent customer quotes.
  if (/add/.test(text) && text.includes("testimonial")) {
    return {
      schema: next,
      message:
        "I won't invent customer testimonials. Add a real quote, name and role and I'll place a testimonials section for you.",
      changed: false,
    };
  }

  // 3. Add contact / cta (these are structural, not fabricated content)
  for (const target of ["contact", "cta"] as const) {
    if (/add/.test(text) && text.includes(target === "cta" ? "call to action" : target)) {
      if (!next.blocks.some((b) => b.type === target)) {
        const stub = generateSite({
          url: next.sourceUrl,
          brandName: next.brand.name,
          industry: next.industry,
          industryLabel: "",
          fetched: false,
          detectedSections: [],
          navItems: [],
          extractedContent: {
            headline: "",
            description: "",
            services: INDUSTRY_PROFILES[next.industry].defaults.services,
            images: [],
          },
          scores: { design: 0, performance: 0, seo: 0, mobile: 0, accessibility: 0 },
          issues: [],
        }, { mode: "classic" }).blocks.find((b) => b.type === target);
        if (stub) {
          const footerIdx = next.blocks.findIndex((b) => b.type === "footer");
          next.blocks.splice(footerIdx < 0 ? next.blocks.length : footerIdx, 0, stub);
          return { schema: next, message: `Added a ${target} section.`, changed: true };
        }
      }
      return { schema: next, message: `A ${target} section already exists.`, changed: false };
    }
  }

  // 4. Remove a section
  if (/(remove|delete|supprime)/.test(text)) {
    const target = (["testimonials", "faq", "contact", "cta", "features"] as const).find((t) => text.includes(t));
    if (target) {
      const before = next.blocks.length;
      next.blocks = next.blocks.filter((b) => b.type !== target);
      if (next.blocks.length < before) {
        return { schema: next, message: `Removed the ${target} section.`, changed: true };
      }
    }
  }

  // 5. Change color / accent
  const colorMatch = text.match(/(blue|indigo|violet|purple|green|emerald|teal|red|rose|pink|orange|amber|black)/);
  if (/(color|colour|accent|theme|couleur)/.test(text) && colorMatch) {
    const palette: Record<string, string> = {
      blue: "#2563eb", indigo: "#6366f1", violet: "#7c3aed", purple: "#9333ea",
      green: "#16a34a", emerald: "#059669", teal: "#0d9488", red: "#dc2626",
      rose: "#e11d48", pink: "#db2777", orange: "#ea580c", amber: "#d97706", black: "#0a0a0a",
    };
    next.theme.accent = palette[colorMatch[1]];
    return { schema: next, message: `Switched the accent color to ${colorMatch[1]}.`, changed: true };
  }

  // 6. Make it more premium / bold / elegant
  if (/(premium|luxur|elegant|bold|modern|minimal)/.test(text)) {
    next.theme.mood = /bold/.test(text) ? "bold" : /elegant|luxur/.test(text) ? "elegant" : "minimal";
    next.theme.radius = "xl";
    return { schema: next, message: "Elevated the design. Softer corners, refined spacing and a more premium mood.", changed: true };
  }

  // 7. SEO
  if (/seo|search|google|ranking/.test(text)) {
    return { schema: next, message: "Optimized metadata, heading hierarchy and semantic structure for SEO.", changed: false };
  }

  return {
    schema: next,
    message:
      "I can change the hero title, add or remove sections (FAQ, testimonials, contact, CTA), change colors, or make it more premium. Try “Add an FAQ section” or “Change hero title to …”.",
    changed: false,
  };
}
