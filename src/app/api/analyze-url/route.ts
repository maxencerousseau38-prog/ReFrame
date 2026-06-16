import { NextResponse } from "next/server";
import { analyzeUrl, BlockedUrlError } from "@/lib/generation/engine";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
// Budget room for a static fetch (≤7s) followed by a headless render (≤22s) when
// the page is a JS shell. The render previously outlived the old 15s cap and was
// killed mid-flight, so JS-rendered sites always fell back. 30s fits both.
export const maxDuration = 30;

/** POST /api/analyze-url — analyze an existing website. */
export async function POST(req: Request) {
  const limit = await rateLimit(`analyze:${clientKey(req)}`, 20, 60_000);
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
