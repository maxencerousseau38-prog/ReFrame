import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/server/tokens";
import { updateUserPassword } from "@/lib/server/users-store";
import { startSession } from "@/lib/server/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** POST /api/auth/reset — set a new password from a reset token. */
export async function POST(req: Request) {
  const limit = await rateLimit(`reset:${clientKey(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Please wait a moment." }, { status: 429 });
  }
  try {
    const { token, password } = (await req.json()) as { token?: string; password?: string };
    if (typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }
    const userId = verifyToken("reset-password", token);
    if (!userId) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }
    const ok = await updateUserPassword(userId, password);
    if (!ok) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    startSession(userId); // sign them in after a successful reset
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    const message = code === "weak_password" ? "Use at least 8 characters." : "Could not reset the password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
