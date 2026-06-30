/**
 * Visual Rhythm Engine — derives EditorialRhythm from a CompositionSpec.
 *
 * All computation is deterministic from the composition data.
 * No I/O, no randomness.
 */

import type {
  CompositionSpec,
  CompositionEntry,
  EditorialRhythm,
  RhythmAnalysis,
  ReadingFlow,
  VisualWeight,
  BalanceType,
  BreathingRoom,
  ContentDensity,
  NegativeSpace,
  ColumnDistribution,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const NEGATIVE_SPACE_RATIOS: Record<NegativeSpace, number> = {
  low: 0.15,
  medium: 0.3,
  high: 0.45,
  very_high: 0.60,
  extreme: 0.75,
};

/**
 * Compute how imbalanced the column distribution is.
 * Returns 0 (perfectly balanced) to 1 (extreme asymmetry).
 */
function columnAsymmetry(columns: ColumnDistribution): number {
  if (columns.length < 2) return 0;
  const total = columns.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const max = Math.max(...columns);
  const min = Math.min(...columns);
  return (max - min) / total;
}

function parseHeadlineSize(size: string): number {
  const rem = size.match(/(\d+(?:\.\d+)?)rem/);
  if (rem) return parseFloat(rem[1]) * 16;
  // clamp() must be checked before px — clamp() values contain px inside them
  const clamp = size.match(/clamp\([^,]+,\s*[^,]+,\s*([^)]+)\)/);
  if (clamp) return parseHeadlineSize(clamp[1].trim());
  const px = size.match(/(\d+(?:\.\d+)?)px/);
  if (px) return parseFloat(px[1]);
  return 48; // fallback
}

/* -------------------------------------------------------------------------- */
/*  Reading flow inference                                                    */
/* -------------------------------------------------------------------------- */

function inferReadingFlow(spec: CompositionSpec): ReadingFlow {
  if (spec.readingFlow) return spec.readingFlow;

  const { textPosition, imagePosition, columns } = spec;

  if (textPosition === "overlay") return "z-pattern";
  if (columns.length >= 2 && columnAsymmetry(columns) > 0.3) return "diagonal";
  if (textPosition === "left" || textPosition === "split") return "f-pattern";
  if (textPosition === "center") return "linear";
  return "linear";
}

/* -------------------------------------------------------------------------- */
/*  Visual weight                                                              */
/* -------------------------------------------------------------------------- */

function inferVisualWeight(spec: CompositionSpec): VisualWeight {
  const hSize = parseHeadlineSize(spec.headlineSize);
  const { negativeSpace, imagePosition, overlay, motion } = spec;

  let score = 0;
  // Large headline
  if (hSize > 80) score += 2;
  else if (hSize > 56) score += 1;

  // Image presence
  if (imagePosition !== "none") score += 1;
  if (imagePosition === "behind") score += 1;

  // Overlay adds visual mass
  if (overlay !== "none") score += 1;

  // Motion adds perceived weight
  if (motion === "cinematic" || motion === "scroll-driven") score += 1;

  // Negative space reduces weight
  if (negativeSpace === "extreme" || negativeSpace === "very_high") score -= 2;
  else if (negativeSpace === "high") score -= 1;

  if (score <= 1) return "light";
  if (score <= 3) return "medium";
  return "heavy";
}

/* -------------------------------------------------------------------------- */
/*  Balance                                                                   */
/* -------------------------------------------------------------------------- */

function inferBalance(spec: CompositionSpec): BalanceType {
  const asymmetry = columnAsymmetry(spec.columns);

  if (spec.usesOverlap) return "tension";
  if (asymmetry > 0.4) return "dynamic";
  if (asymmetry > 0.15) return "asymmetric";
  return "symmetric";
}

/* -------------------------------------------------------------------------- */
/*  Breathing room                                                             */
/* -------------------------------------------------------------------------- */

function inferBreathingRoom(spec: CompositionSpec): BreathingRoom {
  const ns = spec.negativeSpace;
  if (ns === "extreme") return "extreme";
  if (ns === "very_high") return "editorial";
  if (ns === "high") return "generous";
  if (ns === "medium") return "comfortable";
  return "tight";
}

/* -------------------------------------------------------------------------- */
/*  Content density                                                            */
/* -------------------------------------------------------------------------- */

function inferDensity(spec: CompositionSpec): ContentDensity {
  const ns = spec.negativeSpace;
  if (ns === "low") return "dense";
  if (ns === "medium") return "moderate";
  return "sparse";
}

/* -------------------------------------------------------------------------- */
/*  Luxury score                                                               */
/* -------------------------------------------------------------------------- */

