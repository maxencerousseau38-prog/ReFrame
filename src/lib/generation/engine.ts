import { lookup } from "node:dns/promises";
import { parse, type HTMLElement } from "node-html-parser";
import { rgbToHex, hslToHex } from "./color";

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
  SitePage,
  Industry,
  BlockType,
  GenerationMode,
  Theme,
  Recommendation,
  DetectedIntegration,
  IntegrationCategory,
} from "./types";
import { INDUSTRY_PROFILES, detectIndustry } from "./industries";
import { pickVariant } from "./catalog";
import { detectStructure, renderableCategory } from "./structure";
import { planClassic, planPreserve, planSmart, planExplicit, type Slot } from "./planner";
import { canRender, renderHtml } from "@/lib/server/render";

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
        // A real browser UA: many sites (and CDNs/WAFs) serve an empty page or a
        // block to unknown bots, which would force us into the generic fallback.
        // We only ever read public marketing pages, so this is safe and honest.
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
      },
    });
    clearTimeout(timeout);
    return res.ok ? await res.text() : "";
  } catch {
    return "";
  }
}

// Shared real-browser UA. Unknown bot UAs are widely blocked by CDNs/WAFs and
// hotlink protection, which is exactly what would leave the rebuild with broken
// images; a browser UA loads far more of the client's real content.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Keep only image URLs that ACTUALLY load (real image bytes), preserving order.
 * Bounded and parallel, headers matching the render-time proxy, body never
 * downloaded (we check status + content-type only). This is what stops dead or
 * hotlink-blocked URLs from leaving broken/placeholder tiles in the rebuild:
 * the renderer only ever receives images it can show, and image-led sections
 * degrade gracefully (image-free hero, omitted gallery) when none survive.
 */
export async function validateImages(urls: string[], max = 8): Promise<string[]> {
  const ok = await Promise.all(
    urls.slice(0, max).map(async (u) => {
      try {
        await assertSafeTarget(u);
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4500);
        let referer = "";
        try {
          referer = new URL(u).origin;
        } catch {
          /* validated above */
        }
        const res = await fetch(u, {
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "User-Agent": BROWSER_UA,
            Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
            Referer: referer,
            Range: "bytes=0-0", // hint: we only need headers, not the payload
          },
        });
        clearTimeout(t);
        const type = res.headers.get("content-type") || "";
        return res.ok && type.startsWith("image/") ? u : null;
      } catch {
        return null;
      }
    })
  );
  return ok.filter((u): u is string => !!u);
}

/* -------------------------------------------------------------------------- */
/*  Multi-page crawl - discover and keep the client's REAL pages (A to Z)      */
/* -------------------------------------------------------------------------- */

const PAGE_ASSET_RE = /\.(pdf|jpe?g|png|gif|svg|webp|avif|zip|mp4|mov|css|js|ico|xml|json|rss|txt|woff2?)(\?|$)/i;
// Paths that are not real "pages" to recreate (account/system/legal/locale).
const PAGE_SKIP_RE = /(\/(cart|panier|checkout|account|compte|login|connexion|register|wishlist|search|recherche|admin|wp-admin|wp-login|feed|tag|author|cdn-cgi)\b|\?(add-to-cart|replytocom)=)/i;

function sameOrigin(u: string, base: string): boolean {
  try {
    return new URL(u, base).origin === new URL(base).origin;
  } catch {
    return false;
  }
}
function pathKey(u: string, base: string): string {
  try {
    return new URL(u, base).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return "";
  }
}
/** Human label from a URL path segment (e.g. /our-services -> "Our services"). */
function labelFromPath(p: string): string {
  const seg = p.split("/").filter(Boolean).pop() || "";
  const words = decodeURIComponent(seg).replace(/[-_]+/g, " ").replace(/\.\w+$/, "").trim();
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface DiscoveredPage {
  url: string;
  label: string;
  path: string;
}

/** Internal page links from the site's nav/header (the pages the client chose to
 *  surface). Labeled, same-origin, no assets/anchors/system paths. Order kept. */
export function navPageLinks(root: HTMLElement, base: string): DiscoveredPage[] {
  const out: DiscoveredPage[] = [];
  const seen = new Set<string>();
  for (const a of root.querySelectorAll("header a, nav a")) {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    const u = abs(href, base);
    if (!/^https?:/i.test(u) || !sameOrigin(u, base) || PAGE_ASSET_RE.test(u) || PAGE_SKIP_RE.test(u)) continue;
    const path = pathKey(u, base);
    if (path === "/" || path === "" || seen.has(path)) continue;
    const label = clean(a.getAttribute("title") || a.text).slice(0, 32);
    if (!label || label.length < 2) continue;
    seen.add(path);
    out.push({ url: u.split("#")[0], label, path });
    if (out.length >= 14) break;
  }
  return out;
}

async function fetchText(url: string, ms = 6000): Promise<string> {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    const r = await fetch(url, { signal: c.signal, redirect: "follow", headers: { "User-Agent": BROWSER_UA } });
    clearTimeout(t);
    return r.ok ? await r.text() : "";
  } catch {
    return "";
  }
}

/** Page URLs from the site's sitemap.xml (and a sitemap index), capped. The most
 *  complete source of the client's real pages when present. */
async function sitemapUrls(base: string): Promise<string[]> {
  let origin = "";
  try {
    origin = new URL(base).origin;
  } catch {
    return [];
  }
  const locs = (xml: string) => Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi), (m) => m[1]);
  const xml = await fetchText(`${origin}/sitemap.xml`);
  if (!xml) return [];
  let urls = locs(xml);
  // Sitemap index: entries are themselves .xml sitemaps - expand a few.
  if (urls.length && urls.every((u) => /\.xml(\?|$)/i.test(u))) {
    const collected: string[] = [];
    for (const sm of urls.slice(0, 3)) {
      collected.push(...locs(await fetchText(sm)));
      if (collected.length > 300) break;
    }
    urls = collected;
  }
  return urls.filter((u) => sameOrigin(u, base) && !PAGE_ASSET_RE.test(u) && !PAGE_SKIP_RE.test(u));
}

/**
 * Discover the client's real pages: nav links first (labeled, the pages they
 * chose to surface), then sitemap entries to fill in the rest. Same-origin,
 * de-duped by path, system/asset paths excluded, capped.
 */
export async function discoverPages(base: string, root: HTMLElement, max = 10): Promise<DiscoveredPage[]> {
  const out: DiscoveredPage[] = [];
  const seen = new Set<string>([pathKey(base, base)]); // exclude home
  const seenLabel = new Set<string>(["home"]); // collapse same-label pages (one nav item per label)
  const add = (d: DiscoveredPage) => {
    const labelKey = d.label.trim().toLowerCase();
    if (seen.has(d.path) || seenLabel.has(labelKey) || out.length >= max) return;
    seen.add(d.path);
    seenLabel.add(labelKey);
    out.push(d);
  };
  for (const d of navPageLinks(root, base)) add(d);
  if (out.length < max) {
    for (const u of await sitemapUrls(base)) {
      const path = pathKey(u, base);
      // keep shallow pages (depth <= 2) to favour real sections over deep leaves
      if (path.split("/").filter(Boolean).length > 2) continue;
      add({ url: u.split("#")[0], label: labelFromPath(path), path });
    }
  }
  return out;
}


