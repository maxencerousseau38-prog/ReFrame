import type { Company, Criterion, FinancialPoint } from "@/lib/types";
import { computeInvestmentScore, verdictFromScore } from "@/lib/scoring";
import type { RawCompany } from "./raw";
import {
  deriveMetrics,
  toMillions,
  growthScore,
  profitabilityScore,
  financialStrengthScore,
  riskScore,
  type DerivedMetrics,
} from "./ratios";
import { pct, eur } from "@/lib/utils";

// Pillars that need market intelligence / judgement get a neutral financial
// prior here and are refined by the AI layer (phase 2).
const NEEDS_AI = "Estimation préliminaire — affinée par l'analyse IA.";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function pillar(
  key: Criterion["key"],
  label: string,
  score: number,
  summary: string,
  strengths: string[],
  weaknesses: string[],
): Criterion {
  return { key, label, score, summary, strengths, weaknesses };
}

/** Build the seven pillars. Financial pillars are real; qualitative ones carry a
 *  defensible neutral prior pending the AI pass. */
function buildCriteria(m: DerivedMetrics, raw: RawCompany): Criterion[] {
  const growth = growthScore(m);
  const profit = profitabilityScore(m);
  const strength = financialStrengthScore(m);
  const risk = riskScore(m);

  return [
    pillar(
      "growth",
      "Croissance",
      growth,
      `Croissance du chiffre d'affaires de ${pct(m.revenueGrowth, true)} (CAGR ${pct(m.cagr, true)}).`,
      [
        ...(m.revenueGrowth > 15 ? [`Revenu en hausse de ${pct(m.revenueGrowth, true)}`] : []),
        ...(m.cagr > 20 ? [`CAGR soutenu de ${pct(m.cagr)}`] : []),
      ],
      m.revenueGrowth < 5 ? ["Croissance faible à surveiller"] : [],
    ),
    pillar(
      "profitability",
      "Rentabilité",
      profit,
      `Marge EBITDA ${pct(m.ebitdaMargin)}, marge nette ${pct(m.netMargin)}.`,
      [
        ...(m.ebitdaMargin > 0 ? [`EBITDA positif (${pct(m.ebitdaMargin)})`] : []),
        ...(m.netMargin > 0 ? [`Résultat net positif`] : []),
      ],
      [
        ...(m.ebitdaMargin <= 0 ? ["EBITDA négatif"] : []),
        ...(m.netMargin <= 0 ? ["Pré-rentabilité au niveau net"] : []),
      ],
    ),
    pillar(
      "financial-strength",
      "Solidité financière",
      strength,
      `Trésorerie ${eur(m.cash)}, dette ${eur(m.debt)}${
        m.netDebtToEbitda != null ? `, levier ${m.netDebtToEbitda}x EBITDA` : ""
      }.`,
      [
        ...(m.netDebt <= 0 ? ["Position de trésorerie nette positive"] : []),
        ...(m.runwayMonths >= 24 ? ["Runway confortable (> 24 mois)"] : []),
      ],
      [
        ...(m.runwayMonths < 18 && m.runwayMonths < 900 ? [`Runway de ${m.runwayMonths} mois`] : []),
        ...(m.netDebtToEbitda != null && m.netDebtToEbitda > 3 ? ["Levier élevé"] : []),
      ],
    ),
    pillar("market-position", "Position marché", 60, NEEDS_AI, [], []),
    pillar("scalability", "Scalabilité", 62, NEEDS_AI, [], []),
    pillar("management", "Management", 60, NEEDS_AI, [], []),
    pillar(
      "risk",
      "Risque",
      risk,
      `Profil de risque dérivé du runway, du levier et de la rentabilité.`,
      m.netDebt <= 0 ? ["Faible risque de liquidité"] : [],
      [
        ...(m.runwayMonths < 15 && m.runwayMonths < 900 ? ["Risque de financement à court terme"] : []),
        ...(m.ebitdaMargin <= 0 ? ["Non rentable à ce stade"] : []),
      ],
    ),
  ];
}

