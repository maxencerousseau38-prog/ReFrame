import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { createProject, listProjectsByOwner, projectSummary } from "@/lib/server/projects-store";
import { parseSiteSchema } from "@/lib/generation/validate";
import { rateLimit } from "@/lib/rate-limit";
import type { SiteAnalysis } from "@/lib/generation/types";

export const runtime = "nodejs";

/** GET /api/projects — list the signed-in user's projects (summaries). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const projects = await listProjectsByOwner(user.id);
  return NextResponse.json({ projects: projects.map(projectSummary) });
}

/** POST /api/projects — save a generated project. Body: { schema, analysis? }. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const limit = rateLimit(`proj:${user.id}`, 60, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = (await req.json().catch(() => null)) as { schema?: unknown; analysis?: unknown } | null;
  const schema = parseSiteSchema(body?.schema);
  if (!schema) return NextResponse.json({ error: "Invalid schema." }, { status: 400 });

  const analysis =
    body?.analysis && typeof body.analysis === "object"
      ? (body.analysis as SiteAnalysis)
      : undefined;

  const project = await createProject(user.id, schema, analysis);
  return NextResponse.json({ id: project.id, project: projectSummary(project) }, { status: 201 });
}
