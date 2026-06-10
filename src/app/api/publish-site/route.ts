import { NextResponse } from "next/server";
import type { SiteSchema } from "@/lib/generation/types";

export const runtime = "nodejs";

/**
 * POST /api/publish-site — publish a generated site.
 *
 * In production this would write the schema to storage and deploy to the edge.
 * Here we simulate a successful deployment and return a live URL slug.
 */
export async function POST(req: Request) {
  try {
    const { schema } = (await req.json()) as { schema: SiteSchema };
    if (!schema) {
      return NextResponse.json({ error: "`schema` is required." }, { status: 400 });
    }

    const slug = schema.brand.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "site";

    return NextResponse.json({
      ok: true,
      url: `https://${slug}.reframe.site`,
      deployedAt: new Date().toISOString(),
      blocks: schema.blocks.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to publish.", detail: String(err) },
      { status: 500 }
    );
  }
}
