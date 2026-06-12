import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
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

/** POST /api/auth/resend-verification — re-send the verification email. */
export async function POST(req: Request) {
  const limit = rateLimit(`resend:${clientKey(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Please wait a moment." }, { status: 429 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const token = signToken("verify-email", user.id, 1000 * 60 * 60 * 24);
  const link = `${originOf(req)}/api/auth/verify?token=${token}`;
  const tpl = verifyEmailTemplate(link);
  const { delivered } = await sendEmail({ to: user.email, ...tpl });
  return NextResponse.json({ ok: true, delivered });
}
