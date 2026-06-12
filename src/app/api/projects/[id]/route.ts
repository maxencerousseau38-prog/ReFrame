import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getProject, updateProject, deleteProject } from "@/lib/server/projects-store";
import { parseSiteSchema } from "@/lib/generation/validate";

export const runtime = "nodejs";

/** GET /api/projects/:id — full project (schema + analysis), owner only. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const project = await getProject(params.id, user.id);
  if (!project) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({
    id: project.id,
    schema: project.schema,
    analysis: project.analysis ?? null,
    updatedAt: project.updatedAt,
  });
}

/** PUT /api/projects/:id — replace the project's schema, owner only. */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { schema?: unknown } | null;
  const schema = parseSiteSchema(body?.schema);
  if (!schema) return NextResponse.json({ error: "Invalid schema." }, { status: 400 });

  const updated = await updateProject(params.id, user.id, { schema });
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt });
}

/** DELETE /api/projects/:id — delete a project you own. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const ok = await deleteProject(params.id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
