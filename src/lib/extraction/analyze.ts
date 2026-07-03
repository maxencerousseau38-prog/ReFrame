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
import { captureSite, type RenderedSite } from "@/lib/capture";
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
  return { analysis: toSiteAnalysis(ext), captured };
}
