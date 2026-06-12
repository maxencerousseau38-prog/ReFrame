import { NextResponse } from "next/server";
import { assertSafeTarget, BlockedUrlError } from "@/lib/generation/engine";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const TIMEOUT_MS = 6000;

/**
 * GET /api/img?u=<encoded url> — proxy an external image.
 *
 * Fetches the upstream image server-side and streams it back, so the rendered
 * site doesn't hotlink the client's origin: we control caching, hide the
 * visitor's referrer, validate that the response is actually an image, cap its
 * size, and spoof a Referer to defeat naive hotlink protection.
 *
 * Security: `u` is attacker-controllable, so this is an SSRF sink. We run the
 * same guard as the crawler (public http/https only, no private/loopback/
 * metadata addresses) and only ever return an `image/*` body. (Redirects are
 * followed; the content-type gate keeps non-image internal endpoints from
 * leaking through.) Failures return 404 so the block's gradient fallback shows.
 */
export async function GET(req: Request) {
  const limit = rateLimit(`img:${clientKey(req)}`, 200, 60_000);
  if (!limit.ok) return new NextResponse("Too many requests", { status: 429 });

  const u = new URL(req.url).searchParams.get("u");
  if (!u) return new NextResponse("Missing url", { status: 400 });

  try {
    await assertSafeTarget(u);
  } catch (e) {
    return new NextResponse(e instanceof BlockedUrlError ? "Blocked" : "Bad url", { status: 400 });
  }

  let referer = "";
  try {
    referer = new URL(u).origin;
  } catch {
    /* assertSafeTarget already validated it */
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(u, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ReFrameBot/1.0; +https://reframe.design)",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        Referer: referer,
      },
    });
    clearTimeout(timer);

    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 404 });
    }
    const declared = Number(res.headers.get("content-length") || 0);
    if (declared && declared > MAX_BYTES) {
      return new NextResponse("Too large", { status: 413 });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) return new NextResponse("Too large", { status: 413 });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": String(buf.byteLength),
        // Cache hard: the proxied image for a given URL never changes.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  } catch {
    clearTimeout(timer);
    return new NextResponse("Fetch failed", { status: 404 });
  }
}
