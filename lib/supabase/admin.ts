import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config, capabilities } from "@/lib/config";

// Server-only client using the service role key (bypasses RLS — never expose
// to the browser). Returns null when Supabase isn't configured.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!capabilities.supabase) return null;
  if (cached) return cached;
  cached = createClient(config.supabase.url, config.supabase.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
