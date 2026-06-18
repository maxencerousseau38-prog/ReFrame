import { NextResponse } from "next/server";
import { buildSiteExport } from "@/lib/server/export-site";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { parseSiteSchema } from "@/lib/generation/validate";
import { getCurrentUser } from "@/lib/server/auth";
import { entitlementsOf, effectivePlan } from "@/lib/server/plans";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/export — download the generated site, fully self-contained.
 * Single page with no images -> .html; otherwise a .zip with index.html (+ one
 * .html per page) and an assets/ folder of the site's downloaded images.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`export:${clientKey(req)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  try {
    const body = (await req.json().catch(() => null)) as { schema?: unknown } | null;
    const schema = parseSiteSchema(body?.schema);
    if (!schema) {
      return NextResponse.json({ error: "A valid `schema` is required." }, { status: 400 });
    }

    // Plan-gated branding: free plans (and anonymous) ship the badge; paid
    // plans (removeBranding) get a clean export.
    const user = await getCurrentUser();
    const branded = !entitlementsOf(effectivePlan(user)).removeBranding;

    const out = await buildSiteExport(schema, { branded });
    return new NextResponse(out.body, {
      headers: {
        "Content-Type": out.contentType,
        "Content-Disposition": `attachment; filename="${out.filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to export.", detail: String(err) }, { status: 500 });
  }
}
