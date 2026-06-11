import { NextResponse } from "next/server";
import { analyzeUrl, BlockedUrlError } from "@/lib/generation/engine";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 15;

/** POST /api/analyze-url — analyze an existing website. */
export async function POST(req: Request) {
  const limit = rateLimit(`analyze:${clientKey(req)}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests, please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string" || url.length > 2048) {
      return NextResponse.json({ error: "A valid `url` string is required." }, { status: 400 });
    }
    const analysis = await analyzeUrl(url);
    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof BlockedUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to analyze the website.", detail: String(err) },
      { status: 500 }
    );
  }
}
