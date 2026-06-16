import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/server/users-store";
import { signToken } from "@/lib/server/tokens";
import { sendEmail, resetPasswordTemplate } from "@/lib/server/email";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** POST /api/auth/forgot — email a reset link. Always 200 (no enumeration). */
export async function POST(req: Request) {
  const limit = await rateLimit(`forgot:${clientKey(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Please wait a moment." }, { status: 429 });
  }
  try {
    const { email } = (await req.json()) as { email?: string };
    if (typeof email === "string") {
      const user = await getUserByEmail(email);
      if (user) {
        const token = signToken("reset-password", user.id, 1000 * 60 * 60);
        const link = `${originOf(req)}/reset?token=${token}`;
        const tpl = resetPasswordTemplate(link);
        await sendEmail({ to: user.email, ...tpl });
      }
    }
  } catch {
    /* swallow; never reveal state */
  }
  return NextResponse.json({ ok: true });
}