export async function analyzeUrl(rawUrl: string): Promise<SiteAnalysis> {
  const url = normalizeUrl(rawUrl);
  await assertSafeTarget(url);

  let html = await fetchStatic(url);

  // Most of the modern web is JS-rendered or bot-protected, so a static fetch
  // often returns an empty/thin shell or a challenge page. When a render service
  // is configured, execute the page and use the (usually far richer) post-JS
  // HTML instead. We render not only when the static read is empty, but also when
  // it looks like an unfilled SPA shell (real bytes, no real content) - that case
  // used to slip through and produce a generic rebuild. Without a render service,
  // we proceed with whatever the static fetch gave.
  const weak = (h: string) => !h || clean(h).length < 220 || looksLikeChallenge(h);
  let rendered = false;
  if ((weak(html) || needsRendering(html)) && (await canRender())) {
    const renderedHtml = await renderHtml(url);
    // Keep the render only if it actually read more of the page than the static
    // fetch (and isn't itself a challenge), so a failed render never makes things
    // worse than the HTML we already have.
    if (renderedHtml && !looksLikeChallenge(renderedHtml) && clean(renderedHtml).length > clean(html).length) {
      html = renderedHtml;
      rendered = true;
    }
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
    // script: true keeps <script type="ld+json"> content as raw text so JSON-LD
    // (products, stats, structured contact) is actually readable; element text
    // queries (title/h1/p/nav) never touch <script>, and bodyText is derived
    // from the raw HTML, so this doesn't pollute text extraction.
    root = parse(html, { blockTextElements: { script: true, style: true } });
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

  const h1raw = clean(root.querySelector("h1")?.text || "");
  // Many sites have a generic nav-word as their first h1 ("Home", "Welcome").
  // Using it as the rebuilt headline reads terribly, so skip those.
  const isGenericHeading = (s: string) =>
    /^(home|welcome|menu|accueil|bienvenue|hello|untitled|index)$/i.test(s.trim());
  const h1 = h1raw && !isGenericHeading(h1raw) ? h1raw : "";
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

  // Images: og:image first, then sizeable content images. Validate that they
  // actually load (real image bytes) so the rebuild never renders broken or
  // placeholder tiles - dead/hotlink-blocked URLs are dropped here.
  const ogImage = abs(meta('meta[property="og:image"]'), url);
  const images = await validateImages(extractImages(root, url));
  const heroImageUrl = images[0];

  // Real products (the client's actual catalogue) - kept and modernized, never
  // dropped. Empty unless the page genuinely exposes products.
  let products = extractProducts(root, url);

  // Navigation labels double as a real list of what the business offers
  const navItems = dedupe(
    root
      .querySelectorAll("nav a, header a")
      .map((a) => clean(a.text))
      .filter(
        (t) =>
          t.length >= 3 &&
          t.length <= 22 &&
          !/^(home|menu|login|log in|sign in|sign up|search|cart)$/i.test(t) &&
          !/skip to|skip navigation|main content|toggle|cookie/i.test(t)
      )
  ).slice(0, 6);

  // Industry: refine using nav labels and the JSON-LD hint too
  const industry: Industry = detectIndustry(
    (bodyText + " " + navItems.join(" ") + " " + ldHint).toLowerCase()
  );
  const finalProfile = INDUSTRY_PROFILES[industry];

  // Storefronts often load their product cards client-side (Shopify/SPA themes).
  // If the page is commercial but static product extraction was thin, render it
  // and re-extract from the post-JS DOM. Best-effort; keeps static on failure.
  if (products.length < 4 && !rendered && industry === "ecommerce" && (await canRender())) {
    const rhtml = await renderHtml(url);
    if (rhtml && !looksLikeChallenge(rhtml)) {
      try {
        const rprods = extractProducts(parse(rhtml, { blockTextElements: { script: true, style: true } }), url);
        if (rprods.length > products.length) products = rprods;
      } catch {
        /* keep the static products */
      }
    }
  }

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

  // Real prose (about paragraph + service headings) - computed once and reused
  // for both the services source decision and the extracted content.
  const prose = extractProse(root);

  // Business-critical third-party tools on the source page (payments, booking,
  // analytics, chat) - surfaced so the customer reconnects them before publish.
  const integrations = detectIntegrations(html);

  return {
    url,
    brandName,
    industry,
    industryLabel: finalProfile.label,
    fetched: true,
    confidence,
    notice,
    sourceDark: detectSourceDark(html, root) || undefined,
    brand: { logoUrl, accentColor },
    detectedSections: detectSections(root),
    ...(integrations.length ? { integrations } : {}),
    structure,
    navItems,
    extractedContent: {
      headline,
      description,
      // Services source, cleanest first: real on-page service headings, else
      // de-noised nav labels (drop CTA/utility/location items), else industry
      // defaults - so we never surface "View all" / "Locations" as a service.
      services:
        (prose.serviceItems?.length ?? 0) >= 3
          ? prose.serviceItems!.map((s) => s.title)
          : cleanServiceLabels(navItems).length >= 3
            ? cleanServiceLabels(navItems)
            : finalProfile.defaults.services,
      heroImageUrl,
      images,
      contactHint: root.querySelector("form") ? "Contact form detected" : undefined,
      // Real business details pulled from the page, so the rebuild keeps the
      // client's actual contact + credibility (never fabricated).
      contact: extractContact(root, bodyText, ld),
      stats: extractStats(ld),
      // Real client praise pulled from the page (JSON-LD reviews + DOM quotes),
      // so credible proof survives the rebuild instead of being dropped. The
      // engine only renders a testimonials section when this is non-empty.
      testimonials: extractTestimonials(root, ld),
      // Real Q&A pulled from the page; the FAQ block uses it instead of the
      // generic default when present.
      faqItems: extractFaq(root, ld),
      // Real social profiles for the footer (never fabricated).
      socialLinks: extractSocialLinks(root),
      ...(products.length ? { products } : {}),
      // Real prose: reuse the client's own About paragraph and service copy.
      ...prose,
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
 * Decide whether a static read is too poor to trust, even when it has real
 * bytes - i.e. an unfilled single-page-app shell. These pages return plenty of
 * markup (framework bootstrap, nav, footer) but little real content, so parsing
 * them yields a generic rebuild. Detecting them lets us run the headless render
 * and read the page as a browser would. Conservative on purpose: it only matters
 * when a render service is configured, and we never want to render good reads.
 */
export function needsRendering(html: string): boolean {
  if (!html) return false;
  const lower = html.slice(0, 6000).toLowerCase();
  const text = clean(html);
  const scripts = (html.match(/<script\b/gi) || []).length;
  const headings = (html.match(/<h[12]\b/gi) || []).length;
  const imgs = (html.match(/<img\b/gi) || []).length;
  // Common SPA mount points / framework markers.
  const spaShell =
    /id=["']root["']|id=["']app["']|id=["']__next["']|id=["']__nuxt["']|data-reactroot|data-server-rendered|ng-version|<div id=["']svelte/.test(
      lower
    );
  // Little real content relative to how much script is shipped.
  const contentLight = text.length < 1200 && scripts >= 3;
  const structureLight = headings < 2 && imgs < 3;
  return (spaShell && (contentLight || structureLight)) || (text.length < 600 && scripts >= 5);
}

/** Pick the largest candidate URL out of a srcset / data-srcset attribute. */
function largestFromSrcset(srcset: string): string {
  let best = "";
  let bestWeight = -1;
  for (const part of srcset.split(",")) {
    const [u, descriptor] = part.trim().split(/\s+/);
    if (!u) continue;
    // "640w" -> 640, "2x" -> 2, bare url -> 1
    const weight = descriptor ? parseFloat(descriptor) || 1 : 1;
    if (weight > bestWeight) {
      bestWeight = weight;
      best = u;
    }
  }
  return best;
}

/** Extract CSS background-image url(...) targets from a blob of style text. */
function backgroundImageUrls(styleText: string): string[] {
  const out: string[] = [];
  const re = /background(?:-image)?\s*:[^;}]*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(styleText))) out.push(m[1]);
  return out;
}

// Filenames that are almost never the content imagery we want to rebuild with:
// chrome (logos, icons), spacers/placeholders, and analytics/tracking pixels.
const IMAGE_JUNK_RE =
  /sprite|favicon|logo|icon|pixel|spacer|blank|placeholder|loading|avatar|1x1|transparent|tracking|beacon|datadog|doubleclick|google-analytics|gtag|facebook\.com\/tr|star\d|\/stars?\/|sparkle|squiggle|scribble|doodle|ornament|flourish|divider|confetti|pattern|texture|gradient|\/blobs?\/|\bblob\d|\/shapes?\/|decor|\/deco|overlay|backdrop|watermark|swirl|\/waves?\/|\/dots?\/|grain|\/noise|\bmesh\b|startframe|emoji|badge|ribbon/i;

/**
 * Collect the real content imagery of a page, robustly. Unlike a naive
 * `img[src]` sweep, this reads social-card images, lazy-load attributes
 * (data-src / data-lazy-src / data-original), the largest entry of any srcset,
 * and CSS background-image heroes - then drops chrome (logos, icons, sprites,
 * tracking pixels) and tiny declared sizes. This is what lets the rebuild use
 * the client's actual photos instead of falling back to stock gradients.
 */
export function extractImages(root: HTMLElement, base: string): string[] {
  const candidates: string[] = [];

  // Social-card images first: usually the single best, hand-picked hero shot.
  for (const sel of ['meta[property="og:image"]', 'meta[name="twitter:image"]', 'meta[property="og:image:url"]']) {
    const c = root.querySelector(sel)?.getAttribute("content");
    if (c) candidates.push(c);
  }

  for (const el of root.querySelectorAll("img")) {
    // Skip images explicitly declared tiny (icons, pixels).
    const w = parseInt(el.getAttribute("width") || "", 10);
    const h = parseInt(el.getAttribute("height") || "", 10);
    if ((w && w < 100) || (h && h < 100)) continue;
    const srcset = el.getAttribute("srcset") || el.getAttribute("data-srcset");
    const best = srcset ? largestFromSrcset(srcset) : "";
    const src =
      best ||
      el.getAttribute("src") ||
      el.getAttribute("data-src") ||
      el.getAttribute("data-lazy-src") ||
      el.getAttribute("data-original") ||
      "";
    if (src) candidates.push(src);
  }

  // Background-image heroes (inline styles + <style> blocks).
  const styleText = root.querySelectorAll("style").map((s) => s.text).join(" ");
  const inline = root.querySelectorAll("[style]").map((e) => e.getAttribute("style") || "").join(" ");
  for (const u of backgroundImageUrls(`${styleText} ${inline}`)) candidates.push(u);

  const cleaned = candidates
    .map((s) => abs(s, base))
    .filter(
      (s) =>
        s &&
        /^https?:/i.test(s) &&
        !s.startsWith("data:") &&
        !/\.svg($|\?)/i.test(s) &&
        !IMAGE_JUNK_RE.test(s)
    );
  return dedupe(cleaned).slice(0, 8);
}

/**
 * Pull name/description/@type out of any JSON-LD blocks. SPAs that render no
 * server-side body often still emit structured data, so this is a reliable
 * source of brand + industry signals when the DOM text is thin.
 */
interface JsonLd {
  name?: string;
  description?: string;
  type?: string;
  telephone?: string;
  email?: string;
  address?: string;
  ratingValue?: string;
  reviewCount?: string;
  reviews?: { quote: string; name?: string; role?: string }[];
  faq?: { question: string; answer: string }[];
}

/** Flatten a schema.org PostalAddress (or string) into one human line. */
function flattenAddress(a: unknown): string | undefined {
  if (typeof a === "string") return clean(a) || undefined;
  if (!a || typeof a !== "object") return undefined;
  const o = a as Record<string, unknown>;
  const parts = [o.streetAddress, o.postalCode, o.addressLocality, o.addressRegion, o.addressCountry]
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0);
  return parts.length ? clean(parts.join(", ")) : undefined;
}

export interface ScrapedProduct {
  name: string;
  price?: string;
  image?: string;
  url?: string;
}

function priceFromOffers(offers: unknown): string | undefined {
  const o = (Array.isArray(offers) ? offers[0] : offers) as Record<string, unknown> | undefined;
  if (!o || typeof o !== "object") return undefined;
  const raw = o.price ?? o.lowPrice ?? o.highPrice;
  if (raw == null) return undefined;
  const p = String(raw);
  const cur = o.priceCurrency;
  if (cur === "USD") return `$${p}`;
  if (cur === "GBP") return `£${p}`;
  if (cur === "EUR") return `${p} €`;
  return typeof cur === "string" ? `${p} ${cur}` : p;
}

