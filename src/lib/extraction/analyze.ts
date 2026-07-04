import type { SiteAnalysis } from "@/lib/generation/types";
import {
  assertSafeTarget,
  BlockedUrlError,
  normalizeUrl,
  fetchStatic,
  looksLikeChallenge,
  needsRendering,
} from "@/lib/generation/engine";
import { canRender, renderHtml } from "@/lib/server/render";
import { localBrowserReady } from "@/lib/server/browser";
import { captureSite, type RenderedSite } from "@/lib/capture";
import { measureTokens } from "@/lib/measure/tokens";
import { measureScenes, heroCtaLabel } from "@/lib/measure/scenes";
import { extractSite } from "./pipeline";
import { toSiteAnalysis } from "./bridge";

function clean(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export { BlockedUrlError };

export async function analyzeUrlV2(rawUrl: string): Promise<SiteAnalysis> {
  const url = normalizeUrl(rawUrl);
  await assertSafeTarget(url);

  let html = await fetchStatic(url);

  const weak = (h: string) => !h || clean(h).length < 220 || looksLikeChallenge(h);
  if ((weak(html) || needsRendering(html)) && (await canRender())) {
    const renderedHtml = await renderHtml(url);
    if (
      renderedHtml &&
      !looksLikeChallenge(renderedHtml) &&
      clean(renderedHtml).length > clean(html).length
    ) {
      html = renderedHtml;
    }
  }

  if (!html) {
    const ext = await extractSite(url, "");
    return toSiteAnalysis(ext);
  }

  if (looksLikeChallenge(html)) {
    const ext = await extractSite(url, "");
    const analysis = toSiteAnalysis(ext);
    analysis.confidence = "fallback";
    analysis.notice =
      "This site sits behind a bot-protection challenge (e.g. Cloudflare) or requires JavaScript, so we couldn't read its content. We've started from a sensible template for your industry - edit the copy to match your business.";
    return analysis;
  }

  const ext = await extractSite(url, html);
  return toSiteAnalysis(ext);
}

/**
 * V2 (Chantier 1): full capture + V5 analysis over the captured HTML.
 * Additive — nothing calls this by default; the V5 path above is untouched.
 * The RenderedSite is not consumed by extraction yet (Chantier 4): callers
 * get it alongside the analysis for measurement work and audits.
 */
export async function analyzeUrlV2WithCapture(
  rawUrl: string
): Promise<{ analysis: SiteAnalysis; captured: RenderedSite }> {
  const url = normalizeUrl(rawUrl);
  await assertSafeTarget(url);

  const captured = await captureSite(url);

  if (!captured.html || captured.quality.challenge) {
    // Same explicit degradation as the V5 path: template fallback, traced.
    const ext = await extractSite(url, "");
    const analysis = toSiteAnalysis(ext);
    analysis.confidence = "fallback";
    if (captured.quality.challenge) {
      analysis.notice =
        "This site sits behind a bot-protection challenge (e.g. Cloudflare) or requires JavaScript, so we couldn't read its content. We've started from a sensible template for your industry - edit the copy to match your business.";
    }
    return { analysis, captured };
  }

  const ext = await extractSite(url, captured.html);
  const analysis = toSiteAnalysis(ext);
  applyCaptureMeasurements(analysis, captured);
  return { analysis, captured };
}

/**
 * Attach the Chantier 4/6 measurements to an analysis. Extracted so both the
 * capture entry point and the production wiring share ONE implementation.
 *  - C4: real design tokens (palette, fonts, spacing…) → the resolver consumes
 *    them with per-field confidence.
 *  - C6: scene-by-scene measurements; the hero CTA measured from computed
 *    styles supersedes the Tier-1 DOM heuristic (F16) when confident.
 */
export function applyCaptureMeasurements(
  analysis: SiteAnalysis,
  captured: RenderedSite
): void {
  analysis.measuredTokens = measureTokens(captured);
  analysis.measuredScenes = measureScenes(captured);
  const measuredCta = heroCtaLabel(analysis.measuredScenes);
  if (measuredCta && measuredCta.confidence >= 0.4) {
    analysis.extractedContent.ctaLabel = measuredCta.value;
  }
}

/**
 * Production wiring (raccordement C4→C6): best-effort measurement of an
 * already-extracted analysis. Reuses the exact capture + measurement code.
 *
 * Byte-identical fallback guarantee — the analysis is returned UNTOUCHED when:
 *  - measurement is disabled (`REFRAME_MEASURE=0`), or
 *  - no local browser can produce a Tier-2 snapshot, or
 *  - the capture degrades (challenge, navigation failure) to a non-rendered
 *    tier without a computed snapshot, or
 *  - anything throws.
 * So when Chromium is unavailable the result equals today's V5 output exactly.
 */
export async function enrichWithMeasurements(
  analysis: SiteAnalysis,
  rawUrl: string
): Promise<SiteAnalysis> {
  if (process.env.REFRAME_MEASURE === "0") return analysis;
  try {
    if (!(await localBrowserReady())) return analysis;
    const url = normalizeUrl(rawUrl);
    const captured = await captureSite(url);
    if (captured.quality.tier !== "rendered" || !captured.quality.computedSnapshot) {
      return analysis; // no real measurements available → unchanged
    }
    applyCaptureMeasurements(analysis, captured);
  } catch {
    /* best-effort: a capture failure must never break generation */
  }
  return analysis;
}
