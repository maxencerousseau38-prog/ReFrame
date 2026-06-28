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
