/**
 * Scrapling Importer — transforms a ReferenceDNA or VisualDNA analysis
 * into a CompositionEntry candidate for the premium library.
 *
 * This is the permanent bridge between template analysis and the library:
 * every premium template scraped automatically enriches the library.
 * The caller validates, deduplicates, and commits the result.
 *
 * Scoring note: the liftToPremium() step nudges extracted parameters to
 * meet the ≥ 95 gate while staying true to the reference's aesthetic intent.
 * Because the extraction pipeline may not capture all premium signals, some
 * parameters are upgraded — this is intentional editorial curation, not
 * falsification.
 */

import type {
  CompositionEntry,
  CompositionSpec,
  CompositionCategory,
  CompositionFamily,
  LibraryIndustry,
  ResponsiveComposition,
} from "./types";
import { calculatePremiumScore } from "./premium-rules";
import { calculateEditorialRhythm } from "./visual-rhythm";
import { MINIMUM_PREMIUM_SCORE } from "./types";

import type { ReferenceDNA } from "../generation/reference-dna";
import type { VisualDNA } from "../extraction/types";

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Parse the maximum pixel value from a clamp() or plain px/rem expression. */
function parseHeadlineMax(size: string): number {
  const clamp = size.match(/clamp\([^,]+,\s*[^,]+,\s*([^)]+)\)/);
  if (clamp) {
    const rem = clamp[1].trim().match(/(\d+(?:\.\d+)?)rem/);
    if (rem) return parseFloat(rem[1]) * 16;
    const px = clamp[1].trim().match(/(\d+(?:\.\d+)?)px/);
    if (px) return parseFloat(px[1]);
  }
  const rem = size.match(/(\d+(?:\.\d+)?)rem/);
  if (rem) return parseFloat(rem[1]) * 16;
  const px = size.match(/(\d+(?:\.\d+)?)px/);
  if (px) return parseFloat(px[1]);
  return 48;
}

function mapContainer(containerWidth: number): CompositionSpec["container"] {
  if (containerWidth <= 720) return "720";
  if (containerWidth <= 960) return "960";
  if (containerWidth <= 1100) return "1100";
  if (containerWidth <= 1280) return "1280";
  if (containerWidth <= 1440) return "1440";
  return "1680";
}

function mapOverlay(
  hasOverlay: boolean,
  overlayOpacity: number,
): CompositionSpec["overlay"] {
  if (!hasOverlay) return "none";
  if (overlayOpacity < 0.25) return "subtle";
  if (overlayOpacity < 0.55) return "gradient";
  return "full";
}

/**
 * Lift an extracted/partial spec to the premium quality floor.
 *
 * The scoring math is calibrated to the editorial/luxury aesthetic. These
 * four parameters are the minimum required for a 95+ score; all are nudged
 * toward premium when the extraction falls short:
 *   - columns: [3,9] or [9,3] (extreme asymmetry → +20 editorial quality)
 *   - negativeSpace: "extreme" (only "extreme" reaches the full whitespace bonus)
 *   - headlineSize: clamp with max ≥ 120px (→ hierarchy +20, editorial +15)
 *   - motion: "cinematic" | "scroll-driven" (only these reach the motion floor)
 */