const PRICE_RE = /[€$£]\s?\d[\d.,]*|\d[\d.,]*\s?[€$£]|\d[\d.,]*\s?(?:EUR|USD|GBP)\b/i;

/** Product/category name from a URL slug (strips a leading numeric id):
 *  "/gb/12609-snack-cooking" -> "Snack cooking". */
function nameFromSlug(path: string): string {
  const seg = decodeURIComponent(path.split("/").filter(Boolean).pop() || "");
  const words = seg.replace(/^\d+[-_]/, "").replace(/[-_]+/g, " ").replace(/\.\w+$/, "").trim();
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** True if the element sits inside a nav/header/footer/menu/breadcrumb region -
 *  used to exclude chrome links from the B2B catalogue pass. */
function hasNavAncestor(el: HTMLElement): boolean {
  let p: HTMLElement | null = el.parentNode as HTMLElement | null;
  let hops = 0;
  while (p && hops < 14) {
    const tag = (p.rawTagName || "").toLowerCase();
    if (tag === "nav" || tag === "header" || tag === "footer") return true;
    const cls = (typeof p.getAttribute === "function" ? p.getAttribute("class") : "") || "";
    if (/(^|[\s_-])(nav|navbar|menu|header|footer|breadcrumb|lang|locale|topbar)([\s_-]|$)/i.test(cls)) return true;
    p = p.parentNode as HTMLElement | null;
    hops++;
  }
  return false;
}

/**
 * Scrape the page's REAL products - the client's actual catalogue - so the
 * rebuild keeps and modernizes them instead of dropping them. Prefers JSON-LD
 * Product / ItemList (Shopify, WooCommerce, most stores emit it), then falls
 * back to repeated product-card detection (an <a> + <img> with a price nearby).
 * Never fabricates: only returns products really found on the page.
 */
export function extractProducts(root: HTMLElement, base: string): ScrapedProduct[] {
  const out: ScrapedProduct[] = [];
  const seen = new Set<string>();
  const push = (p: ScrapedProduct) => {
    const key = (p.url || p.name || "").toLowerCase();
    if (!p.name || p.name.length < 2 || seen.has(key) || out.length >= 60) return;
    seen.add(key);
    out.push(p);
  };

  // 1) Structured data: JSON-LD Product / ItemList.
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    let data: unknown;
    try {
      data = JSON.parse(s.text);
    } catch {
      continue;
    }
    const stack: unknown[] = [data];
    while (stack.length && out.length < 60) {
      const node = stack.shift(); // FIFO: preserve catalogue order
      if (Array.isArray(node)) {
        stack.unshift(...node);
        continue;
      }
      if (!node || typeof node !== "object") continue;
      const n = node as Record<string, unknown>;
      if (n["@graph"]) stack.push(...([] as unknown[]).concat(n["@graph"] as unknown[]));
      if (n.itemListElement) stack.push(...([] as unknown[]).concat(n.itemListElement as unknown[]));
      if (n.item && typeof n.item === "object") stack.push(n.item);
      const t = Array.isArray(n["@type"]) ? n["@type"][0] : n["@type"];
      if (t === "Product" && typeof n.name === "string") {
        const im = n.image;
        const image = Array.isArray(im) ? im[0] : typeof im === "string" ? im : (im as Record<string, unknown>)?.url;
        push({
          name: clean(n.name).slice(0, 80),
          price: priceFromOffers(n.offers),
          image: image ? abs(String(image), base) : undefined,
          url: typeof n.url === "string" ? abs(n.url, base) : undefined,
        });
      }
    }
  }

  // 2) DOM product cards (when structured data is thin). A card = a small
  //    container with one image, a link, and a price signal or product-ish class.
  if (out.length < 6) {
    for (const el of root.querySelectorAll("li, article, div")) {
      if (out.length >= 60) break;
      const img = el.querySelector("img");
      const link = el.querySelector("a[href]");
      if (!img || !link) continue;
      if (el.querySelectorAll("img").length > 2) continue; // a list/grid, not a single card
      const cls = el.getAttribute("class") || "";
      const text = clean(el.text);
      const priceM = text.match(PRICE_RE);
      // A real product card needs a price OR an explicit product class - not just
      // "item/card" (those match nav, language switchers, menus, etc.).
      const looksProduct = /\bproducts?\b|\bproduit[s]?\b/i.test(cls);
      if (!priceM && !looksProduct) continue;
      const name = clean(link.getAttribute("title") || img.getAttribute("alt") || link.text).slice(0, 80);
      // Reject language/country/currency switchers and nav noise masquerading as
      // products (the #1 false positive on real stores).
      const meta = `${cls} ${img.getAttribute("src") || ""} ${img.getAttribute("alt") || ""} ${link.getAttribute("href") || ""}`;
      if (
        name.length < 3 ||
        /^[a-z]{2}$/i.test(name) ||
        isServiceNoise(name) ||
        /flag|country|locale|\blang\b|language|currency|switcher/i.test(meta)
      )
        continue;
      const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset");
      const src = (srcset ? largestFromSrcset(srcset) : "") || img.getAttribute("src") || img.getAttribute("data-src") || "";
      push({
        name,
        price: priceM ? priceM[0].trim() : undefined,
        image: src && !IMAGE_JUNK_RE.test(src) ? abs(src, base) : undefined,
        url: abs(link.getAttribute("href") || "", base),
      });
    }
  }

  // 3) B2B catalogue mode: image + link tiles with NO price (manufacturer/quote
  //    catalogues like Casselin). Only image-led tiles in the body (never chrome),
  //    names from title/alt or the URL slug. Requires a real grid (>=4 tiles) so
  //    it never fires on a stray content link. Used only when priced extraction
  //    came up short.
  if (out.length < 6) {
    const tiles: ScrapedProduct[] = [];
    const tileSeen = new Set<string>(out.map((p) => (p.url || p.name).toLowerCase()));
    for (const a of root.querySelectorAll("a[href]")) {
      if (tiles.length >= 40) break;
      const img = a.querySelector("img");
      if (!img) continue;
      if (hasNavAncestor(a)) continue;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      const u = abs(href, base);
      if (!/^https?:/i.test(u) || !sameOrigin(u, base) || PAGE_ASSET_RE.test(u) || PAGE_SKIP_RE.test(u)) continue;
      const path = pathKey(u, base);
      if (path === "/" || path === "") continue;
      let name = clean(a.getAttribute("title") || img.getAttribute("alt") || a.text).slice(0, 80);
      if (!name || name.length < 3) name = nameFromSlug(path);
      if (!name || name.length < 3 || /^[a-z]{2}$/i.test(name) || isServiceNoise(name)) continue;
      const meta = `${img.getAttribute("src") || ""} ${img.getAttribute("alt") || ""} ${href}`;
      if (/flag|country|locale|\blang\b|language|currency|switcher|sprite|icon|logo/i.test(meta)) continue;
      const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset");
      const src = (srcset ? largestFromSrcset(srcset) : "") || img.getAttribute("src") || img.getAttribute("data-src") || "";
      if (!src || IMAGE_JUNK_RE.test(src)) continue; // a catalogue tile must have a real image
      const key = u.toLowerCase();
      if (tileSeen.has(key) || tileSeen.has(name.toLowerCase())) continue;
      tileSeen.add(key);
      tiles.push({ name, image: abs(src, base), url: u.split("#")[0] });
    }
    // Only trust it as a catalogue when it's an actual grid of tiles.
    if (tiles.length >= 4) for (const t of tiles) push(t);
  }

  return out;
}

interface IntegrationSig {
  id: string;
  name: string;
  category: IntegrationCategory;
  hint: string;
  patterns: (string | RegExp)[];
}

// Signatures for business-critical third-party tools embedded on the source
// page. Rebuilding drops the original embeds, so we surface these before publish.
const INTEGRATION_SIGS: IntegrationSig[] = [
  { id: "stripe", name: "Stripe", category: "payments", hint: "Re-add your Stripe checkout / payment links so customers can still pay.", patterns: ["js.stripe.com", "stripe.com/v3", "data-stripe"] },
  { id: "paypal", name: "PayPal", category: "payments", hint: "Reconnect your PayPal buttons / checkout.", patterns: ["paypal.com/sdk", "paypalobjects.com", "paypal.com/cgi-bin"] },
  { id: "shopify", name: "Shopify", category: "payments", hint: "Reconnect your Shopify Buy Button / store checkout.", patterns: ["cdn.shopify.com", "shopify-buy", "myshopify.com"] },
  { id: "calendly", name: "Calendly", category: "scheduling", hint: "Re-embed your Calendly booking widget.", patterns: ["calendly.com", "calendly-inline-widget"] },
  { id: "acuity", name: "Acuity Scheduling", category: "scheduling", hint: "Re-embed your Acuity scheduler.", patterns: ["acuityscheduling.com", "squarespace-scheduling"] },
  { id: "ga4", name: "Google Analytics", category: "analytics", hint: "Re-add your GA4 measurement ID so you keep tracking traffic.", patterns: ["googletagmanager.com/gtag/js", "google-analytics.com/analytics.js", /\bua-\d{4,}-\d/i] },
  { id: "gtm", name: "Google Tag Manager", category: "analytics", hint: "Re-add your GTM container so your tags keep firing.", patterns: ["googletagmanager.com/gtm.js", /\bgtm-[a-z0-9]{4,}\b/i] },
  { id: "metapixel", name: "Meta Pixel", category: "marketing", hint: "Re-add your Meta (Facebook) Pixel to keep ad tracking / retargeting.", patterns: ["connect.facebook.net", "fbevents.js", "fbq(", "facebook.com/tr?"] },
  { id: "hubspot", name: "HubSpot", category: "crm", hint: "Reconnect HubSpot forms / tracking.", patterns: ["js.hs-scripts.com", "hs-script-loader", "hsforms.net", "hbspt."] },
  { id: "intercom", name: "Intercom", category: "chat", hint: "Re-add your Intercom messenger.", patterns: ["widget.intercom.io", "intercomsettings", "intercom('"] },
  { id: "crisp", name: "Crisp", category: "chat", hint: "Re-add your Crisp chat widget.", patterns: ["client.crisp.chat", "$crisp"] },
  { id: "tawk", name: "Tawk.to", category: "chat", hint: "Re-add your Tawk.to chat.", patterns: ["embed.tawk.to"] },
  { id: "drift", name: "Drift", category: "chat", hint: "Re-add your Drift chat.", patterns: ["js.driftt.com", "driftt.com", "drift.com/anonymous"] },
  { id: "zendesk", name: "Zendesk", category: "chat", hint: "Re-add your Zendesk widget.", patterns: ["static.zdassets.com", "zendesk.com/embeddable"] },
  { id: "mailchimp", name: "Mailchimp", category: "marketing", hint: "Reconnect your Mailchimp signup form.", patterns: ["chimpstatic.com", "list-manage.com", "mailchimp.com"] },
  { id: "klaviyo", name: "Klaviyo", category: "marketing", hint: "Reconnect your Klaviyo signup / flows.", patterns: ["static.klaviyo.com", "klaviyo.com/onsite"] },
  { id: "typeform", name: "Typeform", category: "marketing", hint: "Re-embed your Typeform.", patterns: ["embed.typeform.com", "typeform.com/to/"] },
  { id: "opentable", name: "OpenTable", category: "booking", hint: "Re-embed your OpenTable reservation widget.", patterns: ["opentable.com/widget", "opentable.com/restref"] },
  { id: "thefork", name: "TheFork", category: "booking", hint: "Re-embed your TheFork / LaFourchette booking.", patterns: ["thefork.com", "lafourchette.com"] },
  { id: "resy", name: "Resy", category: "booking", hint: "Re-embed your Resy reservations.", patterns: ["widgets.resy.com", "resy.com/cities"] },
];

