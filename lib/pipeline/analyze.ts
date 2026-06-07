import type { Company } from "@/lib/types";
import { COMPANIES, searchCompanies } from "@/lib/data";
import { fetchPappersBySiren } from "@/lib/providers/pappers";
import { fetchMarketByTicker } from "@/lib/providers/marketData";
import { normalizeToCompany } from "./normalize";
import type { AnalysisInput } from "./raw";

export interface AnalysisResult {
  company: Company;
  /** "live" = built from real source data; "fixture" = demo fallback. */
  mode: "live" | "fixture";
  sources: string[];
}

/**
 * Resolve → fetch → normalize → score.
 * Order of resolution:
 *   1. Explicit ticker          → market-data (listed company)
 *   2. SIREN (9 digits)         → Pappers (private French company)
 *   3. Name that looks listed   → market-data
 *   4. Fallback                 → fixtures (so the product always renders)
 */
export async function runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
  const siren = input.siren?.replace(/\s/g, "");
  const ticker = input.ticker?.trim();

  // 1 + 2 — real providers
  if (ticker) {
    const raw = await fetchMarketByTicker(ticker);
    if (raw) return { company: normalizeToCompany(raw), mode: "live", sources: ["market-data"] };
  }
  if (siren && /^\d{9}$/.test(siren)) {
    const raw = await fetchPappersBySiren(siren);
    if (raw) return { company: normalizeToCompany(raw), mode: "live", sources: ["pappers"] };
  }

  // 3 — name looks like a ticker symbol (1–5 uppercase letters)
  if (input.name && /^[A-Z]{1,5}$/.test(input.name.trim())) {
    const raw = await fetchMarketByTicker(input.name.trim());
    if (raw) return { company: normalizeToCompany(raw), mode: "live", sources: ["market-data"] };
  }

  // 4 — fixture fallback (keeps the demo fully functional without keys)
  const match = (input.name ? searchCompanies(input.name) : [])[0] ?? COMPANIES[0];
  return { company: match, mode: "fixture", sources: ["fixture"] };
}
