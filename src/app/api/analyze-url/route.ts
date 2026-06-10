import { NextResponse } from "next/server";
import { analyzeUrl } from "@/lib/generation/engine";

export const runtime = "nodejs";
export const maxDuration = 15;

/** POST /api/analyze-url — analyze an existing website. */
export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A `url` string is required." }, { status: 400 });
    }
    const analysis = await analyzeUrl(url);
    return NextResponse.json({ analysis });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to analyze the website.", detail: String(err) },
      { status: 500 }
    );
  }
}
