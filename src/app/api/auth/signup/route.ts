import { NextResponse } from "next/server";
import { createServerSupabase, authConfigured } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/server/users-store";
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
 * POST /api/auth/signup — create a Supabase Auth account.
 *
 * Supabase sends the confirmation email. If the project requires confirmation,
 * no session is returned yet and we tell the client to check their inbox;
 * otherwise the session cookies are set and they're signed in.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`signup:${clientKey(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts, please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  if (!authConfigured()) {
    return NextResponse.json(
      { error: "Accounts aren't set up yet. Configure Supabase Auth and redeploy." },
      { status: 503 }
    );
  }

  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${originOf(req)}/api/auth/callback` },
    });
    if (error) {
      const exists = /already registered|already exists|User already/i.test(error.message);
      return NextResponse.json(
        { error: exists ? "An account with that email already exists." : error.message },
        { status: exists ? 409 : 400 }
      );
    }

    // Session present => signed in immediately. Absent => email confirmation
    // is required before the first sign-in.
    return NextResponse.json({ ok: true, needsConfirmation: !data.session });
  } catch {
    return NextResponse.json({ error: "Could not create the account." }, { status: 400 });
  }
}
