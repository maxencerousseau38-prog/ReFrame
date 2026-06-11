import { NextResponse } from "next/server";
import type { SiteSchema } from "@/lib/generation/types";
import { schemaToHtml, slugForFilename } from "@/lib/export-html";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** POST /api/export — download the generated site as a standalone HTML file. */
export async function POST(req: Request) {
  const limit = rateLimit(`export:${clientKey(req)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  try {
    const { schema } = (await req.json()) as { schema: SiteSchema };
    if (!schema?.blocks) {
      return NextResponse.json({ error: "`schema` is required." }, { status: 400 });
    }
    const html = schemaToHtml(schema);
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
