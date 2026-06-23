import { NextResponse } from "next/server";
import { createServerSupabase, authConfigured } from "@/lib/supabase/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/auth/reset — set a new password.
 *
 * The user arrives here with a recovery session already established by
 * /api/auth/callback (from the emailed link), so we just update the password on
 * the current Supabase session. No token is handled app-side anymore.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`reset:${clientKey(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Please wait a moment." }, { status: 429 });
  }
  if (!authConfigured()) {
    return NextResponse.json({ error: "Accounts aren't set up yet." }, { status: 503 });
  }
  try {
    const { password } = (await req.json()) as { password?: string };
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Request a new one." },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return NextResponse.json({ error: "Could not reset the password." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reset the password." }, { status: 400 });
  }
}