function computeLuxuryScore(spec: CompositionSpec): number {
  let score = 50;

  // Negative space is the #1 luxury indicator.
  if (spec.negativeSpace === "extreme") score += 25;
  else if (spec.negativeSpace === "very_high") score += 18;
  else if (spec.negativeSpace === "high") score += 10;
  else if (spec.negativeSpace === "low") score -= 20;

  // Large headline = editorial luxury.
  const hSize = parseHeadlineSize(spec.headlineSize);
  if (hSize >= 80) score += 10;
  else if (hSize >= 56) score += 5;

  // Asymmetric layouts feel more intentional.
  const asymmetry = columnAsymmetry(spec.columns);
  if (asymmetry > 0.35) score += 8;

  // Cinematic / scroll-driven motion = premium.
  if (spec.motion === "cinematic") score += 8;
  else if (spec.motion === "scroll-driven") score += 6;
  else if (spec.motion === "none") score -= 5;

  // Overlapping elements = architectural confidence.
  if (spec.usesOverlap) score += 5;

  // Heavy overlays kill luxury.
  if (spec.overlay === "full") score -= 10;
  else if (spec.overlay === "gradient") score -= 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/* -------------------------------------------------------------------------- */
/*  Editorial score                                                            */
/* -------------------------------------------------------------------------- */

function computeEditorialScore(spec: CompositionSpec): number {
  let score = 40;

  // Asymmetric grid = editorial intent.
  const asymmetry = columnAsymmetry(spec.columns);
  if (asymmetry > 0.4) score += 20;
  else if (asymmetry > 0.2) score += 12;
  else if (asymmetry === 0 && spec.columns.length > 0) score += 3; // symmetric can be editorial too

  // Large display headline.
  const hSize = parseHeadlineSize(spec.headlineSize);
  if (hSize >= 96) score += 15;
  else if (hSize >= 72) score += 10;
  else if (hSize >= 56) score += 5;

  // Display / serif font = more editorial.
  if (spec.headlineFont === "display") score += 8;
  else if (spec.headlineFont === "serif") score += 6;

  // Generous negative space.
  if (spec.negativeSpace === "extreme" || spec.negativeSpace === "very_high") score += 10;
  else if (spec.negativeSpace === "low") score -= 10;

  // Overlap = architectural editorial.
  if (spec.usesOverlap) score += 6;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/* -------------------------------------------------------------------------- */
/*  Hierarchy score                                                            */
/* -------------------------------------------------------------------------- */

function computeHierarchyScore(spec: CompositionSpec): number {
  let score = 50;

  // A large headline creates strong hierarchy.
  const hSize = parseHeadlineSize(spec.headlineSize);
  if (hSize >= 96) score += 20;
  else if (hSize >= 64) score += 12;
  else if (hSize < 32) score -= 15;

  // Text limited to max lines keeps it tight.
  if (spec.headlineMaxLines && spec.headlineMaxLines <= 2) score += 8;

  // Constrained headline width = deliberate hierarchy.
  if (spec.headlineWidth && spec.headlineWidth <= 720) score += 8;

  // Overlay can disrupt hierarchy.
  if (spec.overlay === "full") score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/* -------------------------------------------------------------------------- */
/*  Public: calculateEditorialRhythm                                          */
/* -------------------------------------------------------------------------- */

export function calculateEditorialRhythm(spec: CompositionSpec): EditorialRhythm {
  return {
    negativeSpaceRatio: NEGATIVE_SPACE_RATIOS[spec.negativeSpace] ?? 0.3,
    readingFlow: inferReadingFlow(spec),
    visualWeight: inferVisualWeight(spec),
    balance: inferBalance(spec),
    breathingRoom: inferBreathingRoom(spec),
    density: inferDensity(spec),
    luxuryScore: computeLuxuryScore(spec),
    editorialScore: computeEditorialScore(spec),
    hierarchyScore: computeHierarchyScore(spec),
  };
}

/* -------------------------------------------------------------------------- */
/*  Public: analyzeRhythm (with flags/suggestions)                            */
/* -------------------------------------------------------------------------- */

export function analyzeRhythm(entry: CompositionEntry): RhythmAnalysis {
  const spec = entry.responsive.desktop;
  const rhythm = calculateEditorialRhythm(spec);
  const flags: string[] = [];
  const suggestions: string[] = [];

  if (rhythm.luxuryScore < 40) {
    flags.push("Low luxury score — consider more negative space or larger headline.");
  }
  if (rhythm.editorialScore < 45) {
    flags.push("Low editorial score — try asymmetric columns or a display headline.");
  }
  if (rhythm.hierarchyScore < 45) {
    flags.push("Weak typographic hierarchy — increase headline size or constrain width.");
  }
  if (spec.negativeSpace === "low" && entry.category === "hero") {
    flags.push("Hero with 'low' negative space will feel cluttered.");
  }
  if (spec.motion === "none" && entry.complexity >= 4) {
    flags.push("High-complexity composition with no motion may feel static.");
    suggestions.push("Add 'subtle' or 'reveal' motion to complement the layout.");
  }
  if (spec.overlay === "full" && rhythm.luxuryScore > 70) {
    suggestions.push(
      "Full overlay contradicts high luxury score — consider 'subtle' or 'gradient'.",
    );
  }

  return { rhythm, flags, suggestions };
}
