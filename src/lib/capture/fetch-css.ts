/**
 * V2 CAPTURE — external stylesheet collection (Tier 1 and Tier 2).
 *
 * Collects every stylesheet a page relies on: <link rel="stylesheet">,
 * inline <style> blocks, then @import chains (recursive, depth ≤ 2).
 * CSS text is stored verbatim — parsing/interpretation is MEASURE's job.
 *
 * Guarantees (spec §6.1):
 *  - every external URL passes the SSRF guard before being fetched;
 *  - hard budgets (files, cumulative bytes, per-file timeout);
 *  - unit failures never throw — they land in `failed` + notes;
 *  - in-memory LRU so multi-page captures of one site reuse shared CSS.
 */

import { parse } from "node-html-parser";
import { assertSafeTarget, BROWSER_UA } from "@/lib/generation/engine";
import type { CapturedStylesheet } from "./types";

/* -------------------------------------------------------------------------- */
/*  Options & result                                                          */
/* -------------------------------------------------------------------------- */

export interface FetchCssOptions {
  /** Max external files fetched (link + import). Default 20. */
  maxFiles?: number;
  /** Max cumulative bytes across external files. Default 3 MB. */
  maxBytes?: number;
  /** Max @import recursion depth. Default 2 (imports of imports). */
  maxDepth?: number;
  /** Per-file fetch timeout. Default 5000 ms. */
  timeoutMs?: number;
  /** Injectable for hermetic tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** URL guard; throws to exclude a URL. Defaults to assertSafeTarget. */
  guard?: (url: string) => Promise<void>;
  /** Bypass the module-level LRU (tests). */
  cache?: boolean;
}

export interface FetchCssResult {
  stylesheets: CapturedStylesheet[];
  /** URLs that could not be collected (fetch error, guard rejection). */
  failed: string[];
  /** True when a budget stopped the collection early. */
  partial: boolean;
  notes: string[];
}

const DEFAULTS = {
  maxFiles: 20,
  maxBytes: 3 * 1024 * 1024,
  maxDepth: 2,
  timeoutMs: 5000,
} as const;

/* -------------------------------------------------------------------------- */
/*  LRU cache (shared CSS across multi-page captures of one site)             */
/* -------------------------------------------------------------------------- */

const CACHE_MAX = 50;
/** Total-bytes ceiling across all cached entries (F6): oldest evicted first. */
const CACHE_MAX_BYTES = 8 * 1024 * 1024;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cssCache = new Map<string, { content: string; at: number; bytes: number }>();
let cssCacheBytes = 0;

function cacheGet(url: string): string | null {
  const hit = cssCache.get(url);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cssCache.delete(url);
    cssCacheBytes -= hit.bytes;
    return null;
  }
  // Refresh recency (Map iteration order = insertion order).
  cssCache.delete(url);
  cssCache.set(url, hit);
  return hit.content;
}

function cacheSet(url: string, content: string): void {
  const bytes = Buffer.byteLength(content);
  if (bytes > CACHE_MAX_BYTES) return; // never let one file own the cache
  const evictOldest = () => {
    const oldest = cssCache.keys().next().value;
    if (oldest === undefined) return false;
    cssCacheBytes -= cssCache.get(oldest)!.bytes;
    cssCache.delete(oldest);
    return true;
  };
  while (cssCache.size >= CACHE_MAX && evictOldest()) { /* count cap */ }
  while (cssCacheBytes + bytes > CACHE_MAX_BYTES && evictOldest()) { /* byte cap (F6) */ }
  cssCache.set(url, { content, at: Date.now(), bytes });
  cssCacheBytes += bytes;
}

/* -------------------------------------------------------------------------- */
/*  HTML discovery                                                            */
/* -------------------------------------------------------------------------- */

interface CssRef {
  url: string;
  media: string | null;
  via: "link" | "import";
  depth: number;
}

/** <link rel=stylesheet> refs + inline <style> blocks from the page HTML. */
function discoverFromHtml(
  html: string,
  baseUrl: string
): { refs: CssRef[]; inline: CapturedStylesheet[]; notes: string[] } {
  const refs: CssRef[] = [];
  const inline: CapturedStylesheet[] = [];
  const notes: string[] = [];

  let root;
  try {
    root = parse(html, { blockTextElements: { style: true } });
  } catch {
    return { refs, inline, notes: ["html parse failed; no stylesheets discovered"] };
  }

  for (const link of root.querySelectorAll("link")) {
    const rel = (link.getAttribute("rel") || "").toLowerCase();
    if (!/\bstylesheet\b/.test(rel)) continue;
    const href = link.getAttribute("href");
    if (!href) continue;
    const url = resolveUrl(href, baseUrl);
    if (!url) {
      notes.push(`unresolvable stylesheet href: ${href.slice(0, 120)}`);
      continue;
    }
    refs.push({ url, media: link.getAttribute("media") || null, via: "link", depth: 0 });
  }

  for (const style of root.querySelectorAll("style")) {
    const content = style.text || "";
    if (!content.trim()) continue;
    inline.push({
      url: null,
      media: style.getAttribute("media") || null,
      content,
      bytes: Buffer.byteLength(content),
      via: "inline",
      depth: 0,
    });
  }

  return { refs, inline, notes };
}

