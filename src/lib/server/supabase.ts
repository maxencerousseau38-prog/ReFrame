import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared server-side Supabase client.
 *
 * ReFrame's data layer is a set of small stores (users, sites, projects,
 * shares, leads, analytics), each picking a backend from the environment.
 * Supabase is the durable, multi-instance option that sits ABOVE Vercel KV in
 * precedence: when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are present,
 * every store talks to Postgres; otherwise they fall back to KV, then disk.
 *
 * We connect with the SERVICE-ROLE key and use it only from the server. The
 * service role bypasses Row Level Security, which is why every table has RLS
 * enabled with no policies: the anon / publishable key can read or write
 * nothing, and the only path to the data is through this server process.
 */

const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when both the project URL and a service-role key are configured. */
export function supabaseConfigured(): boolean {
  return Boolean(URL && SERVICE_KEY);
}

let client: SupabaseClient | null = null;

/**
 * The process-wide Supabase client, created lazily. Throws if called when the
 * env isn't configured — callers gate on `supabaseConfigured()` first (the
 * store selection does this once at module load).
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured()) {
    throw new Error("Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  }
  if (!client) {
    client = createClient(URL as string, SERVICE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-application-name": "reframe" } },
    });
  }
  return client;
}
