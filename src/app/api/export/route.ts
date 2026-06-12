import { NextResponse } from "next/server";
import { schemaToHtml, slugForFilename } from "@/lib/export-html";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { parseSiteSchema } from "@/lib/generation/validate";
import { getCurrentUser } from "@/lib/server/auth";
import { entitlementsOf } from "@/lib/server/plans";

export const runtime = "nodejs";

/** POST /api/export — download the generated site as a standalone HTML file. */
export async function POST(req: Request) {
  const limit = rateLimit(`export:${clientKey(req)}`, 30, 60_000);
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
    const branded = !entitlementsOf(user?.plan).removeBranding;

    const html = schemaToHtml(schema, { branded });
    const file = `${slugForFilename(schema.brand.name)}.html`;
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${file}"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to export.", detail: String(err) }, { status: 500 });
  }
}
