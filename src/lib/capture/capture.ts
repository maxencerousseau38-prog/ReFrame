/**
 * V2 CAPTURE — orchestrator: tier decision, artifact assembly, CaptureQuality.
 *
 * captureSite() never throws (the SSRF guard on the main URL is the CALLER's
 * duty, as everywhere in V5): every failure degrades into an explicit
 * CaptureQuality state plus notes. No silent fallback, no invented value.
 *
 * Spec: docs/V2_CHANTIER1_CAPTURE_SPEC.md §5
 */

import { fetchStatic, looksLikeChallenge, normalizeUrl } from "@/lib/generation/engine";
import { collectStylesheets } from "./fetch-css";
import { renderCapture } from "./render";
import type {
  CapturedStylesheet,
  CaptureOptions,
  CaptureQuality,
  CaptureTier,
  CaptureViewport,
  FontFaceRecord,
  RenderedSite,
} from "./types";

/** Test seams — kept out of the public CaptureOptions of the spec on purpose. */
export interface CaptureInternals {
  /** Injectable fetch for static HTML + CSS collection (hermetic tests). */
  fetchImpl?: typeof fetch;
  /** CSS sub-resource guard override (integration tests on 127.0.0.1). */
  cssGuard?: (url: string) => Promise<void>;
  /** Injected timestamp (spec: caller-provided, keeps assembly deterministic). */
  capturedAt?: string;
}

/**
 * Capture a URL into a RenderedSite.
 * The caller MUST have run assertSafeTarget(url) beforehand (V5 convention).
 */
export async function captureSite(
  url: string,
  opts: CaptureOptions & CaptureInternals = {}
): Promise<RenderedSite> {
  const started = Date.now();
  const normalized = normalizeUrl(url);
  const wanted = opts.tier ?? "auto";
  const notes: string[] = [];

  /* ---- HTML acquisition (Tier 2 nominal, Tier 1 fallback — traced) ---- */

  let tier: CaptureTier = "static";
  let html = "";
  let rendered: Awaited<ReturnType<typeof renderCapture>> = null;

  if (wanted !== "static") {
    rendered = await renderCapture(normalized, {
      viewports: opts.viewports,
      screenshots: opts.screenshots,
      timeoutMs: opts.timeoutMs,
    });
    if (rendered && rendered.html) {
      tier = "rendered";
      html = rendered.html;
      notes.push(...rendered.notes);
    } else {
      if (rendered) notes.push(...rendered.notes);
      notes.push(
        rendered === null
          ? "no usable local browser; downgraded to static tier"
          : "rendered tier produced no HTML; downgraded to static tier"
      );
      rendered = null;
    }
  }

  if (!html) {
    html = opts.fetchImpl
      ? await staticFetchWith(opts.fetchImpl, normalized)
      : await fetchStatic(normalized);
    if (!html) notes.push("static fetch returned no HTML");
  }

  const challenge = html ? looksLikeChallenge(html) : false;
  if (challenge) notes.push("bot-protection challenge page detected");

  /* ---- stylesheets (both tiers) ---- */

  const css = html
    ? await collectStylesheets(html, normalized, {
        maxFiles: opts.cssBudget?.maxFiles,
        maxBytes: opts.cssBudget?.maxBytes,
        fetchImpl: opts.fetchImpl,
        guard: opts.cssGuard,
      })
    : { stylesheets: [], failed: [], partial: false, notes: ["no HTML; CSS collection skipped"] };
  notes.push(...css.notes);

  /* ---- fonts: loaded (browser) enriched by declared (@font-face parse) ---- */

  const fonts = mergeFonts(rendered?.fonts ?? [], parseFontFaces(css.stylesheets, normalized));

  /* ---- quality (explicit, artifact by artifact) ---- */

  const externalCount = css.stylesheets.filter((s) => s.url).length;
  const screenshots = (rendered?.viewports ?? [])
    .filter((v) => v.screenshot !== null)
    .map((v) => v.viewport as CaptureViewport);

  const quality: CaptureQuality = {
    tier,
    html: html ? (tier === "rendered" ? "rendered" : "static") : "none",
    css:
      css.stylesheets.length === 0
        ? "none"
        : css.partial || css.failed.length > 0
          ? "partial"
          : "full",
    cssFetched: externalCount,
    cssFailed: css.failed,
    computedSnapshot: Boolean(rendered?.viewports.some((v) => v.nodes.length > 0)),
    screenshots,
    fonts: fonts.length > 0 ? "collected" : "none",
    geometry: Boolean(rendered?.viewports.some((v) => v.blocks.length > 0)),
    challenge,
    durationMs: Date.now() - started,
    notes,
  };

  return {
    url: normalized,
    capturedAt: opts.capturedAt ?? new Date().toISOString(),
    html,
    stylesheets: css.stylesheets,
    cssVariables: rendered?.cssVariables ?? {},
    fonts,
    viewports: rendered?.viewports ?? [],
    animations: rendered?.animations ?? [],
    quality,
  };
}

