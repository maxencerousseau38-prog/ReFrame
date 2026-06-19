import { NextResponse } from "next/server";
import { createShare, getShare } from "@/lib/server/shares-store";
import { parseSiteSchema } from "@/lib/generation/validate";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/share — persist a generated redesign and get a shareable /r/<id>
 * URL. No auth: this is what saves an anonymous visitor's rebuild so it isn't
 * lost when the tab closes. GET ?id= returns the stored schema (to reload it
 * into the editor).
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`share:${clientKey(req)}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  const body = (await req.json().catch(() => null)) as { schema?: unknown; analysis?: unknown } | null;
  const schema = parseSiteSchema(body?.schema);
  if (!schema) return NextResponse.json({ error: "A valid `schema` is required." }, { status: 400 });

  const analysis = body?.analysis && typeof body.analysis === "object" ? (body.analysis as never) : undefined;
  const share = await createShare(schema, analysis);
  return NextResponse.json({ id: share.id, url: `/r/${share.id}` });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const share = await getShare(id);
  if (!share) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ schema: share.schema, analysis: share.analysis ?? null });
}
