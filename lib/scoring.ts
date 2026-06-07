import type { Criterion, CriterionKey, Verdict } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Investment Score™ — Valoryx proprietary scoring engine
//
// Each of the seven pillars is graded 0–100. The final score is a weighted
// blend tuned to reflect how an institutional investment committee actually
// weighs a private/public opportunity: durable growth + cash generation matter
// most, while risk acts as a multiplicative drag rather than a simple average.
// ─────────────────────────────────────────────────────────────────────────────

export const CRITERION_META: Record<
  CriterionKey,
  { label: string; weight: number; icon: string }
> = {
  growth: { label: "Croissance", weight: 0.2, icon: "TrendingUp" },
  profitability: { label: "Rentabilité", weight: 0.18, icon: "Coins" },
  "financial-strength": {
    label: "Solidité financière",
    weight: 0.16,
    icon: "ShieldCheck",
  },
  "market-position": {
    label: "Position marché",
    weight: 0.15,
    icon: "Crosshair",
  },
  scalability: { label: "Scalabilité", weight: 0.13, icon: "Rocket" },
  management: { label: "Management", weight: 0.1, icon: "Users" },
  risk: { label: "Risque", weight: 0.08, icon: "AlertTriangle" },
};

export const CRITERION_ORDER: CriterionKey[] = [
  "growth",
  "profitability",
  "financial-strength",
  "market-position",
  "scalability",
  "management",
  "risk",
];

/**
 * Compute the final Investment Score™ from the seven pillars.
 * Risk is treated as a confidence multiplier: a low risk score (i.e. high
 * danger) erodes an otherwise strong fundamental profile — exactly how a real
 * committee discounts a fragile balance sheet or a single-customer dependency.
 */
export function computeInvestmentScore(criteria: Criterion[]): number {
  const byKey = new Map(criteria.map((c) => [c.key, c.score]));

  let fundamentals = 0;
  let fundamentalWeight = 0;
  for (const key of CRITERION_ORDER) {
    if (key === "risk") continue;
    const weight = CRITERION_META[key].weight;
    fundamentals += (byKey.get(key) ?? 0) * weight;
    fundamentalWeight += weight;
  }
  const fundamentalBase = fundamentals / fundamentalWeight; // 0–100

  const risk = byKey.get("risk") ?? 60; // higher = safer
  // Risk discount: ranges from ~0.82 (very risky) to 1.0 (very safe).
  const riskMultiplier = 0.82 + 0.18 * (risk / 100);

  const final = fundamentalBase * riskMultiplier;
  return Math.round(Math.max(0, Math.min(100, final)));
}

export function verdictFromScore(score: number): Verdict {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "neutral";
  if (score >= 40) return "high-risk";
  return "avoid";
}

export const VERDICT_META: Record<
  Verdict,
  { label: string; tone: string; ring: string; text: string; bg: string }
> = {
  excellent: {
    label: "Excellent investissement",
    tone: "bull",
    ring: "#2fd180",
    text: "text-bull",
    bg: "bg-bull/10 border-bull/30",
  },
  good: {
    label: "Bon investissement",
    tone: "accent",
    ring: "#5b8cff",
    text: "text-accent-soft",
    bg: "bg-accent/10 border-accent/30",
  },
  neutral: {
    label: "Neutre",
    tone: "gold",
    ring: "#e9c46a",
    text: "text-gold",
    bg: "bg-gold/10 border-gold/30",
  },
  "high-risk": {
    label: "Risque élevé",
    tone: "warn",
    ring: "#f0883e",
    text: "text-[#f0a35e]",
    bg: "bg-[#f0883e]/10 border-[#f0883e]/30",
  },
  avoid: {
    label: "À éviter",
    tone: "bear",
    ring: "#ff5d6c",
    text: "text-bear",
    bg: "bg-bear/10 border-bear/30",
  },
};

/** Color ramp for an individual pillar score. */
export function scoreColor(score: number): string {
  if (score >= 80) return "#2fd180";
  if (score >= 65) return "#5b8cff";
  if (score >= 50) return "#e9c46a";
  if (score >= 35) return "#f0883e";
  return "#ff5d6c";
}
