import { NextResponse } from "next/server";
import { createServerSupabase, authConfigured } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** POST /api/auth/resend-verification — re-send the Supabase confirmation email. */
export async function POST(req: Request) {
  const limit = await rateLimit(`resend:${clientKey(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Please wait a moment." }, { status: 429 });
  }
  if (!authConfigured()) {
    return NextResponse.json({ error: "Accounts aren't set up yet." }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const { error } = await createServerSupabase().auth.resend({
    type: "signup",
    email: user.email,
    options: { emailRedirectTo: `${originOf(req)}/api/auth/callback` },
  });
  return NextResponse.json({ ok: true, delivered: !error });
}
