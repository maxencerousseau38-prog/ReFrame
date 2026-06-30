/**
 * Composition Scorer — maps a SelectionContext onto a SelectionScoring
 * for a given CompositionEntry.
 *
 * Higher total score = better match. The selector uses this to rank candidates.
 */

import type {
  CompositionEntry,
  SelectionContext,
  SelectionScoring,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Scoring weights (sum to 1.0)                                              */
/* -------------------------------------------------------------------------- */

const W: Record<keyof Omit<SelectionScoring, "total">, number> = {
  industryMatch: 0.22,
  luxuryMatch: 0.14,
  editorialMatch: 0.14,
  visualDiversity: 0.15,
  premiumScore: 0.12,
  originality: 0.08,
  referenceMatch: 0.05,
  negativeSpaceMatch: 0.05,
  visualRhythm: 0.03,
  compositionBalance: 0.02,
};

/* -------------------------------------------------------------------------- */
/*  Industry match                                                             */
/* -------------------------------------------------------------------------- */

function scoreIndustryMatch(entry: CompositionEntry, ctx: SelectionContext): number {
  if (entry.industries.includes(ctx.industry)) return 100;
  // Wildcard: compositions tagged "all" match any industry.
  if ((entry.industries as string[]).includes("all")) return 80;
  return 30;
}

/* -------------------------------------------------------------------------- */
/*  Luxury match                                                               */
/* -------------------------------------------------------------------------- */

function scoreLuxuryMatch(entry: CompositionEntry, ctx: SelectionContext): number {
  if (ctx.luxuryTarget === undefined) return 70; // neutral
  const diff = Math.abs(entry.rhythm.luxuryScore - ctx.luxuryTarget);
  // Within 10 → perfect; within 20 → good; beyond 40 → poor.
  return Math.max(0, Math.round(100 - diff * 2));
}

/* -------------------------------------------------------------------------- */
/*  Editorial match                                                            */
/* -------------------------------------------------------------------------- */

function scoreEditorialMatch(entry: CompositionEntry, ctx: SelectionContext): number {
  if (ctx.editorialTarget === undefined) return 70;
  const diff = Math.abs(entry.rhythm.editorialScore - ctx.editorialTarget);
  return Math.max(0, Math.round(100 - diff * 2));
}

/* -------------------------------------------------------------------------- */
/*  Visual diversity (penalty applied to the score)                           */
/* -------------------------------------------------------------------------- */

import { calculateDiversityPenalty } from "./layout-rules";

function scoreVisualDiversity(entry: CompositionEntry, ctx: SelectionContext): number {
  if (!ctx.history || ctx.history.length === 0) return 100;
  const { penalty } = calculateDiversityPenalty(entry, ctx.history);
  return Math.round((1 - penalty) * 100);
}

/* -------------------------------------------------------------------------- */
/*  Premium score pass-through                                                 */
/* -------------------------------------------------------------------------- */

function scorePremium(entry: CompositionEntry): number {
  // Normalized: 95 = 100 / 100 = 100 → scale 95–100 → 50–100
  const clamped = Math.max(95, Math.min(100, entry.premium));
  return Math.round(((clamped - 95) / 5) * 50 + 50);
}

/* -------------------------------------------------------------------------- */
/*  Originality                                                                */
/* -------------------------------------------------------------------------- */

function scoreOriginality(entry: CompositionEntry): number {
  return entry.score.originality;
}

/* -------------------------------------------------------------------------- */
/*  Reference match (family preference from context)                         */
/* -------------------------------------------------------------------------- */

function scoreReferenceMatch(entry: CompositionEntry, ctx: SelectionContext): number {
  if (!ctx.preferFamily) return 70;
  if (entry.family === ctx.preferFamily) return 100;
  return 40;
}

/* -------------------------------------------------------------------------- */
/*  Negative space match                                                       */
/* -------------------------------------------------------------------------- */

const NS_ORDER = ["low", "medium", "high", "very_high", "extreme"];
const NS_IDX: Record<string, number> = {
  low: 0, medium: 1, high: 2, very_high: 3, extreme: 4,
};

function scoreNegativeSpaceMatch(entry: CompositionEntry, ctx: SelectionContext): number {
  if (ctx.luxuryTarget === undefined) return 70;

  // High luxury → prefer generous space; low luxury → OK with medium.
  const luxPct = ctx.luxuryTarget / 100;
  const targetIdx = Math.round(luxPct * (NS_ORDER.length - 1));
  const entryIdx = NS_IDX[entry.responsive.desktop.negativeSpace] ?? 2;
  const diff = Math.abs(targetIdx - entryIdx);
  return Math.max(0, Math.round(100 - diff * 25));
}

/* -------------------------------------------------------------------------- */
/*  Visual rhythm                                                              */
/* -------------------------------------------------------------------------- */

function scoreVisualRhythm(entry: CompositionEntry): number {
  const r = entry.rhythm;
  // Good rhythm = high editorial + balanced weight + generous breathing room.
  const base = (r.editorialScore + r.luxuryScore + r.hierarchyScore) / 3;
  return Math.round(base);
}

/* -------------------------------------------------------------------------- */
/*  Composition balance                                                        */
/* -------------------------------------------------------------------------- */

function scoreCompositionBalance(entry: CompositionEntry): number {
  const balanceBonus: Record<string, number> = {
    dynamic: 95,
    asymmetric: 85,
    symmetric: 75,
    tension: 70,
  };
  return balanceBonus[entry.rhythm.balance] ?? 75;
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function scoreComposition(
  entry: CompositionEntry,
  ctx: SelectionContext,
): SelectionScoring {
  const industryMatch = scoreIndustryMatch(entry, ctx);
  const luxuryMatch = scoreLuxuryMatch(entry, ctx);
  const editorialMatch = scoreEditorialMatch(entry, ctx);
  const visualDiversity = scoreVisualDiversity(entry, ctx);
  const premiumScore = scorePremium(entry);
  const originality = scoreOriginality(entry);
  const referenceMatch = scoreReferenceMatch(entry, ctx);
  const negativeSpaceMatch = scoreNegativeSpaceMatch(entry, ctx);
  const visualRhythm = scoreVisualRhythm(entry);
  const compositionBalance = scoreCompositionBalance(entry);

  const total = Math.round(
    industryMatch * W.industryMatch +
    luxuryMatch * W.luxuryMatch +
    editorialMatch * W.editorialMatch +
    visualDiversity * W.visualDiversity +
    premiumScore * W.premiumScore +
    originality * W.originality +
    referenceMatch * W.referenceMatch +
    negativeSpaceMatch * W.negativeSpaceMatch +
    visualRhythm * W.visualRhythm +
    compositionBalance * W.compositionBalance,
  );

  return {
    industryMatch,
    luxuryMatch,
    editorialMatch,
    visualDiversity,
    premiumScore,
    originality,
    referenceMatch,
    negativeSpaceMatch,
    visualRhythm,
    compositionBalance,
    total,
  };
}