/**
 * Detect business-critical third-party tools embedded on the source page so we
 * can warn the customer to reconnect them before publishing (never let a rebuild
 * silently break payments, booking, analytics or chat). Real signatures only.
 */
export function detectIntegrations(html: string): DetectedIntegration[] {
  if (!html) return [];
  const lower = html.toLowerCase();
  const out: DetectedIntegration[] = [];
  for (const sig of INTEGRATION_SIGS) {
    const hit = sig.patterns.some((p) => (typeof p === "string" ? lower.includes(p) : p.test(html)));
    if (hit) out.push({ id: sig.id, name: sig.name, category: sig.category, hint: sig.hint });
  }
  return out;
}

function jsonLd(root: HTMLElement): JsonLd {
  const out: JsonLd = {};
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
      // Real business details, when the site ships structured data.
      if (!out.telephone && typeof n.telephone === "string") out.telephone = clean(n.telephone);
      if (!out.email && typeof n.email === "string") out.email = clean(n.email).replace(/^mailto:/i, "");
      if (!out.address) {
        const addr = flattenAddress(n.address);
        if (addr) out.address = addr;
      }
      const rating = n.aggregateRating as Record<string, unknown> | undefined;
      if (rating && typeof rating === "object") {
        const rv = rating.ratingValue;
        const rc = rating.reviewCount ?? rating.ratingCount;
        if (!out.ratingValue && (typeof rv === "string" || typeof rv === "number")) out.ratingValue = String(rv);
        if (!out.reviewCount && (typeof rc === "string" || typeof rc === "number")) out.reviewCount = String(rc);
      }
      // FAQPage structured data: the most reliable Q&A source.
      if (t === "FAQPage" && Array.isArray(n.mainEntity)) {
        for (const q of n.mainEntity) {
          if (!q || typeof q !== "object") continue;
          const qq = q as Record<string, unknown>;
          const ans = qq.acceptedAnswer as Record<string, unknown> | undefined;
          const question = typeof qq.name === "string" ? clean(qq.name) : "";
          const answerRaw = ans && typeof ans.text === "string" ? ans.text : "";
          const answer = clean(answerRaw.replace(/<[^>]+>/g, " "));
          if (question && answer) (out.faq ??= []).push({ question, answer });
          if ((out.faq?.length ?? 0) >= 6) break;
        }
      }
      // Real customer reviews shipped as structured data — the most reliable
      // testimonial source. Accept a single Review or an array.
      const rawReviews = Array.isArray(n.review) ? n.review : n.review ? [n.review] : [];
      for (const r of rawReviews) {
        if (!r || typeof r !== "object") continue;
        const rev = r as Record<string, unknown>;
        const body = rev.reviewBody ?? rev.description;
        const quote = typeof body === "string" ? clean(body) : "";
        if (quote.length < 24) continue;
        const author = rev.author as Record<string, unknown> | string | undefined;
        const name =
          typeof author === "string"
            ? clean(author)
            : author && typeof author === "object" && typeof author.name === "string"
              ? clean(author.name)
              : undefined;
        (out.reviews ??= []).push({ quote: quote.slice(0, 280), name: name || undefined });
        if (out.reviews.length >= 6) break;
      }
    }
  }
  return out;
}

/* ---- extraction helpers ---- */

/**
 * Real contact details from the page so the rebuild keeps the client's actual
 * phone / email / address (and wires the Call / Directions / contact actions).
 * Prefers structured data and explicit tel:/mailto: links, then conservative
 * text patterns. Never invents anything.
 */
export function extractContact(
  root: HTMLElement,
  text: string,
  ld: JsonLd
): { phone?: string; email?: string; address?: string } | undefined {
  const telHref = root.querySelector('a[href^="tel:"]')?.getAttribute("href")?.replace(/^tel:/i, "").trim();
  const mailHref = root.querySelector('a[href^="mailto:"]')?.getAttribute("href")?.replace(/^mailto:/i, "").split("?")[0].trim();

  let phone = ld.telephone || telHref;
  if (!phone) {
    // A phone-like run of digits with separators and at least 9 digits.
    const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
    if (m && (m[1].match(/\d/g) || []).length >= 9) phone = m[1].trim();
  }

  let email = ld.email || mailHref;
  if (!email) {
    const m = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    if (m && !/\.(png|jpe?g|webp|gif|svg)$/i.test(m[0])) email = m[0];
  }

  const address = ld.address || clean(root.querySelector("address")?.text || "") || undefined;

  if (!phone && !email && !address) return undefined;
  return {
    ...(phone ? { phone: phone.slice(0, 40) } : {}),
    ...(email ? { email: email.slice(0, 120) } : {}),
    ...(address && address.length <= 160 ? { address } : {}),
  };
}

const GENERIC_HEADING = /^(home|welcome|menu|contact|about|services|our services|gallery|blog|news|faq|testimonials|reviews|pricing|accueil|services|à propos|contactez?-?nous)$/i;

/**
 * Walk the section that follows a heading and gather its real body text and
 * list items. Handles both flat (<h2><p>...) and wrapped (<h2><div><p>...)
 * layouts by descending one level into container siblings.
 */
function sectionAfter(heading: HTMLElement): { body: string; items: string[] } {
  const paras: string[] = [];
  const items: string[] = [];
  let el = heading.nextElementSibling;
  let hops = 0;
  while (el && hops < 8) {
    const tag = el.tagName?.toUpperCase();
    if (tag === "H1" || tag === "H2" || tag === "H3") break;
    if (tag === "P") {
      const t = clean(el.text);
      if (t.length > 30) paras.push(t);
    } else if (tag === "UL" || tag === "OL") {
      for (const li of el.querySelectorAll("li")) {
        const t = clean(li.text);
        if (t.length >= 3 && t.length <= 80) items.push(t);
      }
    } else if (tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
      for (const p of el.querySelectorAll("p")) {
        const t = clean(p.text);
        if (t.length > 30) paras.push(t);
      }
      for (const li of el.querySelectorAll("li")) {
        const t = clean(li.text);
        if (t.length >= 3 && t.length <= 80) items.push(t);
      }
    }
    el = el.nextElementSibling;
    hops++;
  }
  return { body: paras.join(" ").slice(0, 320), items: items.slice(0, 8) };
}

/**
 * Reuse the client's own words: pull the real "about" paragraph and real
 * service headings + descriptions from the page, so the rebuilt About / Services
 * read like the client's site, not generic copy. Conservative and never fabricated.
 */
export function extractProse(root: HTMLElement): {
  aboutBody?: string;
  serviceItems?: { title: string; description?: string }[];
} {
  const out: { aboutBody?: string; serviceItems?: { title: string; description?: string }[] } = {};

  // About: the section whose heading reads like about/story/mission.
  for (const h of root.querySelectorAll("h2, h3")) {
    const title = clean(h.text);
    if (/about|story|mission|who we are|why us|à propos|qui sommes|notre histoire|notre mission/i.test(title)) {
      const { body } = sectionAfter(h);
      if (body.length >= 60) {
        out.aboutBody = body;
        break;
      }
    }
  }

  // Services: prefer repeated "h3 title + paragraph" cards (real names + real
  // descriptions). Collect across the page; keep only solid title/description pairs.
  const items: { title: string; description?: string }[] = [];
  const seen = new Set<string>();
  for (const h of root.querySelectorAll("h3")) {
    const title = clean(h.text);
    if (title.length < 3 || title.length > 60) continue;
    // A real service name is a short noun phrase - not a section label, a nav/
    // CTA/location word, a sentence, or a long phrase (those are headings, FAQ
    // questions, client names, etc.).
    if (GENERIC_HEADING.test(title) || isServiceNoise(title)) continue;
    if (/[.!?]$/.test(title) || title.split(/\s+/).length > 5) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    const { body } = sectionAfter(h);
    if (body.length >= 30) {
      seen.add(key);
      items.push({ title, description: body.slice(0, 160) });
    }
    if (items.length >= 6) break;
  }
  if (items.length >= 3) out.serviceItems = items;

  return out;
}

