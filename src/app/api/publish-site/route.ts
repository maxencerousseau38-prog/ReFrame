import { NextResponse } from "next/server";
import { publishSite, listSitesByOwner } from "@/lib/server/sites-store";
import { getCurrentUser } from "@/lib/server/auth";
import { entitlementsOf } from "@/lib/server/plans";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { parseSiteSchema } from "@/lib/generation/validate";

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
    const body = (await req.json().catch(() => null)) as { schema?: unknown } | null;
    // Validate before persisting: a published site is served to the public, so
    // a malformed or tampered schema must never reach the renderer.
    const schema = parseSiteSchema(body?.schema);
    if (!schema) {
      return NextResponse.json(
        { error: "A valid `schema` with a brand name and blocks is required." },
        { status: 400 }
      );
    }

    const publicUrlFor = (slug: string) => {
      const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
      return root ? `https://${slug}.${root}` : `${originOf(req)}/s/${slug}`;
    };

    const user = await getCurrentUser();

    // Enforce the plan's published-site limit for signed-in users.
    if (user) {
      const limit = entitlementsOf(user.plan).maxPublishedSites;
      const owned = await listSitesByOwner(user.id);
      if (owned.length >= limit) {
        return NextResponse.json(
          {
            error: `Your plan allows ${limit} published site${limit === 1 ? "" : "s"}. Upgrade to publish more.`,
            code: "plan_limit",
          },
          { status: 402 }
        );
      }
    }

    const site = await publishSite(schema, user?.id);

    return NextResponse.json({
      ok: true,
      slug: site.slug,
      url: publicUrlFor(site.slug),
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
