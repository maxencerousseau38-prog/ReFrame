import { config } from "@/lib/config";
import type { RawCompany, RawFinancialYear } from "@/lib/pipeline/raw";

// ─────────────────────────────────────────────────────────────────────────────
// Listed companies — generic "Financial Modeling Prep"-style REST shape.
// Swap BASE / field names for your chosen market-data vendor. Returns null when
// unconfigured or not found.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://financialmodelingprep.com/api/v3";

export async function fetchMarketByTicker(ticker: string): Promise<RawCompany | null> {
  const key = config.providers.marketDataKey;
  if (!key) return null;
  const t = ticker.trim().toUpperCase();

  try {
    const [profile, income, balance] = await Promise.all([
      getJson(`${BASE}/profile/${t}?apikey=${key}`),
      getJson(`${BASE}/income-statement/${t}?period=annual&limit=5&apikey=${key}`),
      getJson(`${BASE}/balance-sheet-statement/${t}?period=annual&limit=1&apikey=${key}`),
    ]);

    const p = Array.isArray(profile) ? profile[0] : profile;
    if (!p || !p.companyName) return null;

    const rows: any[] = Array.isArray(income) ? income : [];
    const financials: RawFinancialYear[] = rows
      .map((r) => ({
        year: String(r.calendarYear ?? r.date?.slice(0, 4) ?? ""),
        revenue: numr(r.revenue),
        ebitda: numr(r.ebitda),
        netIncome: numr(r.netIncome),
        valuation: numr(p.mktCap), // market cap as a valuation proxy on the latest line
      }))
      .filter((r) => r.year)
      .reverse();

    const bs = Array.isArray(balance) ? balance[0] : balance;

    return {
      source: ["market-data"],
      name: p.companyName,
      ticker: t,
      website: p.website ?? undefined,
      sector: p.sector ?? p.industry ?? undefined,
      location: [p.city, p.country].filter(Boolean).join(", ") || undefined,
      stage: "Public",
      headcount: numr(p.fullTimeEmployees),
      tagline: p.description ? String(p.description).split(". ")[0] : undefined,
      financials,
      cash: numr(bs?.cashAndCashEquivalents),
      debt: numr(bs?.totalDebt),
      sources: [{ label: "Market data", url: p.website ?? "" }],
    };
  } catch {
    return null;
  }
}

async function getJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

function numr(v: unknown): number | undefined {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : undefined;
}