/* -------------------------------------------------------------------------- */
/*  @import discovery inside fetched CSS                                      */
/* -------------------------------------------------------------------------- */

// @import url("a.css") screen;  |  @import "a.css";  |  @import url(a.css);
const IMPORT_RE =
  /@import\s+(?:url\(\s*(['"]?)([^'")]+)\1\s*\)|(['"])([^'"]+)\3)\s*([^;]*);/g;

/** Comments are stripped BEFORE scanning so a commented-out @import can no
 *  longer trigger a bogus fetch and a false "partial" (F11). The stored
 *  stylesheet content itself stays verbatim. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function findImports(
  css: string,
  fromUrl: string
): { url: string; media: string | null }[] {
  const out: { url: string; media: string | null }[] = [];
  const re = new RegExp(IMPORT_RE.source, IMPORT_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const raw = (m[2] || m[4] || "").trim();
    if (!raw) continue;
    const url = resolveUrl(raw, fromUrl);
    if (!url) continue;
    const media = (m[5] || "").trim();
    out.push({ url, media: media || null });
  }
  return out;
}

function resolveUrl(raw: string, base: string): string | null {
  try {
    const u = new URL(raw, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Fetching                                                                  */
/* -------------------------------------------------------------------------- */

async function fetchCssFile(
  url: string,
  timeoutMs: number,
  fetchImpl: typeof fetch
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/css,*/*;q=0.1",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Collect every stylesheet the page relies on.
 * Never throws: all failures degrade into `failed` / `notes`.
 */
export async function collectStylesheets(
  html: string,
  baseUrl: string,
  opts: FetchCssOptions = {}
): Promise<FetchCssResult> {
  const maxFiles = opts.maxFiles ?? DEFAULTS.maxFiles;
  const maxBytes = opts.maxBytes ?? DEFAULTS.maxBytes;
  const maxDepth = opts.maxDepth ?? DEFAULTS.maxDepth;
  const timeoutMs = opts.timeoutMs ?? DEFAULTS.timeoutMs;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const guard = opts.guard ?? assertSafeTarget;
  const useCache = opts.cache ?? true;

  const { refs, inline, notes } = discoverFromHtml(html, baseUrl);
  const stylesheets: CapturedStylesheet[] = [...inline];
  const failed: string[] = [];
  const seen = new Set<string>();
  let fetchedFiles = 0;
  let fetchedBytes = 0;
  let partial = false;

  // Inline <style> @imports participate too (depth starts at 1).
  const queue: CssRef[] = [...refs];
  for (const s of inline) {
    for (const imp of findImports(stripCssComments(s.content), baseUrl)) {
      queue.push({ url: imp.url, media: imp.media, via: "import", depth: 1 });
    }
  }

  while (queue.length > 0) {
    const ref = queue.shift()!;
    if (seen.has(ref.url)) continue;
    seen.add(ref.url);

    if (ref.depth > maxDepth) {
      notes.push(`@import depth cap (${maxDepth}) reached: ${ref.url}`);
      partial = true;
      continue;
    }
    if (fetchedFiles >= maxFiles) {
      notes.push(`file budget (${maxFiles}) reached; remaining stylesheets skipped`);
      partial = true;
      break;
    }
    if (fetchedBytes >= maxBytes) {
      notes.push(`byte budget (${maxBytes}) reached; remaining stylesheets skipped`);
      partial = true;
      break;
    }

    // SSRF guard on EVERY sub-resource URL (spec §9).
    try {
      await guard(ref.url);
    } catch {
      failed.push(ref.url);
      notes.push(`blocked by SSRF guard: ${ref.url}`);
      continue;
    }

    let content = useCache ? cacheGet(ref.url) : null;
    if (content === null) {
      content = await fetchCssFile(ref.url, timeoutMs, fetchImpl);
      if (content !== null && useCache) cacheSet(ref.url, content);
    }
    if (content === null) {
      failed.push(ref.url);
      continue;
    }

    fetchedFiles++;
    fetchedBytes += Buffer.byteLength(content);
    stylesheets.push({
      url: ref.url,
      media: ref.media,
      content,
      bytes: Buffer.byteLength(content),
      via: ref.via,
      depth: ref.depth,
    });

    for (const imp of findImports(stripCssComments(content), ref.url)) {
      queue.push({ url: imp.url, media: imp.media, via: "import", depth: ref.depth + 1 });
    }
  }

  return { stylesheets, failed, partial, notes };
}

/** Test hook: reset the module-level LRU between cases. */
export function __clearCssCache(): void {
  cssCache.clear();
  cssCacheBytes = 0;
}