/* -------------------------------------------------------------------------- */
/*  Static fetch with injected implementation (test seam)                     */
/* -------------------------------------------------------------------------- */

async function staticFetchWith(fetchImpl: typeof fetch, url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const res = await fetchImpl(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);
    return res.ok ? await res.text() : "";
  } catch {
    return "";
  }
}

/* -------------------------------------------------------------------------- */
/*  @font-face parsing (declared fonts, verbatim src resolution)              */
/* -------------------------------------------------------------------------- */

const FONT_FACE_RE = /@font-face\s*\{([^}]*)\}/g;
const DESCRIPTOR_RE = /([a-z-]+)\s*:\s*([^;]+);?/g;
const SRC_URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)(?:\s*format\(\s*(['"]?)([^'")]+)\3\s*\))?/g;

/** Extract declared @font-face records from collected stylesheets. */
export function parseFontFaces(
  stylesheets: CapturedStylesheet[],
  baseUrl: string
): FontFaceRecord[] {
  const out: FontFaceRecord[] = [];
  const seen = new Set<string>();

  for (const sheet of stylesheets) {
    const resolveBase = sheet.url ?? baseUrl;
    const faceRe = new RegExp(FONT_FACE_RE.source, FONT_FACE_RE.flags);
    let face: RegExpExecArray | null;
    while ((face = faceRe.exec(sheet.content)) !== null) {
      const body = face[1];
      const desc: Record<string, string> = {};
      const dRe = new RegExp(DESCRIPTOR_RE.source, DESCRIPTOR_RE.flags);
      let d: RegExpExecArray | null;
      while ((d = dRe.exec(body)) !== null) desc[d[1].toLowerCase()] = d[2].trim();

      const family = (desc["font-family"] || "").replace(/^["']|["']$/g, "");
      if (!family) continue;

      // Prefer woff2, then any url(); local()-only faces keep src null.
      let src: string | null = null;
      let firstUrl: string | null = null;
      const sRe = new RegExp(SRC_URL_RE.source, SRC_URL_RE.flags);
      let s: RegExpExecArray | null;
      while ((s = sRe.exec(desc["src"] || "")) !== null) {
        const resolved = safeResolve(s[2], resolveBase);
        if (!resolved) continue;
        if (!firstUrl) firstUrl = resolved;
        const fmt = (s[4] || "").toLowerCase();
        if (fmt === "woff2" || resolved.includes(".woff2")) {
          src = resolved;
          break;
        }
      }
      if (!src) src = firstUrl;

      const weight = desc["font-weight"] || "400";
      const style = desc["font-style"] || "normal";
      const key = `${family}|${weight}|${style}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ family, weight, style, src, status: "declared" });
    }
  }
  return out;
}

function safeResolve(raw: string, base: string): string | null {
  try {
    const u = new URL(raw, base);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

/** Merge browser-loaded fonts with declared ones; declared src enriches loaded. */
export function mergeFonts(
  loaded: FontFaceRecord[],
  declared: FontFaceRecord[]
): FontFaceRecord[] {
  const bySrcKey = new Map<string, FontFaceRecord>();
  for (const d of declared) bySrcKey.set(`${d.family}|${d.weight}|${d.style}`, d);

  const out: FontFaceRecord[] = loaded.map((f) => {
    if (f.src) return f;
    const exact = bySrcKey.get(`${f.family}|${f.weight}|${f.style}`);
    const familyMatch = exact ?? declared.find((d) => d.family === f.family && d.src);
    return familyMatch?.src ? { ...f, src: familyMatch.src } : f;
  });

  const loadedKeys = new Set(loaded.map((f) => `${f.family}|${f.weight}|${f.style}`));
  for (const d of declared) {
    if (!loadedKeys.has(`${d.family}|${d.weight}|${d.style}`)) out.push(d);
  }
  return out;
}
