import { NextResponse } from "next/server";
import { generateSite, generateSiteCrawled, crawlPages, BlockedUrlError } from "@/lib/generation/engine";
import { analyzeUrlV2 } from "@/lib/extraction/analyze";
import { isLLMEnabled, rewriteContent, designSite, type SiteDesign } from "@/lib/llm";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { SiteAnalysis, GenerationMode } from "@/lib/generation/types";
import { runPipeline } from "@/lib/generation/pipeline";

const MODES: GenerationMode[] = ["classic", "preserve", "smart"];

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/generate-site — build a SiteSchema.
 *
 * V5 default: the DNA pipeline (Business Intelligence → Moodboard → Design DNA
 * → Composer → Quality Gate) is the primary path. The deterministic engine
 * remains as a fallback (`engine: "legacy"`) and for multi-page crawls.
 *
 * When Claude is configured the LLM still sharpens the copy BEFORE the DNA
 * pipeline runs, so the Composer works with the best possible content.
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
      analysis = await analyzeUrlV2(body.url);
    }

    // LLM copywriter: sharpen extracted content before the DNA pipeline reads
    // it. The art-direction call is skipped in V5 (DNA replaces it), but the
    // copy rewrite is still valuable.
    if (isLLMEnabled()) {
      const improved = await rewriteContent(analysis);
      analysis = { ...analysis, extractedContent: { ...analysis.extractedContent, ...improved } };
    }

    const mode: GenerationMode = MODES.includes(body.mode) ? body.mode : "smart";
    const useLegacy = body.engine === "legacy" || mode === "classic" || mode === "preserve";

    // ── V5 DNA Pipeline (default) ──────────────────────────────────
    if (!useLegacy) {
      const result = runPipeline(analysis);
      let { schema } = result;

      // Multi-page: crawl other real pages and attach them
      let crawledPages = 0;
      if (body.crawl !== false && analysis.url) {
        try {
          const pages = await crawlPages(analysis.url, 4);
          if (pages.length) {
            crawledPages = pages.length;
            const multiPage = generateSiteCrawled(
              { home: analysis, pages },
              { mode, theme: schema.theme }
            );
            // Preserve DNA-composed home blocks + theme, splice in crawled pages
            multiPage.blocks = schema.blocks;
            multiPage.theme = schema.theme;
            multiPage.recommendations = schema.recommendations;
            multiPage.animations = schema.animations;
            schema = multiPage;
          }
        } catch {
          /* single-page is fine */
        }
      }

      return NextResponse.json({
        schema,
        analysis,
        ai: isLLMEnabled(),
        mode,
        crawledPages,
        // V5 diagnostics: the DNA signature, quality score, and iteration count
        dna: {
          signature: result.dna.signature,
          quality: result.quality.total,
          iterations: result.iterations,
          tier: result.profile.tier,
          direction: result.moodboard.direction,
        },
      });
    }

    // ── Legacy fallback (classic / preserve / explicit) ────────────
    let design: SiteDesign = {};
    if (isLLMEnabled()) {
      design = await designSite(analysis);
    }

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
        /* fall through */
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
