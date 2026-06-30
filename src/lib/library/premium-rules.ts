/**
 * Premium Rules Engine — scores compositions on 13 quality dimensions.
 *
 * Every composition must score ≥ MINIMUM_PREMIUM_SCORE (95) to be accepted
 * into the library. The weights are calibrated so that editorial/luxury/framer
 * similarity together represent 60% of the score — matching the ReFrame doctrine
 * that "hero quality = >50% of perceived quality."
 */

import type {
  CompositionEntry,
  CompositionSpec,
  PremiumScore,
  PremiumScoreBreakdown,
} from "./types";
import { MINIMUM_PREMIUM_SCORE } from "./types";
import { calculateEditorialRhythm } from "./visual-rhythm";

/* -------------------------------------------------------------------------- */
/*  Dimension weights (sum to 1.0)                                            */
/* -------------------------------------------------------------------------- */

const WEIGHTS: Record<keyof PremiumScoreBreakdown, number> = {
  editorialQuality: 0.15,
  luxuryFeeling: 0.12,
  framerSimilarity: 0.12,
  balance: 0.08,
  hierarchy: 0.10,
  whitespace: 0.10,
  typography: 0.08,
  motion: 0.07,
  gridQuality: 0.07,
  conversion: 0.05,
  imageRhythm: 0.03,
  storytelling: 0.02,
  originality: 0.01,
};

/* -------------------------------------------------------------------------- */
/*  Individual dimension scorers (all return 0–100)                          */
/* -------------------------------------------------------------------------- */

function scoreEditorialQuality(spec: CompositionSpec): number {
  const r = calculateEditorialRhythm(spec);
  return r.editorialScore;
}

function scoreLuxuryFeeling(spec: CompositionSpec): number {
  const r = calculateEditorialRhythm(spec);
  return r.luxuryScore;
}

/**
 * Framer similarity — how close is this composition to Framer's "premium
 * template" aesthetic: fluid type, generous space, cinematic or scroll-driven
 * motion, asymmetric grids, display headlines.
 */