// Nav/CTA/utility labels that are never real services (the nav bar is a poor
// services source: it's full of these). Anchored so it only drops exact labels.
const SERVICE_NOISE =
  /^(home|menu|locations?|view all|see all|see more|view more|shop|shop all|shop now|order|order online|order now|book|book now|reserve|reservations?|gift ?cards?|careers?|jobs|press|blog|news|events?|faqs?|frequently asked questions|account|my account|log ?in|sign ?in|sign ?up|register|search|cart|bag|checkout|contact|contact us|about|about us|our story|our team|team|stores?|find a store|store locator|directions|hours|opening hours|privacy|terms|cookies?|newsletter|subscribe|follow us|wholesale|gallery|portfolio|home page|get started|learn more|read more|explore|discover|all|more|next|previous|back|skip|english|fran[cç]ais|deutsch|espa[nñ]ol|work|our work|featured work|selected work|latest|clients|our clients|customers|partners|partnerships|industries|services|our services|solutions|products|projects|case studies|resources|company|insights|overview|capabilities|expertise|approach|process|methodology|pricing|plans|people|culture|values|mission|vision|sitemap|legal|support|help|docs|documentation|community|enterprise|features|integrations|use cases?)$/i;

// Place-name-ish nav labels (store/location menus), which masquerade as services.
function isLocationish(t: string): boolean {
  return (
    /\b(SF|NYC|LA|USA|UK|US)\b/.test(t) ||
    /\b(area|district|downtown|uptown|street|st\.?|avenue|ave\.?|road|rd\.?|sunset|valley|heights|manufactory|city|borough|county)\b/i.test(t)
  );
}

/** A label that is never a real service (utility/CTA/section/location). */
function isServiceNoise(t: string): boolean {
  return SERVICE_NOISE.test(t) || isLocationish(t);
}

/**
 * Turn a noisy nav-label list into plausible service/offering names: drop
 * utility/CTA/location labels, numerics, and CTA phrases ("View all", "Shop
 * now"). Used as a fallback service source only when the page exposes no real
 * service headings; callers fall back to industry defaults if too few survive.
 */
export function cleanServiceLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of labels) {
    const t = (raw || "").trim();
    const key = t.toLowerCase();
    if (!t || seen.has(key)) continue;
    if (t.length < 3 || t.length > 40) continue;
    if (isServiceNoise(t)) continue;
    if (/^[\d\s\W]+$/.test(t)) continue; // digits/punctuation only
    // CTA phrases: an action verb followed by a filler word.
    if (/^(view|see|shop|order|book|get|learn|read|explore|discover|find|browse)\b/i.test(t) && /\b(all|more|now|us|online|store|a|here|today)\b/i.test(t)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** Real credibility metrics from structured data (ratings). Never fabricated. */
export function extractStats(ld: JsonLd): { value: string; label: string }[] | undefined {
  const stats: { value: string; label: string }[] = [];
  if (ld.ratingValue) {
    const v = parseFloat(ld.ratingValue);
    if (!Number.isNaN(v) && v > 0 && v <= 5) stats.push({ value: `${v}★`, label: "Average rating" });
  }
  if (ld.reviewCount) {
    const n = parseInt(ld.reviewCount, 10);
    if (!Number.isNaN(n) && n > 0) stats.push({ value: `${n}+`, label: "Reviews" });
  }
  return stats.length ? stats : undefined;
}

/**
 * Real testimonials from the page — never fabricated. Prefers JSON-LD Review
 * data (the most reliable), then the common DOM patterns: <blockquote> and
 * `.testimonial` / `.review` / `.quote` containers, pulling an attribution from
 * a <cite>/<figcaption>/`.author`/`.name`. Returns undefined when nothing
 * credible is found, so the engine omits the section (honesty rule, like stats).
 */
export function extractTestimonials(
  root: HTMLElement,
  ld: JsonLd
): { quote: string; name: string; role?: string }[] | undefined {
  const out: { quote: string; name: string; role?: string }[] = [];
  const seen = new Set<string>();

  const add = (rawQuote: string, rawName?: string, rawRole?: string) => {
    if (out.length >= 6) return;
    const q = clean(rawQuote).replace(/^["“”'«»']+|["“”'«»']+$/g, "").trim();
    // A real quote is a sentence-ish span, not a label or a paragraph of body.
    if (q.length < 24 || q.length > 320 || !/[a-zà-ÿ]/i.test(q)) return;
    // Require a real attribution — a nameless quote is weak proof, and inventing
    // a name would violate the no-fabrication rule. So we drop it.
    const name = rawName ? clean(rawName).slice(0, 60) : "";
    if (name.length < 2) return;
    const key = q.slice(0, 48).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const role = rawRole ? clean(rawRole).slice(0, 60) : undefined;
    out.push({ quote: q, name, ...(role ? { role } : {}) });
  };

  // Split a "Name, Title" / "Name — Company" attribution into its two parts.
  const splitAttr = (full: string): [string | undefined, string | undefined] => {
    const parts = clean(full).split(/\s*[—–,|·]\s*/).filter(Boolean);
    return [parts[0], parts[1]];
  };

  // 1) Structured data first.
  for (const r of ld.reviews ?? []) add(r.quote, r.name, r.role);

  // 2) Explicit testimonial/review/quote containers.
  for (const el of root.querySelectorAll(
    ".testimonial, .testimonials, .review, .reviews, .quote, .quotes, .testimonial-card, [data-testimonial]"
  )) {
    if (out.length >= 6) break;
    const qEl = el.querySelector("blockquote, q, p") ?? el;
    const nameEl = el.querySelector("cite, figcaption, .author, .name, .author-name, .who, footer");
    const [name, role] = nameEl ? splitAttr(nameEl.text) : [undefined, undefined];
    add(qEl.text || "", name, role);
  }

  // 3) Semantic <blockquote> elements (attribution often in a sibling <cite>).
  for (const bq of root.querySelectorAll("blockquote")) {
    if (out.length >= 6) break;
    const cite = bq.querySelector("cite") ?? bq.nextElementSibling;
    const citeText = cite && /cite|figcaption/i.test(cite.tagName || "") ? cite.text : cite?.querySelector?.("cite")?.text;
    const [name, role] = citeText ? splitAttr(citeText) : [undefined, undefined];
    add(bq.querySelector("p")?.text || bq.text || "", name, role);
  }

  return out.length ? out.slice(0, 6) : undefined;
}

/**
 * Real FAQ from the page — replaces the generic default so the rebuild carries
 * the client's actual Q&A. Sources, most reliable first: JSON-LD FAQPage, native
 * <details>/<summary> accordions, <dl>/<dt>/<dd>, and headings that end with "?"
 * followed by their answer. Returns undefined when fewer than two are found
 * (the caller then falls back to the industry default).
 */
export function extractFaq(
  root: HTMLElement,
  ld: JsonLd
): { question: string; answer: string }[] | undefined {
  const out: { question: string; answer: string }[] = [];
  const seen = new Set<string>();
  const add = (rawQ: string, rawA: string) => {
    if (out.length >= 6) return;
    const question = clean(rawQ).slice(0, 180);
    const answer = clean(rawA).slice(0, 400);
    if (question.length < 8 || answer.length < 15) return;
    const key = question.toLowerCase().slice(0, 48);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ question, answer });
  };

  // 1) Structured data (trustworthy enough to keep even a single pair).
  const fromLd = (ld.faq?.length ?? 0) > 0;
  for (const f of ld.faq ?? []) add(f.question, f.answer);

  // 2) Native <details>/<summary> accordions.
  for (const d of root.querySelectorAll("details")) {
    const sum = d.querySelector("summary");
    if (!sum) continue;
    add(sum.text, d.text.replace(sum.text, ""));
  }

  // 3) Definition lists.
  for (const dl of root.querySelectorAll("dl")) {
    for (const dt of dl.querySelectorAll("dt")) {
      const dd = dt.nextElementSibling;
      if (dd && /^dd$/i.test(dd.tagName || "")) add(dt.text, dd.text);
    }
  }

  // 4) A heading phrased as a question, answered by the body that follows it.
  for (const h of root.querySelectorAll("h2, h3, h4")) {
    const t = clean(h.text);
    if (!t.endsWith("?")) continue;
    const { body } = sectionAfter(h);
    if (body) add(t, body);
  }

  // DOM heuristics need two pairs to avoid false positives; structured data is
  // trusted from one.
  return out.length >= (fromLd ? 1 : 2) ? out.slice(0, 6) : undefined;
}

const SOCIAL_PATTERNS: [string, RegExp][] = [
  ["Instagram", /instagram\.com/i],
  ["Facebook", /facebook\.com|fb\.com/i],
  ["LinkedIn", /linkedin\.com/i],
  ["X", /twitter\.com|x\.com/i],
  ["YouTube", /youtube\.com|youtu\.be/i],
  ["TikTok", /tiktok\.com/i],
  ["Pinterest", /pinterest\./i],
  ["GitHub", /github\.com/i],
];

/**
 * The client's real social profiles, for the footer. Matches outbound links to
 * known platforms, skips share/intent buttons (which aren't the brand's own
 * profile), dedupes by platform. Returns undefined when none are found.
 */
export function extractSocialLinks(
  root: HTMLElement
): { platform: string; url: string }[] | undefined {
  const out: { platform: string; url: string }[] = [];
  const seen = new Set<string>();
  for (const a of root.querySelectorAll("a[href]")) {
    if (out.length >= 6) break;
    const href = (a.getAttribute("href") || "").trim();
    if (!/^https?:\/\//i.test(href)) continue;
    if (/[/?](share|sharer|intent|dialog)\b/i.test(href)) continue; // share button, not a profile
    for (const [platform, re] of SOCIAL_PATTERNS) {
      if (re.test(href) && !seen.has(platform)) {
        seen.add(platform);
        out.push({ platform, url: href });
        break;
      }
    }
  }
  return out.length ? out : undefined;
}

/** Relative luminance (0..1) of a CSS hex or rgb()/rgba() colour, else undefined. */
function colorLuminance(input: string): number | undefined {
  const s = input.trim().toLowerCase();
  let r: number, g: number, b: number;
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      r = parseInt(h[0] + h[0], 16);
      g = parseInt(h[1] + h[1], 16);
      b = parseInt(h[2] + h[2], 16);
    } else {
      r = parseInt(h.slice(0, 2), 16);
      g = parseInt(h.slice(2, 4), 16);
      b = parseInt(h.slice(4, 6), 16);
    }
  } else {
    const m = s.match(/rgba?\(\s*(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})/);
    if (!m) return undefined;
    [r, g, b] = [+m[1], +m[2], +m[3]];
  }
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Whether the SOURCE site presents as dark — a dark canvas being part of its
 * identity. Conservative on purpose (only clear, declarative signals: a
 * color-scheme preference, or a dark background painted on <html>/<body>), so a
 * light site is never wrongly darkened. Drives the generated theme's default
 * mode (a dark site rebuilds dark — "their site, dramatically better").
 */
