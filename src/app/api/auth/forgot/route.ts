import { NextResponse } from "next/server";
import { createServerSupabase, authConfigured } from "@/lib/supabase/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * POST /api/auth/forgot — ask Supabase to email a reset link. The link lands on
 * /api/auth/callback, which exchanges the code for a recovery session and
 * forwards to /reset. Always 200 (no account enumeration).
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`forgot:${clientKey(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Please wait a moment." }, { status: 429 });
  }
  try {
    const { email } = (await req.json()) as { email?: string };
    if (typeof email === "string" && authConfigured()) {
      const redirectTo = `${originOf(req)}/api/auth/callback?next=/reset`;
      await createServerSupabase().auth.resetPasswordForEmail(email, { redirectTo });
    }
  } catch {
    /* swallow; never reveal state */
  }
  return NextResponse.json({ ok: true });
}