function scoreFramerSimilarity(spec: CompositionSpec): number {
  let score = 40;

  // Fluid headline (clamp = Framer's signature)
  if (spec.headlineSize.includes("clamp")) score += 20;

  // Generous or extreme negative space
  if (spec.negativeSpace === "very_high" || spec.negativeSpace === "extreme") score += 15;
  else if (spec.negativeSpace === "high") score += 8;

  // Asymmetric or editorial grid
  const cols = spec.columns;
  if (cols.length === 2 && Math.abs(cols[0] - cols[1]) >= 2) score += 10;

  // Cinematic / scroll motion
  if (spec.motion === "cinematic" || spec.motion === "scroll-driven") score += 10;
  else if (spec.motion === "reveal" || spec.motion === "stagger") score += 5;

  // Display / serif headline
  if (spec.headlineFont === "display") score += 8;
  else if (spec.headlineFont === "serif") score += 4;

  // Overlap = architectural confidence
  if (spec.usesOverlap) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreBalance(spec: CompositionSpec): number {
  const r = calculateEditorialRhythm(spec);
  const balanceScores: Record<string, number> = {
    dynamic: 90,
    asymmetric: 82,
    symmetric: 75,
    tension: 70,
  };
  return balanceScores[r.balance] ?? 70;
}

function scoreHierarchy(spec: CompositionSpec): number {
  const r = calculateEditorialRhythm(spec);
  return r.hierarchyScore;
}

function scoreWhitespace(spec: CompositionSpec): number {
  const spaceScores: Record<string, number> = {
    extreme: 100,
    very_high: 92,
    high: 80,
    medium: 62,
    low: 35,
  };
  return spaceScores[spec.negativeSpace] ?? 60;
}

function scoreTypography(spec: CompositionSpec): number {
  let score = 50;

  if (spec.headlineFont === "display") score += 20;
  else if (spec.headlineFont === "serif") score += 15;
  else if (spec.headlineFont === "variable") score += 10;

  if (spec.headlineSize.includes("clamp")) score += 20;

  if (spec.headlineMaxLines && spec.headlineMaxLines <= 2) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreMotion(spec: CompositionSpec): number {
  const motionScores: Record<string, number> = {
    cinematic: 100,
    "scroll-driven": 95,
    spring: 90,
    stagger: 85,
    reveal: 80,
    parallax: 75,
    float: 70,
    subtle: 60,
    none: 45,
  };
  return motionScores[spec.motion] ?? 60;
}

function scoreGridQuality(spec: CompositionSpec): number {
  let score = 50;

  // Named grid system
  if (spec.grid === "12" || spec.grid === "10") score += 10;

  // Column distribution
  if (spec.columns.length >= 2) score += 15;
  if (spec.columns.length === 0) score += 5; // full-width can be intentional

  // Column gap intentionality
  if (spec.columnGap) score += 10;

  // Container width
  if (spec.container === "1280" || spec.container === "1440") score += 10;
  if (spec.container === "full") score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreConversion(spec: CompositionSpec): number {
  let score = 50;

  // CTA clarity
  if (spec.cta === "pill" || spec.cta === "gradient") score += 20;
  else if (spec.cta === "ghost") score += 12;
  else if (spec.cta === "underline" || spec.cta === "inline") score += 5;

  // Viewport-sized sections drive action
  if (spec.isFullViewport) score += 15;

  // Strong headline = strong CTA context
  const r = calculateEditorialRhythm(spec);
  if (r.hierarchyScore > 70) score += 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreImageRhythm(spec: CompositionSpec): number {
  if (spec.imagePosition === "none") return 70; // no image is fine
  let score = 50;

  if (spec.imageRatio) score += 15;
  if (spec.imageOverflow) score += 15;
  if (spec.overlay !== "none") score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreStorytelling(spec: CompositionSpec): number {
  // Storytelling = does the composition guide the eye through a narrative?
  const r = calculateEditorialRhythm(spec);
  const flowScores: Record<string, number> = {
    "z-pattern": 95,
    diagonal: 88,
    "f-pattern": 80,
    circular: 78,
    spiral: 75,
    linear: 65,
    vertical: 60,
  };
  const base = flowScores[r.readingFlow] ?? 65;
  return Math.max(0, Math.min(100, Math.round(base)));
}

function scoreOriginality(spec: CompositionSpec): number {
  let score = 50;

  // Uncommon layout patterns get an originality boost.
  if (spec.usesOverlap) score += 15;
  if (spec.imageOverflow) score += 10;
  if (spec.imagePosition === "behind") score += 10;
  if (spec.motion === "scroll-driven") score += 10;

  // Full viewport + centered is the least original.
  if (spec.isFullViewport && spec.textPosition === "center" && !spec.usesOverlap) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function calculatePremiumScore(spec: CompositionSpec): PremiumScore {
  const breakdown: PremiumScoreBreakdown = {
    editorialQuality: scoreEditorialQuality(spec),
    luxuryFeeling: scoreLuxuryFeeling(spec),
    framerSimilarity: scoreFramerSimilarity(spec),
    balance: scoreBalance(spec),
    hierarchy: scoreHierarchy(spec),
    whitespace: scoreWhitespace(spec),
    typography: scoreTypography(spec),
    motion: scoreMotion(spec),
    gridQuality: scoreGridQuality(spec),
    conversion: scoreConversion(spec),
    imageRhythm: scoreImageRhythm(spec),
    storytelling: scoreStorytelling(spec),
    originality: scoreOriginality(spec),
  };

  let overall = 0;
  for (const key of Object.keys(breakdown) as (keyof PremiumScoreBreakdown)[]) {
    overall += breakdown[key] * WEIGHTS[key];
  }

  return {
    overall: Math.round(overall * 10) / 10,
    breakdown,
  };
}

/**
 * Returns true if the composition passes the quality gate.
 */
export function validatePremiumQuality(
  spec: CompositionSpec,
  minScore = MINIMUM_PREMIUM_SCORE,
): boolean {
  return calculatePremiumScore(spec).overall >= minScore;
}
