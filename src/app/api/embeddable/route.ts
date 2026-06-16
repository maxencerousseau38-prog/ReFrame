import { NextResponse } from "next/server";
import { assertSafeTarget, BlockedUrlError } from "@/lib/generation/engine";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 15;

function normalize(raw: string): string {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/**
 * Whether a site refuses to be embedded in our cross-origin iframe. A
 * third-party page can never list our domain in frame-ancestors, so any
 * X-Frame-Options DENY/SAMEORIGIN or a frame-ancestors directive without a
 * wildcard means it blocks framing.
 */
function blocksFraming(headers: Headers): boolean {
  const xfo = (headers.get("x-frame-options") || "").toLowerCase();
  if (xfo.includes("deny") || xfo.includes("sameorigin")) return true;
  const csp = (headers.get("content-security-policy") || "").toLowerCase();
  const m = csp.match(/frame-ancestors([^;]*)/);
  if (m && !m[1].includes("*")) return true;
  return false;
}

/** GET /api/embeddable?url= — can this site be shown in our before-view iframe? */
export async function GET(req: Request) {
  const limit = rateLimit(`embeddable:${clientKey(req)}`, 40, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw || raw.length > 2048) {
    return NextResponse.json({ error: "A `url` query param is required." }, { status: 400 });
  }
  const url = normalize(raw);
  try {
    await assertSafeTarget(url);
  } catch (err) {
    if (err instanceof BlockedUrlError) {
      return NextResponse.json({ error: "blocked" }, { status: 400 });
    }
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    res.body?.cancel().catch(() => {});
    return NextResponse.json({ embeddable: !blocksFraming(res.headers) });
  } catch {
    // Couldn't reach the site server-side (bot protection, etc.) — let the
    // client optimistically try the iframe; it has its own fallback.
    return NextResponse.json({ embeddable: true });
  } finally {
    clearTimeout(timer);
  }
}