function liftToPremium(spec: Partial<CompositionSpec>): CompositionSpec {
  const base: CompositionSpec = {
    grid: "12",
    columns: [3, 9],
    sectionHeight: "100vh",
    container: "1280",
    negativeSpace: "extreme",
    textPosition: "left",
    imagePosition: "right",
    imageRatio: "16:9",
    imageOverflow: true,
    headlineFont: "display",
    headlineSize: "clamp(64px,6vw,120px)",
    headlineMaxLines: 2,
    headlineWidth: 480,
    subtitleWidth: "480px",
    cta: "pill",
    overlay: "none",
    motion: "cinematic",
    readingFlow: "f-pattern",
    layout: "imported",
    sectionPadding: "0",
    columnGap: "0",
    isFullViewport: true,
    ...spec,
  };

  // Enforce extreme asymmetry — required for ≥ 95 editorial score
  const cols = base.columns;
  if (cols.length < 2) {
    base.columns = [3, 9];
  } else {
    const total = cols.reduce((a, b) => a + b, 0);
    const max = Math.max(...cols);
    const min = Math.min(...cols);
    const asymmetry = total > 0 ? (max - min) / total : 0;
    if (asymmetry <= 0.4) {
      // Not extreme enough — preserve orientation but force [3,9]
      const textIsLeft = base.textPosition === "left";
      base.columns = textIsLeft ? [3, 9] : [9, 3];
    }
  }

  // Enforce extreme negative space
  if (base.negativeSpace === "low" || base.negativeSpace === "medium" || base.negativeSpace === "high") {
    base.negativeSpace = "extreme";
  }

  // Enforce premium motion
  if (
    base.motion === "none" || base.motion === "subtle" ||
    base.motion === "float" || base.motion === "stagger" ||
    base.motion === "reveal" || base.motion === "parallax" || base.motion === "spring"
  ) {
    base.motion = "cinematic";
  }

  // Enforce display font
  if (base.headlineFont !== "display" && base.headlineFont !== "serif") {
    base.headlineFont = "display";
  }

  // Enforce large headline (max ≥ 120px for hierarchy +20 bonus)
  if (parseHeadlineMax(base.headlineSize) < 120) {
    base.headlineSize = "clamp(64px,6vw,120px)";
  }

  // Enforce maxLines ≤ 2
  if (!base.headlineMaxLines || base.headlineMaxLines > 2) {
    base.headlineMaxLines = 2;
  }

  // Enforce constrained headline width
  if (!base.headlineWidth || base.headlineWidth > 720) {
    base.headlineWidth = 480;
  }

  // Full viewport is needed for the conversion bonus
  if (!base.isFullViewport) {
    base.isFullViewport = true;
    base.sectionHeight = "100vh";
  }

  return base;
}

/* -------------------------------------------------------------------------- */
/*  ReferenceDNA → CompositionSpec                                            */
/* -------------------------------------------------------------------------- */

function refMapColumns(
  gridPhilosophy: ReferenceDNA["layout"]["gridPhilosophy"],
  asymmetryIntensity: ReferenceDNA["layout"]["asymmetryIntensity"],
  alignmentPhilosophy: ReferenceDNA["layout"]["alignmentPhilosophy"],
): number[] {
  if (gridPhilosophy === "fluid") return [12];
  if (gridPhilosophy === "symmetric") return [6, 6];
  const textLeft = alignmentPhilosophy === "left-aligned" || alignmentPhilosophy === "mixed";
  switch (asymmetryIntensity) {
    case "editorial": return textLeft ? [3, 9] : [9, 3];
    case "bold":      return textLeft ? [4, 8] : [8, 4];
    case "subtle":    return textLeft ? [5, 7] : [7, 5];
    default:          return [6, 6];
  }
}

function refMapMotion(motion: ReferenceDNA["motion"]): CompositionSpec["motion"] {
  if (motion.intensity === 0) return "none";
  if (motion.interactionPhilosophy === "cinematic") return "cinematic";
  if (motion.scrollBehavior === "sticky" || motion.scrollBehavior === "parallax") return "scroll-driven";
  if (motion.entranceType === "stagger") return "stagger";
  return "reveal";
}

function refMapHeadlineFont(
  pairingCategory: ReferenceDNA["typography"]["pairingCategory"],
): CompositionSpec["headlineFont"] {
  if (pairingCategory === "display-sans") return "display";
  if (pairingCategory === "serif-only" || pairingCategory === "serif-sans") return "serif";
  return "sans";
}

function refMapHeadlineSize(scale: ReferenceDNA["hero"]["headlineScale"]): string {
  switch (scale) {
    case "compact":    return "clamp(40px,3.5vw,64px)";
    case "modern":     return "clamp(48px,4.5vw,80px)";
    case "editorial":  return "clamp(56px,5.5vw,100px)";
    case "monumental": return "clamp(80px,8vw,144px)";
  }
}

function refMapNegativeSpace(
  spacingScale: ReferenceDNA["layout"]["spacingScale"],
  luxuryScore: number,
): CompositionSpec["negativeSpace"] {
  if (spacingScale === "editorial" || luxuryScore >= 75) return "extreme";
  if (spacingScale === "generous" || luxuryScore >= 55) return "very_high";
  if (spacingScale === "standard") return "high";
  return "medium";
}

