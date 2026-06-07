import type { RawCompany, RawFinancialYear } from "./raw";

// ─────────────────────────────────────────────────────────────────────────────
// Pure financial mathematics. These are the "hard" numbers — always computed
// deterministically from the source data, never by the LLM. This is what makes
// a Valoryx analysis trustworthy rather than hallucinated.
// All outputs in % unless stated; monetary helpers convert EUR → €M.
// ─────────────────────────────────────────────────────────────────────────────

export const toMillions = (eur?: number): number =>
  eur == null ? 0 : +(eur / 1_000_000).toFixed(1);

const safeDiv = (a: number, b: number): number => (b === 0 ? 0 : a / b);

export interface DerivedMetrics {
  revenue: number; // €M, latest
  revenueGrowth: number; // % YoY, latest
  cagr: number; // % compound annual growth over the window
  ebitdaMargin: number; // %
  netMargin: number; // %
  cash: number; // €M
  debt: number; // €M
  netDebt: number; // €M (debt - cash)
  netDebtToEbitda: number | null; // x, null if EBITDA <= 0
  runwayMonths: number; // 999 = effectively infinite (profitable)
  valuation: number; // €M, latest
  revenueMultiple: number | null; // EV / revenue
}

export function deriveMetrics(raw: RawCompany): DerivedMetrics {
  const f = [...raw.financials].sort((a, b) => a.year.localeCompare(b.year));
  const last = f[f.length - 1] ?? {};
  const prev = f[f.length - 2];
  const first = f[0];

  const revenue = toMillions(last.revenue);
  const prevRevenue = toMillions(prev?.revenue);
  const revenueGrowth =
    prev && prevRevenue !== 0
      ? +(safeDiv(revenue - prevRevenue, prevRevenue) * 100).toFixed(1)
      : 0;

  // CAGR over the available window
  const years = f.length - 1;
  const cagr =
    first && first.revenue && last.revenue && years > 0 && first.revenue > 0
      ? +((Math.pow(last.revenue / first.revenue, 1 / years) - 1) * 100).toFixed(1)
      : revenueGrowth;

  const ebitdaMargin =
    last.ebitda != null && last.revenue
      ? +(safeDiv(last.ebitda, last.revenue) * 100).toFixed(1)
      : 0;
  const netMargin =
    last.netIncome != null && last.revenue
      ? +(safeDiv(last.netIncome, last.revenue) * 100).toFixed(1)
      : 0;

  const cash = toMillions(raw.cash);
  const debt = toMillions(raw.debt);
  const netDebt = +(debt - cash).toFixed(1);

  const ebitdaM = toMillions(last.ebitda);
  const netDebtToEbitda = ebitdaM > 0 ? +safeDiv(netDebt, ebitdaM).toFixed(1) : null;

  // Runway: if profitable (EBITDA>0) treat as effectively infinite, else cash / burn.
  let runwayMonths = 999;
  if (ebitdaM <= 0) {
    const burn =
      raw.monthlyBurn != null
        ? toMillions(raw.monthlyBurn)
        : Math.abs(ebitdaM) / 12; // approximate monthly burn from annual EBITDA loss
    runwayMonths = burn > 0 ? Math.round(safeDiv(cash, burn)) : 999;
  }

  const valuation = toMillions(last.valuation);
  const revenueMultiple = revenue > 0 && valuation > 0 ? +safeDiv(valuation, revenue).toFixed(1) : null;

  return {
    revenue,
    revenueGrowth,
    cagr,
    ebitdaMargin,
    netMargin,
    cash,
    debt,
    netDebt,
    netDebtToEbitda,
    runwayMonths,
    valuation,
    revenueMultiple,
  };
}

// ── Piecewise mappers: ratio → pillar score (0..100) ─────────────────────────
// Tuned to institutional intuition. These give a real, defensible score from
// the financials alone; the qualitative pillars are refined by the AI layer
// (phase 2) but already have a sensible financial prior here.

const ramp = (x: number, lo: number, hi: number): number =>
  Math.max(0, Math.min(100, ((x - lo) / (hi - lo)) * 100));

export function growthScore(m: DerivedMetrics): number {
  // 0% → 20, 100%+ → ~96
  return Math.round(Math.max(20, ramp(m.revenueGrowth, -10, 110) * 0.96 + 20 * (1 - ramp(m.revenueGrowth, -10, 110) / 100)));
}

export function profitabilityScore(m: DerivedMetrics): number {
  const ebit = ramp(m.ebitdaMargin, -40, 40); // -40% → 0, +40% → 100
  const net = ramp(m.netMargin, -50, 30);
  return Math.round(0.6 * ebit + 0.4 * net);
}

export function financialStrengthScore(m: DerivedMetrics): number {
  const runway = m.runwayMonths >= 24 ? 100 : ramp(m.runwayMonths, 3, 24);
  const leverage =
    m.netDebtToEbitda == null
      ? 60 // unknown / pre-profit → neutral
      : ramp(-m.netDebtToEbitda, -5, 1) ; // net cash (negative netDebt) scores high
  return Math.round(0.6 * runway + 0.4 * leverage);
}

export function riskScore(m: DerivedMetrics): number {
  // Higher = safer. Driven by runway, leverage and profitability.
  const runway = m.runwayMonths >= 24 ? 90 : ramp(m.runwayMonths, 3, 24);
  const profitable = m.ebitdaMargin > 0 ? 80 : ramp(m.ebitdaMargin, -50, 0);
  const leverage = m.netDebt <= 0 ? 90 : ramp(-m.netDebt, -200, 0);
  return Math.round(0.4 * runway + 0.35 * profitable + 0.25 * leverage);
}
