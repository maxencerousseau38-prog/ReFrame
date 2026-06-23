import { NextResponse } from "next/server";
import { createServerSupabase, authConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * GET /api/auth/callback?code=...&next=... — the landing point for every
 * Supabase email link (signup confirmation, password recovery). Exchanges the
 * one-time code for a session (setting cookies), then forwards to `next`.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard/sites";
  const origin = originOf(req);

  if (code && authConfigured()) {
    const { error } = await createServerSupabase().auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
