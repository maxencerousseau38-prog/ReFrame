import { assertSafeTarget, BlockedUrlError } from "@/lib/generation/engine";
import { screenshot } from "@/lib/server/render";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

function normalize(raw: string): string {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/**
 * GET /api/screenshot?url= — a PNG of the live site, captured on demand. Used
 * as the "before" preview only for sites that refuse to be framed. Returns 502
 * when no render service is configured, so the client can fall back gracefully.
 */
export async function GET(req: Request) {
  const limit = rateLimit(`shot:${clientKey(req)}`, 20, 60_000);
  if (!limit.ok) return new Response("Too many requests", { status: 429 });

  const raw = new URL(req.url).searchParams.get("url");
  if (!raw || raw.length > 2048) return new Response("url required", { status: 400 });
  const url = normalize(raw);
  try {
    await assertSafeTarget(url);
  } catch (err) {
    if (err instanceof BlockedUrlError) return new Response("blocked", { status: 400 });
    throw err;
  }

  const png = await screenshot(url);
  if (!png) return new Response("unavailable", { status: 502 });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
