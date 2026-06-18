import { NextResponse } from "next/server";
import { getSite } from "@/lib/server/sites-store";
import { getCurrentUser } from "@/lib/server/auth";
import { entitlementsOf, effectivePlan } from "@/lib/server/plans";
import { buildSiteExport } from "@/lib/server/export-site";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/sites/:slug/export — download a published site as a self-contained
 * site (HTML/CSS + bundled images). Owner-only. Lets a customer take their full
 * site and leave at any time: no vendor lock-in.
 */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const limit = await rateLimit(`export:${clientKey(req)}`, 30, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const site = await getSite(params.slug);
  if (!site) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (site.ownerId !== user.id) return NextResponse.json({ error: "Not your site." }, { status: 403 });

  const branded = !entitlementsOf(effectivePlan(user)).removeBranding;
  const out = await buildSiteExport(site.schema, { branded });
  return new NextResponse(out.body, {
    headers: {
      "Content-Type": out.contentType,
      "Content-Disposition": `attachment; filename="${out.filename}"`,
    },
  });
}
