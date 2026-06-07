import type { Company } from "@/lib/types";
import { getSupabaseAdmin } from "./admin";

// ─────────────────────────────────────────────────────────────────────────────
// Report persistence. Stores each generated analysis as a JSON snapshot keyed by
// its external id (SIREN, ticker or slug). This is the simple cache used by the
// running app; the fully-normalized model lives in supabase/schema.sql for the
// production data warehouse. All functions are safe no-ops when Supabase is off.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveReport(company: Company, mode: string): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) return;
  await db.from("reports").upsert(
    {
      external_id: company.id,
      company,
      mode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "external_id" },
  );
}

export async function getReport(externalId: string): Promise<Company | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db
    .from("reports")
    .select("company")
    .eq("external_id", externalId)
    .maybeSingle();
  if (error || !data) return null;
  return data.company as Company;
}
