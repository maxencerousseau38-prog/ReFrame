import { NextResponse } from "next/server";
import { runAnalysis } from "@/lib/pipeline/analyze";
import { saveReport } from "@/lib/supabase/reports";
import type { AnalysisInput } from "@/lib/pipeline/raw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/analyze
// Body: { name?, website?, siren?, linkedin?, ticker? }
// → { id, mode, sources }   (the company is persisted; the result page reads it)
export async function POST(req: Request) {
  let input: AnalysisInput;
  try {
    input = (await req.json()) as AnalysisInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!input.name && !input.siren && !input.ticker) {
    return NextResponse.json(
      { error: "Fournir au moins un nom, un SIREN ou un ticker." },
      { status: 422 },
    );
  }

  try {
    const result = await runAnalysis(input);
    // Persist when Supabase is configured (otherwise a safe no-op).
    if (result.mode === "live") {
      await saveReport(result.company, result.mode);
    }
    return NextResponse.json({
      id: result.company.id,
      mode: result.mode,
      sources: result.sources,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Échec de l'analyse", detail: String(err) },
      { status: 500 },
    );
  }
}
