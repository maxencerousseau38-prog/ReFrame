import { NextResponse } from "next/server";
import { aiEdit } from "@/lib/llm";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import type { SiteSchema } from "@/lib/generation/types";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/ai-edit — apply a natural-language edit to a SiteSchema.
 * Uses Claude when configured, otherwise the deterministic intent router.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`edit:${clientKey(req)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  try {
    const { schema, instruction } = (await req.json()) as {
      schema: SiteSchema;
      instruction: string;
    };
    if (!schema || !instruction || instruction.length > 1000) {
      return NextResponse.json(
        { error: "`schema` and a short `instruction` are required." },
        { status: 400 }
      );
    }
    const result = await aiEdit(schema, instruction);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to apply the edit.", detail: String(err) },
      { status: 500 }
    );
  }
}
