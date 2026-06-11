import { NextResponse } from "next/server";
import type { SiteSchema } from "@/lib/generation/types";
import { publishSite } from "@/lib/server/sites-store";
import { getCurrentUser } from "@/lib/server/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Resolve the public origin this request came in on. */
function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * POST /api/publish-site — persist a generated site and return a live URL.
 *
 * The schema is written to the server-side store and becomes reachable at
 * `<origin>/s/<slug>`, which renders it for real (no simulation).
 */
export async function POST(req: Request) {
  const limit = rateLimit(`publish:${clientKey(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests, please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { schema } = (await req.json()) as { schema?: SiteSchema };
    if (!schema || !schema.brand?.name || !Array.isArray(schema.blocks)) {
      return NextResponse.json(
        { error: "A valid `schema` with a brand name and blocks is required." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const site = await publishSite(schema, user?.id);

    return NextResponse.json({
      ok: true,
      slug: site.slug,
      url: `${originOf(req)}/s/${site.slug}`,
      deployedAt: site.createdAt,
      blocks: schema.blocks.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to publish.", detail: String(err) },
      { status: 500 }
    );
  }
}
