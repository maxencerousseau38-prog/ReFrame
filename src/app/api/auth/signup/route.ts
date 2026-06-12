import { NextResponse } from "next/server";
import { createUser, publicUser } from "@/lib/server/users-store";
import { startSession } from "@/lib/server/auth";
import { signToken } from "@/lib/server/tokens";
import { sendEmail, verifyEmailTemplate } from "@/lib/server/email";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

const MESSAGES: Record<string, string> = {
  invalid_email: "Enter a valid email address.",
  weak_password: "Use at least 8 characters.",
  exists: "An account with that email already exists.",
};

/** POST /api/auth/signup — create an account and start a session. */
export async function POST(req: Request) {
  const limit = rateLimit(`signup:${clientKey(req)}`, 10, 60_000);
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
    const user = await createUser(email, password);
    startSession(user.id);

    // Send the verification email (best-effort; never blocks signup).
    try {
      const token = signToken("verify-email", user.id, 1000 * 60 * 60 * 24);
      const link = `${originOf(req)}/api/auth/verify?token=${token}`;
      const tpl = verifyEmailTemplate(link);
      await sendEmail({ to: user.email, ...tpl });
    } catch {
      /* ignore email failures */
    }

    return NextResponse.json({ user: publicUser(user) });
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    const message = MESSAGES[code] ?? "Could not create the account.";
    return NextResponse.json({ error: message }, { status: code === "exists" ? 409 : 400 });
  }
}
