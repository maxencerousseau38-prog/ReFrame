import { NextResponse } from "next/server";
import { analyzeUrl, generateSite } from "@/lib/generation/engine";
import type { SiteAnalysis } from "@/lib/generation/types";

export const runtime = "nodejs";
export const maxDuration = 15;

/**
 * POST /api/generate-site — build a SiteSchema.
 * Accepts either a pre-computed `analysis` or a raw `url` to analyze first.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let analysis: SiteAnalysis | undefined = body.analysis;

    if (!analysis) {
      if (!body.url) {
        return NextResponse.json({ error: "Provide `analysis` or `url`." }, { status: 400 });
      }
      analysis = await analyzeUrl(body.url);
    }

    const schema = generateSite(analysis);
    return NextResponse.json({ schema, analysis });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate the site.", detail: String(err) },
      { status: 500 }
    );
  }
}
