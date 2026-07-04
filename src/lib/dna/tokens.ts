/**
 * V2 Chantier 5 — Token compiler: DesignDNA + measured tokens → render inputs.
 *
 * Produces three artifacts, all fill-only (I1):
 *  - `themePatch`: measured palette roles → the EXISTING optional Theme fields
 *    (surface/surface2/ink/accent/primary/dark). themeVars() already prefers
 *    an explicit theme value over the derived scheme, so deriveScheme()
 *    becomes what the charter demands: a FALLBACK for unmeasured roles only.
 *  - `vars`: --rf-* custom properties compiled from the resolved DNA (whose
 *    leaves already carry measured values via the resolver) — the vocabulary
 *    Chantiers 7/9 components will consume.
 *  - real fonts: exact measured families (+ safe fallback stacks) and the
 *    @font-face rules to load them.
 *
 * Confidence gate: a measured role below LOW_CONFIDENCE_MEASURED (0.4, the
 * charter A2 threshold) is NOT applied — the derived fallback keeps the role,
 * and nothing is ever invented.
 */

import type { Theme } from "@/lib/generation/types";
import type { DesignDNA } from "@/lib/generation/dna";
import type { MeasuredTokens, MeasuredValue } from "@/lib/measure/tokens";
import { LOW_CONFIDENCE_MEASURED } from "./provenance";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface CompiledTokens {
  /** Fill-only Theme enrichment from the measured palette (confidence-gated). */
  themePatch: Partial<Pick<Theme, "surface" | "surface2" | "ink" | "accent" | "primary" | "dark">>;
  /** --rf-* variables for the renderer (typography, spacing, radius, shadow…). */
  vars: Record<string, string>;
  /** @font-face rules for the site's real fonts (woff2/url sources only). */
  fontFaceCss: string;
  /** Exact measured families with safe fallback stacks appended. */
  fontFamilies: { display?: string; body?: string };
  /** Provenance of every emitted key — answers "why this value?". */
  sources: Record<string, "measured" | "dna">;
}

export const TOKEN_CONFIDENCE_FLOOR = LOW_CONFIDENCE_MEASURED;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function confident<T>(mv: MeasuredValue<T> | undefined): T | undefined {
  return mv !== undefined && mv.confidence >= TOKEN_CONFIDENCE_FLOOR ? mv.value : undefined;
}

const SERIF_HINT = /serif|playfair|fraunces|merriweather|lora|georgia|cormorant|garamond|baskerville|canela|freight/i;

/** Quote a family name when needed and append a coherent generic stack. */
function withFallback(family: string): string {
  const quoted = /[^a-zA-Z0-9-]/.test(family) ? `"${family}"` : family;
  const generic = SERIF_HINT.test(family)
    ? "Georgia, serif"
    : "system-ui, -apple-system, sans-serif";
  return `${quoted}, ${generic}`;
}

const cssEscapeUrl = (u: string): string => u.replace(/["\\)]/g, encodeURIComponent);

/* -------------------------------------------------------------------------- */
/*  compileTokens                                                             */
/* -------------------------------------------------------------------------- */

const MAX_FONT_FACES = 12;

export function compileTokens(
  dna: DesignDNA,
  measured?: MeasuredTokens
): CompiledTokens {
  const sources: Record<string, "measured" | "dna"> = {};
  const themePatch: CompiledTokens["themePatch"] = {};
  const fontFamilies: CompiledTokens["fontFamilies"] = {};

  /* ---- measured palette → Theme (deriveScheme keeps unmeasured roles) ---- */

  if (measured) {
    const p = measured.palette;
    const surface = confident(p.surface);
    const surface2 = confident(p.surface2);
    const ink = confident(p.ink);
    const accent = confident(p.accent);
    const dark = confident(measured.prefersDark);

    if (surface) { themePatch.surface = surface; sources["theme.surface"] = "measured"; }
    if (surface2) { themePatch.surface2 = surface2; sources["theme.surface2"] = "measured"; }
    if (ink) {
      themePatch.ink = ink;
      // Headings ("--brand") use theme.primary on light surfaces: the real
      // site's heading colour IS its ink. themeVars still runs ensureReadable.
      themePatch.primary = ink;
      sources["theme.ink"] = "measured";
      sources["theme.primary"] = "measured";
    }
    if (accent) { themePatch.accent = accent; sources["theme.accent"] = "measured"; }
    if (dark !== undefined) { themePatch.dark = dark; sources["theme.dark"] = "measured"; }
  }

  /* ---- real fonts ---- */

  if (measured) {
    const display = confident(measured.typography.displayFont);
    const body = confident(measured.typography.bodyFont);
    if (display) { fontFamilies.display = withFallback(display); sources["font.display"] = "measured"; }
    if (body) { fontFamilies.body = withFallback(body); sources["font.body"] = "measured"; }
  }

  const usedFamilies = new Set(
    [confident(measured?.typography.displayFont), confident(measured?.typography.bodyFont)]
      .filter((f): f is string => Boolean(f))
  );
  const faces = (measured?.fonts ?? [])
    .filter((f) => f.src && (usedFamilies.size === 0 || usedFamilies.has(f.family)))
    .slice(0, MAX_FONT_FACES);
  const fontFaceCss = faces
    .map(
      (f) =>
        `@font-face{font-family:"${f.family}";font-weight:${f.weight};` +
        `font-style:${f.style};src:url("${cssEscapeUrl(f.src!)}") format("woff2");font-display:swap;}`
    )
    .join("\n");

  /* ---- --rf-* variables from the resolved DNA ---- */
  // The DNA's leaves already went through the resolver: measured values (e.g.
  // the fluid display clamp) are in there with full provenance in the trace.

  const vars: Record<string, string> = {
    "--rf-text-display": dna.typeScale.display,
    "--rf-text-h2": dna.typeScale.h2,
    "--rf-text-h3": dna.typeScale.h3,
    "--rf-text-body": dna.typeScale.body,
    "--rf-text-small": dna.typeScale.small,
    "--rf-tracking": dna.typeScale.tracking,
    "--rf-heading-weight": String(dna.typeScale.headingWeight),
    "--rf-space-section": `${Math.round(80 * dna.rhythm.spacingMultiplier)}px`,
    "--rf-radius-card": dna.cardSystem.radius,
    "--rf-shadow-card": dna.cardSystem.shadow,
    "--rf-radius-cta":
      dna.ctaDirection.style === "pill" ? "9999px" :
      dna.ctaDirection.style === "sharp" ? "0px" : "10px",
    "--rf-container": dna.contentMaxWidth,
    "--rf-dur": `${dna.motion.duration}s`,
    "--rf-stagger": `${dna.motion.staggerDelay}s`,
  };
  for (const key of Object.keys(vars)) sources[key] = "dna";

  if (fontFamilies.display) { vars["--rf-font-display"] = fontFamilies.display; sources["--rf-font-display"] = "measured"; }
  if (fontFamilies.body) { vars["--rf-font-body"] = fontFamilies.body; sources["--rf-font-body"] = "measured"; }

  return { themePatch, vars, fontFaceCss, fontFamilies, sources };
}
