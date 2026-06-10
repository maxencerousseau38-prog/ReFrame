import { NextResponse } from "next/server";
import { applyAiEdit } from "@/lib/generation/engine";
import type { SiteSchema } from "@/lib/generation/types";

export const runtime = "nodejs";

/** POST /api/ai-edit — apply a natural-language edit to a SiteSchema. */
export async function POST(req: Request) {
  try {
    const { schema, instruction } = (await req.json()) as {
      schema: SiteSchema;
      instruction: string;
    };
    if (!schema || !instruction) {
      return NextResponse.json(
        { error: "`schema` and `instruction` are required." },
        { status: 400 }
      );
    }
    const result = applyAiEdit(schema, instruction);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to apply the edit.", detail: String(err) },
      { status: 500 }
    );
  }
}
