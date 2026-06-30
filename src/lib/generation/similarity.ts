/**
 * Reference Similarity Engine — compares an extracted VisualDNA against the
 * curated ReferenceDNA library and produces a weighted "inspiration profile":
 * which premium references this site's measured visual language is closest
 * to, and by how much.
 *
 * This augments (does not replace) the existing Moodboard system. Moodboard
 * scores references by categorical fit (industry/tier/mood); this engine
 * scores them by measured visual similarity. Both feed the Art Director.
 *
 * Pure, synchronous, deterministic — no I/O, no randomness.
 */

import type { VisualDNA } from "./types";
import type { EnrichedReference, ReferenceDNA } from "./reference-dna";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type SimilarityDimension =
  | "hero"
  | "typography"
  | "layout"
  | "image"
  | "component"
  | "motion"
  | "brand";

export interface DimensionSimilarity {
  dimension: SimilarityDimension;
  /** 0–1, 1 = identical. */
  score: number;
  matchDetails: string[];
}

export interface SimilarityScore {
  /** 0–1, weighted sum of dimension scores. */
  overall: number;
  dimensions: DimensionSimilarity[];
  referenceId: string;
}

export interface WeightedReference {
  reference: EnrichedReference;
  similarity: SimilarityScore;
  /** Normalized — all weights in an InspirationProfile sum to 1.0. */
  weight: number;
}

export interface InspirationProfile {
  references: WeightedReference[];
  /** 0 if no enriched references / no VisualDNA. */
  strongestMatch: number;
  /** Per-dimension: which reference id scores highest on that axis. */
  dimensionLeaders: Partial<Record<SimilarityDimension, string>>;
}

const EMPTY_PROFILE: InspirationProfile = {
  references: [],
  strongestMatch: 0,
  dimensionLeaders: {},
};

/* -------------------------------------------------------------------------- */
/*  Dimension weights                                                         */
/* -------------------------------------------------------------------------- */

const DIMENSION_WEIGHTS: Record<SimilarityDimension, number> = {
  hero: 0.25,
  typography: 0.15,
  layout: 0.15,
  brand: 0.15,
  motion: 0.1,
  component: 0.1,
  image: 0.1,
};

/* -------------------------------------------------------------------------- */
/*  Scalar comparison helpers                                                 */
/* -------------------------------------------------------------------------- */

/** Exact match = 1, else 0 — unless a closeness map gives partial credit. */
function enumScore(a: string, b: string, closeness?: Record<string, string[]>): number {
  if (a === b) return 1;
  if (closeness) {
    const close = closeness[a];
    if (close?.includes(b)) return 0.5;
    const closeB = closeness[b];
    if (closeB?.includes(a)) return 0.5;
  }
  return 0;
}

function numScore(a: number | null | undefined, b: number, range: number): number {
  if (a === null || a === undefined || range <= 0) return 0.5;
  return 1 - Math.min(Math.abs(a - b) / range, 1);
}

function boolScore(a: boolean, b: boolean): number {
  return a === b ? 1 : 0;
}

