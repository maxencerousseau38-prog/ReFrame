import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refreshes the Supabase auth session on each app request and writes any rotated
 * tokens back as cookies. Without this, an expired access token can't be
 * refreshed from a Server Component (cookies are read-only there) and the user
 * appears logged out. Called from the app's middleware for non-published-site
 * hosts. No-ops cleanly when auth env isn't configured.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(req: NextRequest): Promise<NextResponse> {
  let res = NextResponse.next({ request: req });
  if (!URL || !ANON) return res;

  const supabase = createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) => res.cookies.set({ name, value, ...options }));
      },
    },
  });

  // Touching getUser() triggers a refresh + cookie rotation when needed.
  await supabase.auth.getUser();
  return res;
}