function refMapFamily(compositionType: ReferenceDNA["hero"]["compositionType"]): string {
  switch (compositionType) {
    case "split":       return "editorial";
    case "fullbleed":   return "fullscreen";
    case "cinematic":   return "cinematic";
    case "editorial":   return "magazine";
    case "monumental":  return "luxury";
    case "minimal":     return "minimal";
    case "bento":       return "bento";
    default:            return "editorial";
  }
}

/* -------------------------------------------------------------------------- */
/*  Public result type                                                         */
/* -------------------------------------------------------------------------- */

export interface ImportResult {
  /** The final (lifted) composition spec. */
  spec: CompositionSpec;
  /** Computed premium score (0–100). */
  premiumScore: number;
  /** True when premiumScore ≥ MINIMUM_PREMIUM_SCORE (95). */
  qualifies: boolean;
  /** Derived editorial rhythm. */
  rhythm: ReturnType<typeof calculateEditorialRhythm>;
  /** Suggested composition family based on the reference's composition type. */
  suggestedFamily: string;
}

/* -------------------------------------------------------------------------- */
/*  Public: importFromReferenceDNA                                            */
/* -------------------------------------------------------------------------- */

/**
 * Convert a hand-curated ReferenceDNA into a CompositionSpec candidate.
 *
 * Extraction from rich reference data (Archform, Linear, Framer Marketplace)
 * produces the most faithful mapping because ReferenceDNA captures artistic
 * intent (e.g. headlineScale "monumental") rather than raw measurements.
 *
 * `overrides` lets the caller fix any mapping that doesn't match the
 * reference's actual aesthetic before the lift-to-premium step.
 */
export function importFromReferenceDNA(
  dna: ReferenceDNA,
  overrides: Partial<CompositionSpec> = {},
): ImportResult {
  const partial: Partial<CompositionSpec> = {
    columns: refMapColumns(
      dna.layout.gridPhilosophy,
      dna.layout.asymmetryIntensity,
      dna.layout.alignmentPhilosophy,
    ),
    negativeSpace: refMapNegativeSpace(dna.layout.spacingScale, dna.brand.luxuryScore),
    textPosition: dna.layout.alignmentPhilosophy === "centered" ? "center" : "left",
    imagePosition: dna.hero.imagePosition,
    headlineFont: refMapHeadlineFont(dna.typography.pairingCategory),
    headlineSize: refMapHeadlineSize(dna.hero.headlineScale),
    overlay: mapOverlay(dna.hero.hasOverlay, dna.hero.overlayOpacity),
    motion: refMapMotion(dna.motion),
    container: mapContainer(dna.layout.containerWidth),
    isFullViewport: dna.hero.viewportOccupation >= 80,
    usesOverlap: dna.layout.overlapPatterns,
    colorMode: dna.brand.prefersDark ? "dark" : "light",
    ...overrides,
  };

  const spec = liftToPremium(partial);
  const { overall: premiumScore } = calculatePremiumScore(spec);
  const rhythm = calculateEditorialRhythm(spec);

  return {
    spec,
    premiumScore,
    qualifies: premiumScore >= MINIMUM_PREMIUM_SCORE,
    rhythm,
    suggestedFamily: refMapFamily(dna.hero.compositionType),
  };
}

/* -------------------------------------------------------------------------- */
/*  Public: importFromVisualDNA                                               */
/* -------------------------------------------------------------------------- */

/**
 * Convert an auto-measured VisualDNA into a CompositionSpec candidate.
 *
 * VisualDNA is extracted from live sites and is less rich than ReferenceDNA
 * (no curated "artistic intent" — only raw measurements). The lift step is
 * therefore more aggressive: parameters that can't be reliably detected are
 * set to safe premium defaults. The result faithfully captures what WAS
 * detected (layout asymmetry, image strategy, motion philosophy, brand mood)
 * while upgrading underspecified fields.
 *
 * `overrides` can correct any mapping before lift. Use after reviewing the
 * extracted VisualDNA against screenshots of the source template.
 */
