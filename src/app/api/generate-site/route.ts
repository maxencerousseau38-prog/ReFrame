import { NextResponse } from "next/server";
import { analyzeUrl, generateSite, generateSiteCrawled, crawlPages, BlockedUrlError } from "@/lib/generation/engine";
import { isLLMEnabled, rewriteContent, designSite, type SiteDesign } from "@/lib/llm";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { SiteAnalysis, GenerationMode } from "@/lib/generation/types";

const MODES: GenerationMode[] = ["classic", "preserve", "smart"];

export const runtime = "nodejs";
// Room for the LLM rewrite/design plus a bounded multi-page crawl (the home
// analysis is already done; here we only fetch the other real pages).
export const maxDuration = 60;

/**
 * POST /api/generate-site — build a SiteSchema.
 * Accepts a pre-computed `analysis` or a raw `url`. By default it CRAWLS the
 * client's other real pages (nav + sitemap) and keeps them, so the rebuild
 * preserves the whole site. Pass `crawl: false` for a fast single-page build.
 * When Claude is configured, the home copy is rewritten on-brand first.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`generate:${clientKey(req)}`, 15, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  try {
    const body = await req.json();
    let analysis: SiteAnalysis | undefined = body.analysis;

    if (!analysis) {
      if (!body.url) {
        return NextResponse.json({ error: "Provide `analysis` or `url`." }, { status: 400 });
      }
      analysis = await analyzeUrl(body.url);
    }

    // Claude as copywriter (sharper on-brand text) AND art director (page
    // composition + theme). Both run in parallel and degrade to {} on failure.
    let design: SiteDesign = {};
    if (isLLMEnabled()) {
      const [improved, designed] = await Promise.all([rewriteContent(analysis), designSite(analysis)]);
      analysis = { ...analysis, extractedContent: { ...analysis.extractedContent, ...improved } };
      design = designed;
    }

    const mode: GenerationMode = MODES.includes(body.mode) ? body.mode : "preserve";

    // Multi-page: keep the client's whole site. Crawl the OTHER real pages from
    // the home URL (the home analysis we already have stays authoritative, so
    // hybrid-completed edits + the LLM rewrite are preserved). Best-effort: any
    // failure falls back to a clean single-page build.
    let crawledPages = 0;
    if (body.crawl !== false && analysis.url) {
      try {
        const pages = await crawlPages(analysis.url, 4);
        if (pages.length) {
          crawledPages = pages.length;
          const schema = generateSiteCrawled(
            { home: analysis, pages },
            { mode, theme: design.theme }
          );
          return NextResponse.json({ schema, analysis, ai: isLLMEnabled(), mode, crawledPages });
        }
      } catch {
        /* fall through to single-page generation */
      }
    }

    const schema = generateSite(analysis, { mode, layout: design.layout, theme: design.theme });
    return NextResponse.json({ schema, analysis, ai: isLLMEnabled(), mode, crawledPages });
  } catch (err) {
    if (err instanceof BlockedUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to generate the site.", detail: String(err) },
      { status: 500 }
    );
  }
}
