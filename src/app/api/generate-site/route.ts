import { NextResponse } from "next/server";
import { analyzeUrl, generateSite, BlockedUrlError } from "@/lib/generation/engine";
import { isLLMEnabled, rewriteContent } from "@/lib/llm";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { SiteAnalysis } from "@/lib/generation/types";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/generate-site — build a SiteSchema.
 * Accepts a pre-computed `analysis` or a raw `url`. When Claude is configured,
 * the crawled copy is rewritten into sharper on-brand text before generation.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`generate:${clientKey(req)}`, 15, 60_000);
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

    if (isLLMEnabled()) {
      const improved = await rewriteContent(analysis);
      analysis = { ...analysis, extractedContent: { ...analysis.extractedContent, ...improved } };
    }

    const schema = generateSite(analysis);
    return NextResponse.json({ schema, analysis, ai: isLLMEnabled() });
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
