// ─────────────────────────────────────────────────────────────────────────────
// Provider-agnostic "raw" shape.
//
// Every data source (Pappers, INSEE Sirene, market-data API…) maps its response
// into this normalized structure. All monetary amounts are in EUR (not €M) and
// may be undefined when a source does not expose them — the normalization layer
// downstream handles gaps gracefully.
// ─────────────────────────────────────────────────────────────────────────────

export type DataSource =
  | "pappers"
  | "insee"
  | "inpi"
  | "market-data"
  | "crunchbase"
  | "fixture";

export interface RawFinancialYear {
  year: string;
  revenue?: number; // EUR
  ebitda?: number; // EUR
  netIncome?: number; // EUR
  valuation?: number; // EUR (post-money / market cap)
  grossMargin?: number; // ratio 0..1 when known
}

export interface RawFunding {
  date: string;
  stage: string;
  amount: number; // EUR
  leadInvestor: string;
  valuation?: number; // EUR
}

export interface RawManager {
  name: string;
  role: string;
  note?: string;
}

export interface RawCompany {
  source: DataSource[];
  // identity
  name: string;
  siren?: string;
  ticker?: string;
  website?: string;
  linkedin?: string;
  sector?: string;
  location?: string;
  stage: "Private" | "Public";
  founded?: number;
  headcount?: number;
  tagline?: string;
  // financials (most recent last)
  financials: RawFinancialYear[];
  cash?: number; // EUR
  debt?: number; // EUR
  monthlyBurn?: number; // EUR/month, when derivable
  // optional enrichment
  funding?: RawFunding[];
  management?: RawManager[];
  sources?: { label: string; url: string }[];
}

export interface AnalysisInput {
  name?: string;
  website?: string;
  siren?: string;
  linkedin?: string;
  ticker?: string;
}
