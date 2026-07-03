/**
 * V2 CAPTURE — contract types.
 *
 * CAPTURE turns a URL into a RenderedSite: the source site as a human sees
 * it, at three widths. Charter rule for this stage: collection only, never
 * interpretation — no semantic typing, no palette, no mood. Everything a
 * RenderedSite carries is "measured" by definition; the Sourced<T> wrapper
 * (Chantier 2) is applied at the RESOLVE boundary, not here.
 *
 * Spec: docs/V2_CHANTIER1_CAPTURE_SPEC.md
 */

/** Reference widths for all of V2 (capture, render, verify). */
export const CAPTURE_VIEWPORTS = [390, 768, 1440] as const;
export type CaptureViewport = (typeof CAPTURE_VIEWPORTS)[number];

export type CaptureTier = "static" | "rendered";

/** Explicit per-artifact state — a capture never fails silently (charter). */
export interface CaptureQuality {
  tier: CaptureTier;
  html: "rendered" | "static" | "none";
  /** partial = budget reached or some fetches failed. */
  css: "full" | "partial" | "none";
  cssFetched: number;
  /** URLs that could not be collected, kept for traceability. */
  cssFailed: string[];
  computedSnapshot: boolean;
  /** Widths actually captured. */
  screenshots: CaptureViewport[];
  fonts: "collected" | "none";
  geometry: boolean;
  /** Bot-protection page detected. */
  challenge: boolean;
  durationMs: number;
  /** Human-readable anomalies (e.g. "infinite scroll capped at 12000px"). */
  notes: string[];
}

export interface CapturedStylesheet {
  /** null = inline <style> block. */
  url: string | null;
  /** media attribute / @import media condition, when present. */
  media: string | null;
  /** Raw CSS text — stored verbatim, never parsed here (MEASURE's job). */
  content: string;
  bytes: number;
  via: "link" | "import" | "inline";
  /** @import depth (0 = referenced directly by the page). */
  depth: number;
}

export interface FontFaceRecord {
  /** As declared, e.g. "Inter Display". */
  family: string;
  /** "400", "100 900" (variable fonts keep their range). */
  weight: string;
  style: string;
  /** Resolved file URL (woff2 preferred), when determinable. */
  src: string | null;
  /** "loaded" = observed via document.fonts; "declared" = @font-face parse only. */
  status: "loaded" | "declared";
}

export interface DOMRectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Computed styles of one structural node, at one viewport. */
export interface ComputedNodeStyle {
  /** Short reproducible selector, stable across viewports:
   *  "section:nth-of-type(3) > h2:nth-of-type(1)". */
  path: string;
  tag: string;
  role: "block" | "heading" | "text" | "media" | "action" | "nav";
  /** First 160 chars, trimmed. Collection, not content modelling. */
  text?: string;
  rect: DOMRectLike;
  /** Subset of getComputedStyle limited to COMPUTED_PROPS (see snapshot.ts). */
  styles: Record<string, string>;
}

/**
 * RAW top-level block geometry — deliberately semantics-free (charter).
 * Typing blocks as hero/features/… belongs to MEASURE (Chantier 6).
 */
export interface RawBlockGeometry {
  path: string;
  rect: DOMRectLike;
  /** Computed values, verbatim ("none" included). */
  backgroundColor: string;
  backgroundImage: string;
  childCount: number;
  /** First h1–h3 inside, raw text, when present. */
  headingText: string | null;
}

export interface CssAnimationRecord {
  /** Node carrying the animation/transition. */
  path: string;
  kind: "transition" | "animation" | "webAnimation";
  /** Animated properties (transition-property / keyframe name target props). */
  properties: string[];
  /** ms */
  duration: number;
  easing: string;
  /** ms */
  delay: number;
}

/** One full pass at a given viewport width. */
export interface ViewportCapture {
  viewport: CaptureViewport;
  /** Full-page JPEG. null when the screenshot failed (traced in quality). */
  screenshot: Buffer | null;
  nodes: ComputedNodeStyle[];
  blocks: RawBlockGeometry[];
  scrollHeight: number;
}

/** THE Chantier 1 output — MEASURE's input (Chantiers 4/6). */
export interface RenderedSite {
  /** Final normalized URL (post-redirect). */
  url: string;
  /** ISO timestamp, injected by the caller. */
  capturedAt: string;
  /** Post-JS serialized DOM (Tier 2) or static HTML (Tier 1). */
  html: string;
  stylesheets: CapturedStylesheet[];
  /** :root custom properties, resolved via getComputedStyle — raw collection. */
  cssVariables: Record<string, string>;
  fonts: FontFaceRecord[];
  /** Empty in Tier 1. */
  viewports: ViewportCapture[];
  /** Empty in Tier 1. */
  animations: CssAnimationRecord[];
  quality: CaptureQuality;
}

export interface CaptureOptions {
  /** "auto" (default): Tier 2 when a browser is available, else Tier 1. */
  tier?: CaptureTier | "auto";
  viewports?: readonly CaptureViewport[];
  /** Default true (Tier 2 only). */
  screenshots?: boolean;
  /** Defaults: 20 files / 3 MB. */
  cssBudget?: { maxFiles: number; maxBytes: number };
  /** Global Tier 2 budget. Default 30_000. */
  timeoutMs?: number;
}
