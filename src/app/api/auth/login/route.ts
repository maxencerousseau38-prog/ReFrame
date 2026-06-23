import { NextResponse } from "next/server";
import { createServerSupabase, authConfigured } from "@/lib/supabase/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** POST /api/auth/login — verify credentials and start a Supabase session. */
export async function POST(req: Request) {
  const limit = await rateLimit(`login:${clientKey(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts, please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  if (!authConfigured()) {
    return NextResponse.json({ error: "Accounts aren't set up yet." }, { status: 503 });
  }

  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Surface unconfirmed-email distinctly; everything else is a generic 401
      // to avoid leaking which emails exist.
      if (/email not confirmed/i.test(error.message)) {
        return NextResponse.json(
          { error: "Confirm your email first — check your inbox for the link." },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not sign in." }, { status: 400 });
  }
}
