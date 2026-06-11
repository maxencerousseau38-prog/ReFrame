import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { publicUser } from "@/lib/server/users-store";

export const runtime = "nodejs";

/** GET /api/auth/me — the current user, or null. */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user: user ? publicUser(user) : null });
}
