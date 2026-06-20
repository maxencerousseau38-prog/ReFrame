import { NextResponse } from "next/server";
import { trackView } from "@/lib/server/analytics-store";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** POST /api/track { slug } — record a pageview for a published site. */
export async function POST(req: Request) {
  // Generous cap (real traffic) but bounded against abuse.
  const limit = await rateLimit(`track:${clientKey(req)}`, 120, 60_000);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (slug) await trackView(slug).catch(() => {});
  return NextResponse.json({ ok: true });
}
