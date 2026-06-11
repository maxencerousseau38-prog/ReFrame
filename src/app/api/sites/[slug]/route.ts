import { NextResponse } from "next/server";
import { getSite, deleteSite } from "@/lib/server/sites-store";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";

/** DELETE /api/sites/:slug — delete a site you own. */
export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const site = await getSite(params.slug);
  if (!site) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (site.ownerId !== user.id) {
    return NextResponse.json({ error: "Not your site." }, { status: 403 });
  }

  await deleteSite(params.slug);
  return NextResponse.json({ ok: true });
}
