import { NextResponse } from "next/server";
import { getUserByEmail, verifyPassword, publicUser } from "@/lib/server/users-store";
import { startSession } from "@/lib/server/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** POST /api/auth/login — verify credentials and start a session. */
export async function POST(req: Request) {
  const limit = await rateLimit(`login:${clientKey(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts, please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    // Verify even when the user is missing to avoid leaking which emails exist.
    const ok = user
      ? verifyPassword(password, user.passwordHash)
      : verifyPassword(password, "00:00");
    if (!user || !ok) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    startSession(user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch {
    return NextResponse.json({ error: "Could not sign in." }, { status: 400 });
  }
}
