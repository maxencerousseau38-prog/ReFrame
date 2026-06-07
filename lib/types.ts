// ─────────────────────────────────────────────────────────────────────────────
// Valoryx domain types
// ─────────────────────────────────────────────────────────────────────────────

export type Verdict =
  | "excellent"
  | "good"
  | "neutral"
  | "high-risk"
  | "avoid";

/** The seven proprietary pillars feeding the Investment Score™. */
export type CriterionKey =
  | "growth"
  | "profitability"
  | "financial-strength"
  | "market-position"
  | "scalability"
  | "risk"
  | "management";

export interface Criterion {
  key: CriterionKey;
  label: string;
  /** 0–100. For "risk", higher = safer (already inverted for display). */
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface FinancialPoint {
  year: string;
  revenue: number; // €M
  ebitda: number; // €M
  netIncome: number; // €M
  valuation: number; // €M
}

export interface RevenueSegment {
  name: string;
  value: number; // share %
}

export interface Competitor {
  name: string;
  score: number;
  revenue: number; // €M
  growth: number; // %
  valuation: number; // €M
  isSelf?: boolean;
}

export interface FundingRound {
  date: string;
  stage: string;
  amount: number; // €M
  leadInvestor: string;
  valuation?: number; // €M post-money
}

export interface ExecMember {
  name: string;
  role: string;
  note: string;
}

export interface ExecutiveSummary {
  whatToKnow: string;
  whyInvest: string[];
  whyNot: string[];
  keyRisk: string;
  upside: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string; // emoji or short mark for the MVP
  sector: string;
  location: string;
  website: string;
  siren: string;
  founded: number;
  headcount: number;
  stage: "Private" | "Public";
  tagline: string;
  score: number; // Investment Score™ 0–100
  verdict: Verdict;
  trend: number; // recent score delta
  summary: ExecutiveSummary;
  criteria: Criterion[];
  financials: FinancialPoint[];
  revenueSegments: RevenueSegment[];
  competitors: Competitor[];
  funding: FundingRound[];
  management: ExecMember[];
  // headline metrics (latest year)
  metrics: {
    revenue: number; // €M
    revenueGrowth: number; // %
    ebitdaMargin: number; // %
    netMargin: number; // %
    cash: number; // €M
    debt: number; // €M
    runwayMonths: number;
    valuation: number; // €M
  };
}

export interface WatchItem {
  companyId: string;
  scoreDelta: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: "funding" | "results" | "risk" | "score";
  title: string;
  detail: string;
  at: string;
  tone: "positive" | "negative" | "neutral";
}