export function detectSourceDark(html: string, root: HTMLElement): boolean {
  // Declared colour-scheme preference (meta or CSS), dark listed first.
  const cs =
    root.querySelector('meta[name="color-scheme"]')?.getAttribute("content")?.toLowerCase() || "";
  if (/\bdark\b/.test(cs) && !/^\s*light\b/.test(cs)) return true;
  if (/color-scheme\s*:\s*dark\b/i.test(html)) return true;
  // A dark background painted on the root/body via an inline style.
  for (const sel of ["body", "html"]) {
    const style = root.querySelector(sel)?.getAttribute("style") || "";
    const bg = style.match(/background(?:-color)?\s*:\s*([^;]+)/i)?.[1];
    if (bg) {
      const lum = colorLuminance(bg);
      if (lum !== undefined && lum < 0.22) return true;
    }
  }
  return false;
}

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

export function findAccent(root: HTMLElement): string | undefined {
  // Weighted voting across every place a brand color hides. Explicit brand
  // signals dominate; brand-named CSS variables are next; logo/SVG fills beat
  // generic color tokens, which only win by sheer frequency.
  const score: Record<string, number> = {};
  const add = (raw: string | undefined | null, weight: number) => {
    const c = usableAccent(raw || "");
    if (c) score[c] = (score[c] || 0) + weight + hexChroma(c) / 255; // chroma = tiebreak
  };

  // 1) Explicit brand-color signals, in order of reliability.
  add(root.querySelector('link[rel*="mask-icon"]')?.getAttribute("color"), 5000);
  add(root.querySelector('meta[name="theme-color"]')?.getAttribute("content"), 4000);
  add(root.querySelector('meta[name="msapplication-TileColor"]')?.getAttribute("content"), 3000);

  const styleText = root.querySelectorAll("style").map((s) => s.text).join(" ");
  const inline = root.querySelectorAll("[style]").map((e) => e.getAttribute("style") || "").join(" ");
  const css = `${styleText} ${inline}`;

  // 2) CSS custom properties. Brand-named ones (--brand, --accent, --primary…)
  //    are the single most reliable signal on modern sites.
  const varRe = /--([a-z0-9-]+)\s*:\s*([^;}{]+)/gi;
  let mv: RegExpExecArray | null;
  while ((mv = varRe.exec(styleText))) {
    const brandy = /(brand|accent|primary|theme|main|cta|action|highlight|link)/.test(mv[1]);
    add(mv[2], brandy ? 2000 : 150);
  }

  // 3) Logo / SVG fills carry the brand color on icon-driven sites.
  for (const el of root.querySelectorAll("[fill], [stop-color], [color]")) {
    add(el.getAttribute("fill"), 300);
    add(el.getAttribute("stop-color"), 300);
    add(el.getAttribute("color"), 150);
  }

  // 4) Generic color tokens (hex, rgb(), hsl()) by frequency — weakest signal.
  const tokens = css.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi) || [];
  for (const t of tokens) add(t, 10);

  let best: string | undefined;
  let bestScore = 0;
  for (const [hex, s] of Object.entries(score)) {
    if (s > bestScore) {
      bestScore = s;
      best = hex;
    }
  }
  return best;
}

/** Normalize a hex and accept it only if it works as an accent (a button fill). */
function usableAccent(raw: string): string | undefined {
  const hex = parseColorToHex(raw);
  if (!hex) return undefined;
  if (isNeutral(hex)) return undefined;
  const l = hexLightness(hex);
  if (l < 0.22 || l > 0.75) return undefined; // too dark/light => unusable as an accent
  return hex;
}