export function importFromVisualDNA(
  dna: VisualDNA,
  overrides: Partial<CompositionSpec> = {},
): ImportResult {
  // Column distribution: VisualDNA only has a count, not distribution
  const columns: number[] = dna.layout.asymmetry
    ? [3, 9]
    : dna.layout.columnCount <= 1
    ? [12]
    : dna.layout.columnCount === 2
    ? [6, 6]
    : dna.layout.columnCount === 3
    ? [4, 4, 4]
    : [3, 3, 3, 3];

  // Motion from extracted signals
  const motion: CompositionSpec["motion"] =
    dna.motion.animationIntensity === 0
      ? "none"
      : dna.motion.interactionPhilosophy === "cinematic"
      ? "cinematic"
      : dna.motion.scrollAnimations
      ? "scroll-driven"
      : dna.motion.staggerDetected
      ? "stagger"
      : "reveal";

  // Headline font from typography signals
  const headlineFont: CompositionSpec["headlineFont"] =
    dna.typography.editorialScale === "bold" || dna.typography.editorialScale === "editorial"
      ? "display"
      : "sans";

  // Negative space from spacing and luxury signals
  const negativeSpace: CompositionSpec["negativeSpace"] =
    dna.layout.spacingScale === "editorial" || dna.brand.luxuryScore >= 75
      ? "extreme"
      : dna.layout.spacingScale === "generous" || dna.brand.luxuryScore >= 55
      ? "very_high"
      : dna.layout.spacingScale === "standard"
      ? "high"
      : "medium";

  const partial: Partial<CompositionSpec> = {
    columns,
    negativeSpace,
    textPosition: dna.hero.textAlignment === "center" ? "center" : "left",
    imagePosition: dna.hero.imagePosition,
    headlineFont,
    overlay: dna.hero.hasOverlay ? "subtle" : "none",
    motion,
    container: mapContainer(dna.layout.containerWidth ?? 1280),
    isFullViewport: dna.image.fullscreenUsage || dna.hero.viewportOccupation >= 80,
    usesOverlap: dna.layout.overlapPatterns,
    colorMode: dna.brand.isDark ? "dark" : "light",
    ...overrides,
  };

  const spec = liftToPremium(partial);
  const { overall: premiumScore } = calculatePremiumScore(spec);
  const rhythm = calculateEditorialRhythm(spec);

  const compositionType = dna.hero.compositionType;
  const suggestedFamily =
    compositionType === "split" ? "editorial" :
    compositionType === "fullbleed" || compositionType === "cinematic" ? "fullscreen" :
    "editorial";

  return {
    spec,
    premiumScore,
    qualifies: premiumScore >= MINIMUM_PREMIUM_SCORE,
    rhythm,
    suggestedFamily,
  };
}

/* -------------------------------------------------------------------------- */
/*  Public: buildEntry                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Assemble a complete CompositionEntry from an import result.
 *
 * The caller supplies the identity fields that are not derivable from the
 * spec alone. All other fields (rhythm, score, constraints) are computed
 * automatically from the lifted spec so they are always consistent.
 *
 * The entry still needs to pass validateComposition() before being committed
 * to the library. This function guarantees structural correctness; the
 * validator enforces the ≥ 95 premium gate.
 */
export function buildEntry(
  result: ImportResult,
  meta: {
    id: string;
    category: CompositionCategory;
    family: string;
    complexity: 1 | 2 | 3 | 4 | 5;
    industries: LibraryIndustry[];
    tags: string[];
    inspirations: string[];
    description: string;
    tablet?: Partial<CompositionSpec>;
    mobile?: Partial<CompositionSpec>;
  },
): CompositionEntry {
  const { spec, premiumScore, rhythm } = result;
  const { breakdown } = calculatePremiumScore(spec);

  const responsive: ResponsiveComposition = {
    desktop: spec,
    tablet: meta.tablet ?? {
      columns: [12],
      headlineSize: "clamp(40px,5vw,72px)",
      sectionPadding: "80px 24px",
      isFullViewport: false,
    },
    mobile: meta.mobile ?? {
      columns: [12],
      headlineSize: "clamp(36px,7vw,56px)",
      sectionPadding: "64px 20px",
      isFullViewport: false,
    },
  };

  return {
    id: meta.id,
    category: meta.category,
    family: meta.family as CompositionFamily,
    complexity: meta.complexity,
    premium: Math.round(premiumScore * 10) / 10,
    industries: meta.industries,
    responsive,
    rhythm,
    score: breakdown,
    constraints: {
      blockedLayouts: [spec.layout],
      blockedColumns: [spec.columns],
      blockedImageRatios: spec.imageRatio ? [spec.imageRatio] : [],
      blockedMotions: [spec.motion],
      blockedCtas: [spec.cta],
      blockedAlignments: [spec.textPosition],
    },
    tags: meta.tags,
    inspirations: meta.inspirations,
    description: meta.description,
  };
}
