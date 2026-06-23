import { createServerSupabase, authConfigured } from "@/lib/supabase/server";
import { getUserById, upsertProfile, type User } from "./users-store";

/**
 * Session auth backed by Supabase Auth (GoTrue).
 *
 * The session lives in Supabase's own httpOnly cookies, managed by the
 * cookie-bound client and refreshed in middleware. `getCurrentUser` validates
 * the session against Supabase, then merges the app profile (plan, billing)
 * with the auth user's email + verification state.
 */

/** Surfaced on the health endpoint so a misconfigured deploy is obvious. */
export function authReady(): boolean {
  return authConfigured();
}

/** Resolve the signed-in user, or null. Safe in Server Components and routes. */
export async function getCurrentUser(): Promise<User | null> {
  if (!authConfigured()) return null;
  const supabase = createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  // A DB trigger provisions the profile on signup; upsert as a safety net so a
  // missing row never 500s a signed-in request.
  const profile =
    (await getUserById(user.id)) ?? (await upsertProfile({ id: user.id, email: user.email ?? "" }));

  return {
    ...profile,
    email: profile.email || (user.email ?? ""),
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

/** Clear the session. Call from a Route Handler. */
export async function endSession(): Promise<void> {
  if (!authConfigured()) return;
  await createServerSupabase().auth.signOut();
}
