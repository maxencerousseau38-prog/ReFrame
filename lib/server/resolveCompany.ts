import type { Company } from "@/lib/types";
import { getCompany } from "@/lib/data";
import { getReport } from "@/lib/supabase/reports";

// Resolution order for the result page:
//   1. A persisted live report (Supabase) — a company a user actually analysed.
//   2. The deterministic fixtures — the demo universe.
export async function resolveCompany(id: string): Promise<Company | undefined> {
  const live = await getReport(id);
  if (live) return live;
  return getCompany(id);
}
