import { NextResponse } from "next/server";
import { endSession } from "@/lib/server/auth";

export const runtime = "nodejs";

/** POST /api/auth/logout — clear the Supabase session. */
export async function POST() {
  await endSession();
  return NextResponse.json({ ok: true });
}