function buildSummary(m: DerivedMetrics, raw: RawCompany) {
  const whyInvest: string[] = [];
  if (m.revenueGrowth > 15) whyInvest.push(`Croissance du revenu de ${pct(m.revenueGrowth, true)}.`);
  if (m.ebitdaMargin > 10) whyInvest.push(`Rentabilité opérationnelle solide (EBITDA ${pct(m.ebitdaMargin)}).`);
  if (m.netDebt <= 0) whyInvest.push("Bilan sain, trésorerie nette positive.");
  if (whyInvest.length === 0) whyInvest.push("Données financières disponibles pour une analyse approfondie.");

  const whyNot: string[] = [];
  if (m.ebitdaMargin <= 0) whyNot.push("Entreprise non rentable au niveau EBITDA.");
  if (m.runwayMonths < 18 && m.runwayMonths < 900) whyNot.push(`Runway limité (${m.runwayMonths} mois).`);
  if (m.revenueGrowth < 5) whyNot.push("Croissance atone.");
  if (whyNot.length === 0) whyNot.push("Position marché et concurrence à confirmer par l'analyse IA.");

  return {
    whatToKnow: `${raw.name} affiche un revenu de ${eur(m.revenue)} (${pct(m.revenueGrowth, true)} sur un an), une marge EBITDA de ${pct(m.ebitdaMargin)} et une valorisation estimée de ${eur(m.valuation)}. Analyse financière calculée à partir des comptes officiels.`,
    whyInvest,
    whyNot,
    keyRisk:
      m.runwayMonths < 15 && m.runwayMonths < 900
        ? "Risque de liquidité : runway court avant prochain financement."
        : m.ebitdaMargin <= 0
          ? "Chemin vers la rentabilité non encore prouvé."
          : "Risques de marché et d'exécution à approfondir.",
    upside: `Potentiel à confirmer selon la trajectoire de croissance (CAGR ${pct(m.cagr, true)}) et l'expansion des marges.`,
  };
}

/** Raw source data → fully-formed Company (with real Investment Score™). */
export function normalizeToCompany(raw: RawCompany, idHint?: string): Company {
  const m = deriveMetrics(raw);
  const criteria = buildCriteria(m, raw);
  const score = computeInvestmentScore(criteria);

  const financials: FinancialPoint[] = raw.financials.map((y) => ({
    year: y.year,
    revenue: toMillions(y.revenue),
    ebitda: toMillions(y.ebitda),
    netIncome: toMillions(y.netIncome),
    valuation: toMillions(y.valuation),
  }));

  return {
    id: idHint ?? raw.siren?.replace(/\s/g, "") ?? raw.ticker ?? slugify(raw.name),
    name: raw.name,
    logo: initials(raw.name),
    sector: raw.sector ?? "Secteur non précisé",
    location: raw.location ?? "—",
    website: raw.website ?? "",
    siren: raw.siren ?? raw.ticker ?? "—",
    founded: raw.founded ?? new Date().getFullYear(),
    headcount: raw.headcount ?? 0,
    stage: raw.stage,
    tagline: raw.tagline ?? `${raw.name} — analyse Valoryx.`,
    score,
    verdict: verdictFromScore(score),
    trend: 0,
    summary: buildSummary(m, raw),
    criteria,
    financials,
    revenueSegments: [{ name: "Chiffre d'affaires total", value: 100 }],
    competitors: [
      { name: raw.name, score, revenue: m.revenue, growth: m.revenueGrowth, valuation: m.valuation, isSelf: true },
    ],
    funding: (raw.funding ?? []).map((f) => ({
      date: f.date,
      stage: f.stage,
      amount: toMillions(f.amount),
      leadInvestor: f.leadInvestor,
      valuation: f.valuation != null ? toMillions(f.valuation) : undefined,
    })),
    management: (raw.management ?? []).map((p) => ({
      name: p.name,
      role: p.role,
      note: p.note ?? "",
    })),
    metrics: {
      revenue: m.revenue,
      revenueGrowth: m.revenueGrowth,
      ebitdaMargin: m.ebitdaMargin,
      netMargin: m.netMargin,
      cash: m.cash,
      debt: m.debt,
      runwayMonths: m.runwayMonths,
      valuation: m.valuation,
    },
  };
}
