import { NextResponse } from "next/server";
import { endSession } from "@/lib/server/auth";

export const runtime = "nodejs";

/** POST /api/auth/logout — clear the session. */
export async function POST() {
  endSession();
  return NextResponse.json({ ok: true });
}