function average(scores: number[]): number {
  if (scores.length === 0) return 0.5;
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

/* -------------------------------------------------------------------------- */
/*  Closeness maps (semantic proximity between enum values)                   */
/* -------------------------------------------------------------------------- */

const HERO_COMPOSITION_CLOSE: Record<string, string[]> = {
  monumental: ["fullbleed", "editorial"],
  fullbleed: ["monumental", "cinematic"],
  cinematic: ["fullbleed", "split"],
  editorial: ["monumental", "minimal"],
  minimal: ["editorial", "split"],
  split: ["minimal", "cinematic"],
  bento: ["minimal", "split"],
};

const EDITORIAL_SCALE_CLOSE: Record<string, string[]> = {
  monumental: ["bold", "editorial"],
  bold: ["monumental", "editorial"],
  editorial: ["bold", "modern"],
  modern: ["editorial", "compact"],
  compact: ["modern"],
};

const GALLERY_STYLE_CLOSE: Record<string, string[]> = {
  "carousel-3d": ["feature", "strip"],
  feature: ["carousel-3d", "editorial"],
  editorial: ["feature", "grid"],
  grid: ["editorial", "masonry"],
  masonry: ["grid", "strip"],
  strip: ["masonry", "carousel-3d"],
  none: ["single"],
  single: ["none"],
};

const BACKGROUND_TREATMENT_CLOSE: Record<string, string[]> = {
  "gradient-scrim": ["overlay", "duotone"],
  overlay: ["gradient-scrim", "blur"],
  blur: ["overlay", "duotone"],
  duotone: ["blur", "gradient-scrim"],
  none: [],
};

const INTERACTION_PHILOSOPHY_CLOSE: Record<string, string[]> = {
  purposeful: ["restrained", "cinematic"],
  restrained: ["purposeful"],
  cinematic: ["purposeful", "playful"],
  playful: ["cinematic"],
};

/* -------------------------------------------------------------------------- */
/*  Per-dimension scorers                                                     */
/* -------------------------------------------------------------------------- */

function scoreHero(v: VisualDNA["hero"], r: ReferenceDNA["hero"]): DimensionSimilarity {
  const scores = [
    enumScore(v.compositionType, r.compositionType, HERO_COMPOSITION_CLOSE),
    enumScore(v.imagePosition, r.imagePosition),
    enumScore(v.textAlignment, r.textAlignment),
    enumScore(v.visualWeight, r.visualWeight),
    enumScore(v.layering, r.layering),
    boolScore(v.hasOverlay, r.hasOverlay),
    numScore(v.ctaCount, r.ctaCount, 3),
    enumScore(v.ctaPlacement, r.ctaPlacement),
    numScore(v.viewportOccupation, r.viewportOccupation, 100),
  ];
  return { dimension: "hero", score: average(scores), matchDetails: [] };
}

function scoreTypography(v: VisualDNA["typography"], r: ReferenceDNA["typography"]): DimensionSimilarity {
  const trackingMatch =
    v.trackingTight === (r.trackingTightness === "tight" || r.trackingTightness === "extreme") ? 1 : 0;
  const scores = [
    enumScore(v.editorialScale, r.editorialScale, EDITORIAL_SCALE_CLOSE),
    numScore(v.headingWeight, r.headingWeight, 800),
    enumScore(v.uppercaseUsage, r.uppercaseUsage),
    numScore(v.fontHierarchyDepth, r.hierarchyDepth, 4),
    enumScore(v.textDensity, r.textDensity),
    trackingMatch,
  ];
  return { dimension: "typography", score: average(scores), matchDetails: [] };
}

function scoreLayout(v: VisualDNA["layout"], r: ReferenceDNA["layout"]): DimensionSimilarity {
  const asymmetryMatch = v.asymmetry === (r.asymmetryIntensity !== "none") ? 1 : 0;
  const scores = [
    enumScore(v.spacingScale, r.spacingScale),
    enumScore(v.alignmentPhilosophy, r.alignmentPhilosophy),
    asymmetryMatch,
    boolScore(v.overlapPatterns, r.overlapPatterns),
    numScore(v.containerWidth, r.containerWidth, 800),
    numScore(v.columnCount, r.columnCount, 4),
  ];
  return { dimension: "layout", score: average(scores), matchDetails: [] };
}

function scoreImage(v: VisualDNA["image"], r: ReferenceDNA["image"]): DimensionSimilarity {
  const fullbleedMatch = v.fullscreenUsage === (r.imageStyle === "fullbleed") ? 1 : 0;
  const scores = [
    enumScore(v.dominantAspectRatio, r.dominantAspectRatio),
    enumScore(v.galleryRhythm, r.galleryStyle, GALLERY_STYLE_CLOSE),
    enumScore(v.backgroundTreatment, r.backgroundTreatment, BACKGROUND_TREATMENT_CLOSE),
    fullbleedMatch,
  ];
  return { dimension: "image", score: average(scores), matchDetails: [] };
}

function scoreComponent(v: VisualDNA["component"], r: ReferenceDNA["component"]): DimensionSimilarity {
  const scores = [
    numScore(v.cardRadius, r.cardRadius, 24),
    enumScore(v.ctaStyle, r.ctaStyle),
    enumScore(v.badgeLanguage, r.badgeStyle),
    boolScore(v.dividerUsage, r.dividerUsage),
  ];
  return { dimension: "component", score: average(scores), matchDetails: [] };
}

function scoreMotion(v: VisualDNA["motion"], r: ReferenceDNA["motion"]): DimensionSimilarity {
  const scrollMatch = v.scrollAnimations === (r.scrollBehavior !== "none") ? 1 : 0;
  const parallaxMatch = v.parallaxDetected === (r.scrollBehavior === "parallax") ? 1 : 0;
  const staggerMatch = v.staggerDetected === (r.entranceType === "stagger") ? 1 : 0;
  const entranceMatch = v.entranceAnimations.includes(r.entranceType) ? 1 : 0;
  const durationSec = v.transitionDuration !== null ? v.transitionDuration / 1000 : null;
  const scores = [
    numScore(v.animationIntensity, r.intensity, 3),
    entranceMatch,
    scrollMatch,
    parallaxMatch,
    enumScore(v.interactionPhilosophy, r.interactionPhilosophy, INTERACTION_PHILOSOPHY_CLOSE),
    staggerMatch,
    numScore(durationSec, r.transitionDuration, 1),
  ];
  return { dimension: "motion", score: average(scores), matchDetails: [] };
}

function scoreBrand(v: VisualDNA["brand"], r: ReferenceDNA["brand"]): DimensionSimilarity {
  const scores = [
    numScore(v.luxuryScore, r.luxuryScore, 100),
    numScore(v.modernityScore, r.modernityScore, 100),
    numScore(v.editorialScore, r.editorialScore, 100),
    numScore(v.minimalismScore, r.minimalismScore, 100),
    numScore(v.premiumScore, r.premiumScore, 100),
    enumScore(v.visualDensity, r.visualDensity),
    enumScore(v.emotionalDirection, r.emotionalDirection === "neutral" ? "neutral" : r.emotionalDirection),
    boolScore(v.isDark, r.prefersDark),
  ];
  return { dimension: "brand", score: average(scores), matchDetails: [] };
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/** Computes per-dimension + overall similarity between a measured VisualDNA and a curated ReferenceDNA. */
export function computeSimilarity(visual: VisualDNA, ref: ReferenceDNA, referenceId: string): SimilarityScore {
  const dimensions: DimensionSimilarity[] = [
    scoreHero(visual.hero, ref.hero),
    scoreTypography(visual.typography, ref.typography),
    scoreLayout(visual.layout, ref.layout),
    scoreImage(visual.image, ref.image),
    scoreComponent(visual.component, ref.component),
    scoreMotion(visual.motion, ref.motion),
    scoreBrand(visual.brand, ref.brand),
  ];

  const overall = dimensions.reduce(
    (sum, d) => sum + d.score * DIMENSION_WEIGHTS[d.dimension],
    0
  );

  return { overall, dimensions, referenceId };
}

/**
 * Finds the closest references to a site's measured VisualDNA and produces
 * a normalized, weighted inspiration profile. References without `richDna`
 * are skipped. Returns an empty profile when no VisualDNA or no enriched
 * references are available.
 */
export function findClosestReferences(
  visual: VisualDNA | undefined,
  library: EnrichedReference[],
  topN = 3
): InspirationProfile {
  if (!visual) return EMPTY_PROFILE;

  const enriched = library.filter((r): r is EnrichedReference & { richDna: ReferenceDNA } => !!r.richDna);
  if (enriched.length === 0) return EMPTY_PROFILE;

  const scored = enriched
    .map((reference) => ({
      reference,
      similarity: computeSimilarity(visual, reference.richDna, reference.id),
    }))
    .sort((a, b) => b.similarity.overall - a.similarity.overall)
    .slice(0, topN);

  const totalScore = scored.reduce((sum, s) => sum + s.similarity.overall, 0);
  const references: WeightedReference[] = scored.map((s) => ({
    reference: s.reference,
    similarity: s.similarity,
    weight: totalScore > 0 ? s.similarity.overall / totalScore : 1 / scored.length,
  }));

  const dimensionLeaders: Partial<Record<SimilarityDimension, string>> = {};
  for (const dim of Object.keys(DIMENSION_WEIGHTS) as SimilarityDimension[]) {
    let bestId: string | undefined;
    let bestScore = -1;
    for (const s of scored) {
      const d = s.similarity.dimensions.find((x) => x.dimension === dim);
      if (d && d.score > bestScore) {
        bestScore = d.score;
        bestId = s.reference.id;
      }
    }
    if (bestId) dimensionLeaders[dim] = bestId;
  }

  return {
    references,
    strongestMatch: references[0]?.similarity.overall ?? 0,
    dimensionLeaders,
  };
}
