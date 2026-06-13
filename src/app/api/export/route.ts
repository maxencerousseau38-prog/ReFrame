import { NextResponse } from "next/server";
import JSZip from "jszip";
import { schemaToFiles, slugForFilename } from "@/lib/export-html";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { parseSiteSchema } from "@/lib/generation/validate";
import { getCurrentUser } from "@/lib/server/auth";
import { entitlementsOf, effectivePlan } from "@/lib/server/plans";

export const runtime = "nodejs";

/** POST /api/export — download the generated site. Single page -> .html;
 *  multi-page -> a .zip of linked HTML files (index.html + <path>.html). */
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
    const branded = !entitlementsOf(effectivePlan(user)).removeBranding;

    const files = schemaToFiles(schema, { branded });
    const slug = slugForFilename(schema.brand.name);

    if (files.length === 1) {
      return new NextResponse(files[0].html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${slug}.html"`,
        },
      });
    }

    // Multi-page: zip the linked HTML files.
    const zip = new JSZip();
    for (const f of files) zip.file(f.name, f.html);
    const buf = await zip.generateAsync({ type: "arraybuffer" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}.zip"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to export.", detail: String(err) }, { status: 500 });
  }
}