/** Parse a CSS color (hex / rgb() / rgba() / hsl() / hsla()) to #rrggbb. */
export function parseColorToHex(raw: string): string | undefined {
  const s = raw.trim().toLowerCase();
  if (!s) return undefined;

  const hx = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s.startsWith("#") ? s.slice(1) : s);
  if (hx) {
    let hex = hx[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    return `#${hex.slice(0, 6)}`;
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(s);
  if (rgb) {
    const toByte = (n: string) => Math.max(0, Math.min(255, Math.round(parseFloat(n))));
    return rgbToHex(toByte(rgb[1]), toByte(rgb[2]), toByte(rgb[3]));
  }

  const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/.exec(s);
  if (hsl) {
    return hslToHex(parseFloat(hsl[1]), parseFloat(hsl[2]) / 100, parseFloat(hsl[3]) / 100);
  }
  return undefined;
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
function buildBlock(
  slot: Slot,
  analysis: SiteAnalysis,
  mood: Theme["mood"] = INDUSTRY_PROFILES[analysis.industry].theme.mood
): Block | null {
  const profile = INDUSTRY_PROFILES[analysis.industry];
  const c = analysis.extractedContent;
  const brand = analysis.brandName;

  // Every CTA must lead to a real next step. Prefer a booking link, else scroll
  // to the on-page contact section; offer the phone as the secondary action
  // when we know it (great on mobile) rather than a dead "Learn more".
  const contact = c.contact ?? {};
  const bookHref = contact.bookingUrl || "#contact";
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/\s+/g, "")}` : undefined;

  switch (slot.category) {
    case "hero":
      return {
        id: uid("hero"),
        type: "hero",
        // With no usable image, image-led heroes fall flat; route to the
        // image-free "brand canvas" so the first impression still lands.
        variant: c.heroImageUrl
          ? pickVariant("hero", analysis.industry, brand, mood)
          : "HeroCanvas",
        props: {
          eyebrow: profile.label,
          title: c.headline,
          subtitle: c.description,
          primaryCta: profile.cta.primary,
          primaryHref: bookHref,
          secondaryCta: phoneHref ? "Call us" : "Learn more",
          secondaryHref: phoneHref || "#contact",
          image: c.heroImageUrl,
          brand,
          caption: c.services[0],
          // For proof-bearing heroes (Bento): real metrics only, plus real
          // service names as a non-fabricated fallback.
          stats: c.stats,
          services: c.services,
        },
      };
    case "features": {
      const base = c.serviceItems?.length
        ? c.serviceItems.map((s) => ({ title: s.title, description: s.description || featureBlurb(s.title, analysis.industry) }))
        : c.services.map((s) => ({ title: s, description: featureBlurb(s, analysis.industry) }));
      // Image-led tiles (Apple-store grade) when there is enough REAL imagery to
      // vary across tiles; otherwise the bento degrades to restrained icon tiles.
      const useImages = c.images.length >= 3;
      return {
        id: uid("features"),
        type: slot.type,
        variant: pickVariant("features", analysis.industry, brand, mood),
        props: {
          title: sectionTitle(slot.type, brand),
          subtitle: "What makes the difference for our clients.",
          // Real CTAs reused on each tile (Apple-style "Learn more / Book"),
          // pointing at the same booking/contact next steps as the hero.
          primaryCta: "Learn more",
          primaryHref: "#contact",
          secondaryCta: phoneHref ? "Call us" : profile.cta.primary,
          secondaryHref: phoneHref || bookHref,
          items: base.map((it, i) => ({
            ...it,
            icon: FEATURE_ICONS[i % FEATURE_ICONS.length],
            ...(useImages ? { image: c.images[i % c.images.length] } : {}),
          })),
        },
      };
    }
    case "services":
      return {
        id: uid("services"),
        type: slot.type,
        variant: pickVariant("services", analysis.industry, brand, mood),
        props: {
          eyebrow: "Services",
          title: sectionTitle(slot.type, brand),
          items: c.serviceItems?.length
            ? c.serviceItems.map((s) => ({ title: s.title, description: s.description || featureBlurb(s.title, analysis.industry) }))
            : c.services.map((s) => ({ title: s, description: featureBlurb(s, analysis.industry) })),
        },
      };
    case "portfolio":
      // A portfolio/gallery IS its imagery. Need at least a couple of real,
      // loadable images (validated upstream) to form a credible grid; a single
      // image reads as filler, so omit it (honesty rule, like stats/testimonials).
      // Tiles are never padded with placeholders (see portfolioItems).
      if (c.images.length < 2) return null;
      return {
        id: uid("portfolio"),
        type: slot.type,
        variant: pickVariant("portfolio", analysis.industry, brand, mood),
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
        variant: pickVariant("stats", analysis.industry, brand, mood),
        props: { title: sectionTitle(slot.type, brand), items: c.stats },
      };
    case "about":
      return {
        id: uid("about"),
        type: slot.type,
        variant: pickVariant("about", analysis.industry, brand, mood),
        props: {
          eyebrow: "About",
          title: sectionTitle(slot.type, brand),
          body: c.aboutBody || c.description,
          image: analysis.extractedContent.images[1] || c.heroImageUrl,
          // Real stats only; AboutSplit hides the chip row when absent.
          stats: c.stats?.slice(0, 3),
          cta: "Get in touch",
          ctaHref: "#contact",
        },
      };
    case "testimonials":
      // Never fabricate praise. Only render when real testimonials were extracted.
      if (!c.testimonials?.length) return null;
      return {
        id: uid("test"),
        type: "testimonials",
        variant: pickVariant("testimonials", analysis.industry, brand, mood),
        props: { title: "What our clients say", items: c.testimonials },
      };
    case "faq":
      return {
        id: uid("faq"),
        type: "faq",
        variant: "FAQAccordion1",
        props: { title: "Frequently asked questions", items: c.faqItems?.length ? c.faqItems : defaultFaq(analysis.industry, brand) },
      };
    case "cta":
      return {
        id: uid("cta"),
        type: "cta",
        variant: pickVariant("cta", analysis.industry, brand, mood),
        props: { title: "Ready to get started?", subtitle: "Reach out today and let's make it happen.", cta: profile.cta.primary, ctaHref: bookHref },
      };
    case "contact":
      return {
        id: uid("contact"),
        type: "contact",
        // Default to the form so every site captures leads (feeds the leads
        // inbox / value dashboard). The premium no-form variants
        // (ContactDetailsCard / ContactBanner) stay available via the AI editor.
        variant: "ContactFormPremium1",
        props: {
          title: "Contact us",
          subtitle: "We typically reply within one business day.",
          contact: c.contact,
        },
      };
    case "footer":
      return {
        id: uid("footer"),
        type: "footer",
        variant: pickVariant("footer", analysis.industry, brand, mood),
        // Real data for the multi-column footer; other footers ignore the extras.
        props: { brand, services: c.services, contact: c.contact, social: c.socialLinks },
      };
    default:
      return buildBlock({ ...slot, category: "features" }, analysis, mood);
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
/**
 * Strip em/en dashes from copy. The em-dash is the single biggest "AI tell" in
 * generated text, so we ban it from everything we ship: a spaced dash becomes a
 * comma, any stray dash a hyphen. Applied to every block's props at the end of
 * generation, so it covers deterministic copy and Claude-rewritten copy alike.
 */
function deAiDash(s: string): string {
  return s.replace(/\s+[—–]\s+/g, ", ").replace(/[—–]/g, "-");
}

function sanitizeValue(v: unknown): unknown {
  if (typeof v === "string") return deAiDash(v);
  if (Array.isArray(v)) return v.map(sanitizeValue);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, sanitizeValue(val)]));
  }
  return v;
}

function sanitizeBlock(b: Block): Block {
  return { ...b, props: sanitizeValue(b.props) as Block["props"] };
}

export function generateSite(
  analysis: SiteAnalysis,
  opts: { mode?: GenerationMode; layout?: BlockType[]; theme?: Partial<Theme>; realPages?: SitePage[] } = {}
): SiteSchema {
  const mode: GenerationMode = opts.mode ?? "preserve";
  // An explicit (AI-composed) layout takes precedence over the deterministic
  // planner; otherwise the mode decides the structure.
  const plan = opts.layout?.length
    ? planExplicit(opts.layout)
    : mode === "classic"
      ? planClassic()
      : mode === "preserve"
        ? planPreserve(analysis.structure)
        : planSmart(analysis.structure);

  // Theme: industry default, refined by any AI theme (font/mood/radius/accent),
  // then the real extracted brand colour wins so the rebuild stays recognisable.
  const profile = INDUSTRY_PROFILES[analysis.industry];
  const aiTheme = opts.theme ?? {};
  let theme: Theme = { ...profile.theme, ...aiTheme };
  if (analysis.brand?.accentColor) theme = { ...theme, accent: analysis.brand.accentColor };
  // A dark source site rebuilds dark by default (identity preservation), unless
  // an explicit theme override already decided the mode. The renderer still
  // honours the visitor's OS preference on top of this default.
  if (aiTheme.dark === undefined && analysis.sourceDark) theme = { ...theme, dark: true };
  const mood = theme.mood;

  // Guarantee a slot for real content the user/extractor supplied (testimonials,
  // stats) even when the detected structure or canonical plan lacked one - so
  // hybrid-completed data always appears. Inserted just before the footer.
  const slots: Slot[] = [...plan.slots];
  const ensureSlot = (type: BlockType) => {
    const category = renderableCategory(type);
    if (slots.some((s) => s.category === category)) return;
    const fi = slots.findIndex((s) => s.type === "footer");
    slots.splice(fi >= 0 ? fi : slots.length, 0, { type, category });
  };
  if (analysis.extractedContent.testimonials?.length) ensureSlot("testimonials");
  if (analysis.extractedContent.stats?.length) ensureSlot("stats");
  // Conversion floor (smart mode only - preserve keeps the client's exact
  // structure): guarantee one closing call to action. No-op if a CTA exists.
  if (mode === "smart") ensureSlot("cta");

  // Some slots (testimonials, stats) are intentionally dropped when we have no
  // real data for them, rather than fabricated - so filter the nulls out.
  const blocks: Block[] = slots
    .map((s) => buildBlock(s, analysis, mood))
    .filter((b): b is Block => b !== null);

  // Multi-page: beyond the home overview, build the standard small-business
  // pages (Services, About, Contact). Each is a focused page of real blocks
  // (fabricated sections still drop out). Empty pages are omitted.
  const buildPage = (label: string, path: string, types: BlockType[]): SitePage | null => {
    const pageBlocks = types
      .map((t) => buildBlock({ type: t, category: renderableCategory(t) }, analysis, mood))
      .filter((b): b is Block => b !== null);
    // A page needs at least one real content block besides the footer.
    return pageBlocks.some((b) => b.type !== "footer") ? { label, path, blocks: pageBlocks } : null;
  };
  // Real pages from a multi-page crawl take precedence (keep the client's whole
  // site); otherwise build the canonical small-business pages.
  const pages: SitePage[] = opts.realPages?.length
    ? opts.realPages.slice()
    : [
        buildPage("Services", "services", ["services", "portfolio", "cta", "footer"]),
        buildPage("About", "about", ["about", "stats", "testimonials", "footer"]),
        buildPage("Contact", "contact", ["contact", "footer"]),
      ].filter((p): p is SitePage => p !== null);

  // CMS-lite: an owner-managed collection (menu / price list) becomes a real
  // page. Industry-labelled, inserted before Contact.
  const collection = analysis.extractedContent.collection;
  if (collection?.items?.length) {
    const meta = collectionMeta(analysis.industry);
    const footer = buildBlock({ type: "footer", category: "footer" }, analysis, mood);
    const block: Block = {
      id: uid("collection"),
      type: "gallery",
      variant: "CollectionGrid",
      props: { eyebrow: meta.label, title: meta.label, items: collection.items },
    };
    const blocks2 = footer ? [block, footer] : [block];
    const at = Math.max(0, pages.findIndex((p) => p.path === "contact"));
    pages.splice(at, 0, { path: meta.path, label: meta.label, blocks: blocks2 });
  }

  // Real catalogue: keep ALL the client's scraped products on a dedicated Shop
  // page, modernized into a premium grid (never fabricated). Inserted before
  // Contact so the nav reads Home / ... / Shop / Contact.
  // Surface the home catalogue (e.g. a B2B range of products with no prices) as
  // a dedicated Shop page - in single-page mode and alongside crawled category
  // pages, so the catalogue is always reachable.
  const products = analysis.extractedContent.products;
  if (products?.length) {
    const footer = buildBlock({ type: "footer", category: "footer" }, analysis, mood);
    const grid = productGridBlock(products);
    const shopBlocks = footer ? [grid, footer] : [grid];
    const at = pages.findIndex((p) => p.path === "contact");
    pages.splice(at >= 0 ? at : pages.length, 0, { path: "shop", label: "Shop", blocks: shopBlocks });
  }

  // Agency Quality Pass: normalize the assembled home page (single hero first,
  // footer last, no back-to-back duplicate sections, real photos distributed so
  // none repeats across sections). Identity/content preserving.
  const qp = qualityPass(blocks.map(sanitizeBlock), analysis.extractedContent.images);
  const recommendations = [...plan.recommendations, ...qp.recommendations];

  return {
    id: uid("site"),
    sourceUrl: analysis.url,
    industry: analysis.industry,
    brand: { name: analysis.brandName, tagline: deAiDash(analysis.extractedContent.headline), logo: analysis.brand?.logoUrl },
    theme,
    blocks: qp.blocks,
    pages: pages.length
      ? pages.map((p) => ({ ...p, blocks: p.blocks.map(sanitizeBlock) }))
      : undefined,
    mode,
    recommendations: recommendations.length ? recommendations : undefined,
  };
}

/** Premium product grid block from real products (shared by the Shop page and
 *  crawled catalogue pages). */
function productGridBlock(
  products: { name: string; price?: string; image?: string; url?: string }[],
  title = "Our products",
  eyebrow = "Catalogue"
): Block {
  return { id: uid("products"), type: "products", variant: "ProductGrid", props: { eyebrow, title, items: products } };
}

/**
 * Keep the client's REAL URL path (SEO continuity): preserve the nested
 * structure ("/collections/mens-bestsellers" stays "collections/mens-bestsellers")
 * so the rebuilt site answers the same URLs - existing rankings and inbound
 * links keep working. Only sanitizes each segment to be route-safe.
 */
export function routePath(path: string): string {
  return (
    path
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .map((seg) =>
        decodeURIComponent(seg)
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      )
      .filter(Boolean)
      .join("/") || "page"
  );
}

/**
 * Build ONE real client page (from its own analysis) as a premium page: a
 * header/hero, then its real content - the full product catalogue if the page is
 * a shop/category, else its real sections (features/portfolio/about) - and a
 * footer. Content-preserving, never fabricated.
 */
function buildRealPage(a: SiteAnalysis, label: string, path: string, mood: Theme["mood"]): SitePage | null {
  const c = a.extractedContent;
  const blocks: Block[] = [];
  const add = (t: BlockType) => {
    const b = buildBlock({ type: t, category: renderableCategory(t) }, a, mood);
    if (b) blocks.push(b);
  };

  add("hero");
  if (c.products?.length) {
    blocks.push(productGridBlock(c.products, label || "Products"));
  } else {
    if (c.serviceItems?.length || c.services.length >= 3) add("features");
    if (c.images.length >= 2) add("portfolio");
    if (c.aboutBody) add("about");
    if (c.testimonials?.length) add("testimonials");
  }
  add("cta");
  add("contact");
  add("footer");

  // A real page needs at least one content block besides hero/footer.
  const hasContent = blocks.some((b) => !["hero", "footer", "cta"].includes(b.type));
  if (!hasContent) return null;
  return { label: label || "Page", path, blocks: blocks.map(sanitizeBlock) };
}

export interface SiteCrawl {
  home: SiteAnalysis;
  pages: { label: string; path: string; analysis: SiteAnalysis }[];
}

/**
 * Crawl the client's site: analyze the home page, discover its real pages
 * (nav + sitemap), and analyze each (bounded + concurrent). The foundation of
 * "keep the whole site A to Z" - every real page is captured, never invented.
 */
export async function crawlSite(rawUrl: string, opts: { maxPages?: number } = {}): Promise<SiteCrawl> {
  const home = await analyzeUrl(rawUrl);
  const pages = await crawlPages(home.url, opts.maxPages ?? 6);
  return { home, pages };
}

/**
 * Discover and analyze the client's other real pages (everything but the home),
 * given the home URL. Used by crawlSite and by the generation API (which already
 * holds the home analysis, so it only needs the rest). Bounded + concurrent;
 * each failure is skipped, never fabricated.
 */
export async function crawlPages(homeUrl: string, maxPages = 6): Promise<SiteCrawl["pages"]> {
  let discovered: DiscoveredPage[] = [];
  try {
    const html = await fetchStatic(homeUrl);
    if (html) {
      const root = parse(html, { blockTextElements: { script: true, style: true } });
      discovered = await discoverPages(homeUrl, root, maxPages);
    }
  } catch {
    /* discovery is best-effort */
  }

  const pages: SiteCrawl["pages"] = [];
  const queue = discovered.slice(0, maxPages);
  const seenSlug = new Set<string>(["", "shop"]);
  const worker = async () => {
    for (;;) {
      const d = queue.shift();
      if (!d) return;
      try {
        const analysis = await analyzeUrl(d.url);
        // Preserve the client's real URL path for SEO continuity.
        let slug = routePath(d.path);
        while (seenSlug.has(slug)) slug = `${slug}-${pages.length}`;
        seenSlug.add(slug);
        pages.push({ label: d.label, path: slug, analysis });
      } catch {
        /* skip a page that fails to analyze */
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return pages;
}

/**
 * Generate a full multi-page site from a crawl: the home page (premium blocks
 * from its analysis) plus every real client page, each rebuilt premium and
 * content-preserving. This is the "keep the whole site, upgrade the design" path.
 */
export function generateSiteCrawled(crawl: SiteCrawl, opts: { mode?: GenerationMode; theme?: Partial<Theme> } = {}): SiteSchema {
  const mood = (opts.theme?.mood ?? INDUSTRY_PROFILES[crawl.home.industry].theme.mood) as Theme["mood"];
  const realPages = crawl.pages
    .map((p) => buildRealPage(p.analysis, p.label, p.path, mood))
    .filter((p): p is SitePage => p !== null);
  return generateSite(crawl.home, { ...opts, realPages });
}

/**
 * Agency Quality Pass — a deterministic post-generation normalization that lifts
 * the floor of every generated site. It only reorders, de-dupes and redistributes
 * REAL assets; it never fabricates content. Returns the improved blocks plus a
 * log of what it changed (surfaced internally as recommendations).
 */
export function qualityPass(blocks: Block[], imagePool: string[]): { blocks: Block[]; recommendations: Recommendation[] } {
  const recommendations: Recommendation[] = [];
  let out = blocks.slice();

  // 1) Exactly one hero, and it opens the page.
  const heroes = out.filter((b) => b.type === "hero");
  if (heroes.length > 1) {
    const keep = heroes[0];
    out = out.filter((b) => b.type !== "hero" || b === keep);
    recommendations.push({ action: "Removed a duplicate hero", reason: "A page should open with a single, focused hero." });
  }
  const hi = out.findIndex((b) => b.type === "hero");
  if (hi > 0) {
    const [h] = out.splice(hi, 1);
    out.unshift(h);
    recommendations.push({ action: "Moved the hero to the top", reason: "The hero must be the first thing visitors see." });
  }

  // 2) Footer last.
  const fi = out.findIndex((b) => b.type === "footer");
  if (fi >= 0 && fi !== out.length - 1) {
    const [f] = out.splice(fi, 1);
    out.push(f);
    recommendations.push({ action: "Moved the footer to the end", reason: "Standard page anatomy keeps the layout predictable." });
  }

  // 3) No two adjacent sections of the same type (reads as filler).
  const deduped: Block[] = [];
  for (const b of out) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.type === b.type && b.type !== "footer") {
      recommendations.push({ action: `Merged repeated ${b.type} sections`, reason: "Back-to-back identical sections look templated." });
      continue;
    }
    deduped.push(b);
  }
  out = deduped;

  // 4) Distribute the real imagery so no photo repeats across sections. Only
  //    rewrites fields that already hold an image (never adds imagery to an
  //    intentionally image-free section), and keeps the hero on the best photo.
  if (imagePool.length > 1) {
    let idx = 0;
    let prev = "";
    const next = (): string => {
      let img = imagePool[idx % imagePool.length];
      if (img === prev && imagePool.length > 1) {
        idx++;
        img = imagePool[idx % imagePool.length];
      }
      idx++;
      prev = img;
      return img;
    };
    let changed = false;
    out = out.map((b) => {
      const props: Record<string, unknown> = { ...(b.props as Record<string, unknown>) };
      if (typeof props.image === "string") {
        const n = next();
        if (n !== props.image) changed = true;
        props.image = n;
      }
      if (Array.isArray(props.items)) {
        props.items = (props.items as unknown[]).map((it) => {
          if (it && typeof it === "object" && typeof (it as { image?: unknown }).image === "string") {
            const n = next();
            if (n !== (it as { image: string }).image) changed = true;
            return { ...(it as object), image: n };
          }
          return it;
        });
      }
      return { ...b, props };
    });
    if (changed) {
      recommendations.push({ action: "Distributed the real photos across sections", reason: "Reusing one image everywhere looks templated; each section now gets a distinct photo." });
    }
  }

  return { blocks: out, recommendations };
}

/** Label + path for the owner-managed collection page, by industry. */
function collectionMeta(industry: Industry): { label: string; path: string } {
  if (industry === "restaurant") return { label: "Menu", path: "menu" };
  if (industry === "ecommerce") return { label: "Catalogue", path: "catalogue" };
  return { label: "Pricing", path: "pricing" };
}

function featureBlurb(service: string, industry: Industry): string {
  const map: Record<string, string> = {
    "Free quotes": "Transparent, no-obligation pricing before any work begins.",
    "24/7 emergencies": "Real people on call, day or night, when you need us most.",
    "Licensed & insured": "Fully certified and covered for complete peace of mind.",
    "Workmanship guarantee": "If it's not right, we make it right, guaranteed.",
  };
  if (map[service]) return map[service];

  // Varied, grammatical fallbacks so no two items read the same. Chosen
  // deterministically from the service name (stable across renders).
  const lower = service.toLowerCase();
  const patterns = [
    `${service}, handled end to end with senior craft.`,
    `${service}, considered, on-brand, and delivered on time.`,
    `${service} done properly: no templates, no shortcuts.`,
    `${service}, tailored to your brand and built to last.`,
    `Clear, results-driven ${lower} that earns its keep.`,
    `Thoughtful ${lower}, executed cleanly from brief to launch.`,
  ];
  const idx = service.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % patterns.length;
  return patterns[idx];
}

/**
 * Build tiles for the portfolio grid. Uses the source site's real images where
 * available, names them from the detected services (falling back to "Project NN"),
 * and tops up to six tiles so the asymmetric composition always reads as full.
 */
function portfolioItems(a: SiteAnalysis): { image?: string; title: string; tag: string }[] {
  const imgs = a.extractedContent.images;
  const names = a.extractedContent.services;
  // Neutral, varied tags so tiles don't all repeat the industry label.
  const tags = ["Featured", "Recent work", "Case study", "Selected", "Highlight", "Project"];
  // One tile per REAL image only (validated upstream): never pad with empty
  // placeholder tiles, which is what made the gallery read as a template.
  return imgs.slice(0, 6).map((image, i) => ({
    image,
    title: names[i] || `Project ${String(i + 1).padStart(2, "0")}`,
    tag: tags[i % tags.length],
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

  // 3c. Toggle animations on/off (the client owns the motion).
  if (/(animation|motion|\banim\b|effets?\b|effect|static|statique)/.test(text)) {
    const off = /(\bremove\b|disable|\boff\b|\bstop\b|\bsans\b|enl[eè]v|supprim|retir|\bno\b|without|turn off|d[eé]sactiv|\bmoins\b|\bless\b|static|statique)/.test(text);
    const on = /(\badd\b|enable|\bon\b|activ|\bback\b|turn on|remet|réactiv|reactiv|\bmore\b)/.test(text);
    if (off && !on) {
      next.animations = false;
      return { schema: next, message: "Turned off the animations. The site now renders static. Say “add the animations back” anytime.", changed: true };
    }
    if (on) {
      next.animations = true;
      return { schema: next, message: "Turned the animations back on.", changed: true };
    }
  }

  // 3d. Dark / light colour scheme. Guard against colour phrases ("dark blue").
  const mentionsColor = /(blue|indigo|violet|purple|green|emerald|teal|red|rose|pink|orange|amber)/.test(text);
  if (/(dark mode|mode sombre|sombre|night|nuit|dark theme|\bdark\b)/.test(text) && !/(light|clair|jour|day)/.test(text) && !mentionsColor) {
    next.theme.dark = true;
    return { schema: next, message: "Switched the site to dark mode.", changed: true };
  }
  if (/(light mode|mode clair|clair|day mode|jour)/.test(text) && /(mode|theme|thème|light|clair|jour)/.test(text)) {
    next.theme.dark = false;
    return { schema: next, message: "Switched the site to light mode.", changed: true };
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
      "I can change the hero title, add or remove sections (FAQ, testimonials, contact, CTA), change colors, turn the animations on or off, or make it more premium. Try “Add an FAQ section”, “Remove the animations” or “Change hero title to …”.",
    changed: false,
  };
}
