import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cookie-bound Supabase client for AUTH (identity), used in route handlers and
 * Server Components. This is the GoTrue side of Supabase: sign-up, sign-in,
 * sign-out, email confirmation and password reset all flow through it, and the
 * session lives in Supabase's own httpOnly cookies.
 *
 * It uses the public ANON key (safe to expose) — never the service-role key.
 * Data access stays on the separate service-role client in `../server/supabase`.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the auth env (project URL + anon key) is configured. */
export function authConfigured(): boolean {
  return Boolean(URL && ANON);
}

export function createServerSupabase() {
  if (!URL || !ANON) {
    throw new Error(
      "Supabase Auth is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  const store = cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set({ name, value, ...options }));
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware (updateSession) refreshes the session instead, so this
          // is safe to ignore.
        }
      },
    },
  });
}
