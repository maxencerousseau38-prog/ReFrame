/**
 * Reference DNA — the rich measurement schema for premium design references.
 *
 * Structurally parallel to `VisualDNA` (src/lib/extraction/types.ts) so a
 * source site's extracted measurements can be compared dimension-by-dimension
 * against a curated reference. Unlike VisualDNA (auto-measured from a live
 * site), ReferenceDNA is hand-curated from careful study of a premium
 * reference — it captures artistic intention, not raw extraction.
 *
 * Every field is a measurable value (enum, number, boolean). Never HTML,
 * never JSX, never a copied layout — only the design decisions a reference
 * makes, abstracted into comparable data.
 */

import type { CuratedReference } from "./reference-db";

/* -------------------------------------------------------------------------- */
/*  Sub-systems                                                               */
/* -------------------------------------------------------------------------- */

export interface ReferenceHeroDNA {
  compositionType: "split" | "fullbleed" | "editorial" | "minimal" | "cinematic" | "monumental" | "bento";
  /** 0–100, percentage of viewport height the hero occupies. */
  viewportOccupation: number;
  imagePosition: "behind" | "right" | "left" | "below" | "none";
  textAlignment: "left" | "center" | "right";
  visualWeight: "image-heavy" | "text-heavy" | "balanced";
  layering: "flat" | "overlapping" | "stacked";
  hasOverlay: boolean;
  /** 0–1 */
  overlayOpacity: number;
  ctaCount: number;
  ctaPlacement: "below-headline" | "inline" | "bottom";
  stickyBehavior: "none" | "pin-scroll" | "parallax-scroll";
  headlineScale: "compact" | "modern" | "editorial" | "monumental";
}

export interface ReferenceTypographyDNA {
  pairingCategory: "sans-only" | "serif-only" | "serif-sans" | "display-sans";
  /** Human-readable pairing, e.g. "Inter Display + Inter". */
  pairingName: string;
  /** 100–900 */
  headingWeight: number;
  /** 100–900 */
  bodyWeight: number;
  trackingTightness: "none" | "subtle" | "tight" | "extreme";
  editorialScale: "compact" | "modern" | "editorial" | "bold" | "monumental";
  uppercaseUsage: "none" | "nav-only" | "headings" | "extensive";
  /** Distinct type levels in the scale, typically 2–6. */
  hierarchyDepth: number;
  textDensity: "sparse" | "moderate" | "dense";
}

export interface ReferenceLayoutDNA {
  gridPhilosophy: "symmetric" | "asymmetric" | "editorial-grid" | "fluid";
  columnCount: number;
  spacingScale: "tight" | "standard" | "generous" | "editorial";
  /** 1.0 = 64px base unit. */
  spacingMultiplier: number;
  sectionRhythm: "steady" | "alternating" | "crescendo" | "editorial-pause";
  alignmentPhilosophy: "centered" | "left-aligned" | "mixed";
  overlapPatterns: boolean;
  asymmetryIntensity: "none" | "subtle" | "bold" | "editorial";
  sectionDividers: boolean;
  /** px */
  containerWidth: number;
}

export interface ReferenceImageDNA {
  galleryStyle: "grid" | "masonry" | "strip" | "editorial" | "feature" | "carousel-3d" | "none";
  dominantAspectRatio: "landscape" | "portrait" | "square" | "mixed";
  croppingPhilosophy: "tight" | "breathing" | "full-subject";
  backgroundTreatment: "none" | "overlay" | "blur" | "duotone" | "gradient-scrim";
  imageStyle: "fullbleed" | "framed" | "rounded" | "masked" | "editorial";
  /** px */
  imageRadius: number;
  imageDensity: "minimal" | "moderate" | "image-heavy";
}

export interface ReferenceComponentDNA {
  cardStyle: "glass" | "flat" | "elevated" | "outlined" | "editorial";
  /** px */
  cardRadius: number;
  cardHoverEffect: "lift" | "glow" | "scale" | "border" | "none";
  ctaStyle: "pill" | "sharp" | "ghost" | "text-arrow" | "gradient";
  ctaSize: "sm" | "md" | "lg";
  dividerUsage: boolean;
  badgeStyle: "rounded" | "pill" | "none";
  processPresentation: "timeline" | "numbered" | "sticky-stack" | "cards" | "none";
}

export interface ReferenceMotionDNA {
  intensity: 0 | 1 | 2 | 3;
  entranceType: "fade" | "slide-up" | "blur-fade" | "reveal" | "stagger";
  scrollBehavior: "none" | "parallax" | "sticky" | "reveal";
  microInteractions: boolean;
  springPhysics: "none" | "light" | "heavy" | "critically-damped";
  /** seconds */
  staggerDelay: number;
  /** seconds */
  transitionDuration: number;
  interactionPhilosophy: "restrained" | "purposeful" | "cinematic" | "playful";
}

export interface ReferenceBrandDNA {
  /** 0–100 */
  luxuryScore: number;
  /** 0–100 */
  modernityScore: number;
  /** 0–100 */
  editorialScore: number;
  /** 0–100 */
  minimalismScore: number;
  /** 0–100 */
  premiumScore: number;
  colorMode: "monochrome" | "accent-rare" | "duotone" | "rich";
  usesGradients: boolean;
  prefersDark: boolean;
  emotionalDirection: "warm" | "cool" | "neutral";
  visualDensity: "sparse" | "moderate" | "dense";
  surfaceColor: string | null;
  inkColor: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Composite type                                                            */
/* -------------------------------------------------------------------------- */

export interface ReferenceDNA {
  hero: ReferenceHeroDNA;
  typography: ReferenceTypographyDNA;
  layout: ReferenceLayoutDNA;
  image: ReferenceImageDNA;
  component: ReferenceComponentDNA;
  motion: ReferenceMotionDNA;
  brand: ReferenceBrandDNA;
}

/**
 * A CuratedReference enriched with the full ReferenceDNA measurement.
 * `richDna` is optional and additive — references without it continue to
 * work through the existing Moodboard system unchanged.
 */
export interface EnrichedReference extends CuratedReference {
  richDna?: ReferenceDNA;
}

/* -------------------------------------------------------------------------- */
/*  Migration helper                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Expands an existing CuratedReference's flat 16-field `.dna` into the
 * richer 7-sub-object ReferenceDNA, filling in sensible inferred defaults
 * for measurements the old schema didn't capture. This is a dev-time
 * scaffolding tool: the output should be reviewed and refined against the
 * actual reference (its `inspiration` text, screenshots, or source) before
 * being committed to the curated library.
 */
export function analyzeReference(ref: CuratedReference): ReferenceDNA {
  const d = ref.dna;

  const headlineScale: ReferenceHeroDNA["headlineScale"] =
    d.rhythm === "editorial" ? "monumental" : d.rhythm === "generous" ? "editorial" : "modern";

  const viewportOccupation =
    d.heroStyle === "monumental" || d.heroStyle === "fullbleed" || d.heroStyle === "cinematic"
      ? 100
      : d.heroStyle === "editorial"
      ? 90
      : 80;

  const imagePosition: ReferenceHeroDNA["imagePosition"] =
    d.heroStyle === "fullbleed" || d.heroStyle === "monumental" || d.heroStyle === "cinematic"
      ? "behind"
      : d.heroStyle === "split" || d.heroStyle === "bento"
      ? "right"
      : d.heroStyle === "editorial"
      ? "left"
      : "none";

  const visualWeight: ReferenceHeroDNA["visualWeight"] =
    d.heroStyle === "monumental" ? "text-heavy" : d.heroStyle === "minimal" ? "text-heavy" : "balanced";

  const pairingCategory: ReferenceTypographyDNA["pairingCategory"] = d.typePairing
    .toLowerCase()
    .includes("serif")
    ? d.typePairing.toLowerCase().includes("+")
      ? "serif-sans"
      : "serif-only"
    : "sans-only";

  const trackingTightness: ReferenceTypographyDNA["trackingTightness"] =
    d.typeWeight >= 700 ? "tight" : d.typeWeight >= 550 ? "subtle" : "none";

  const editorialScale: ReferenceTypographyDNA["editorialScale"] =
    d.rhythm === "editorial" ? "editorial" : d.rhythm === "generous" ? "bold" : "modern";

  const hierarchyDepth = d.rhythm === "editorial" ? 5 : d.rhythm === "generous" ? 4 : 3;

  const textDensity: ReferenceTypographyDNA["textDensity"] =
    d.rhythm === "editorial" ? "sparse" : d.rhythm === "tight" ? "dense" : "moderate";

  const gridPhilosophy: ReferenceLayoutDNA["gridPhilosophy"] =
    d.heroStyle === "editorial" || d.rhythm === "editorial"
      ? "editorial-grid"
      : d.heroStyle === "bento"
      ? "asymmetric"
      : "symmetric";

  const sectionRhythm: ReferenceLayoutDNA["sectionRhythm"] =
    d.rhythm === "editorial" ? "editorial-pause" : d.sectionDividers ? "alternating" : "steady";

  const asymmetryIntensity: ReferenceLayoutDNA["asymmetryIntensity"] =
    d.heroStyle === "bento" ? "bold" : d.rhythm === "editorial" ? "subtle" : "none";

  const galleryStyle: ReferenceImageDNA["galleryStyle"] = d.galleryStyle ?? "none";

  const imageRadius =
    d.cardStyle === "editorial" || d.cardStyle === "flat" ? 0 : d.cardStyle === "glass" ? 16 : 12;

  const imageDensity: ReferenceImageDNA["imageDensity"] = d.galleryStyle ? "moderate" : "minimal";

  const ctaSize: ReferenceComponentDNA["ctaSize"] = d.spacingMultiplier >= 1.5 ? "lg" : "md";

  const springPhysics: ReferenceMotionDNA["springPhysics"] =
    d.motionLevel >= 3 ? "heavy" : d.motionLevel >= 2 ? "light" : "none";

  const interactionPhilosophy: ReferenceMotionDNA["interactionPhilosophy"] =
    d.motionLevel >= 3 ? "cinematic" : d.motionLevel >= 2 ? "purposeful" : "restrained";

  const luxuryScore = ref.tier === "luxury" ? 80 : 55;
  const modernityScore = d.motionLevel >= 2 ? 80 : 60;
  const editorialScore = d.rhythm === "editorial" ? 85 : d.rhythm === "generous" ? 65 : 45;
  const minimalismScore = d.colorMode === "monochrome" ? 75 : d.colorMode === "accent-rare" ? 55 : 35;
  const premiumScore = Math.round((luxuryScore + modernityScore + editorialScore + minimalismScore) / 4);

  return {
    hero: {
      compositionType: d.heroStyle,
      viewportOccupation,
      imagePosition,
      textAlignment: d.heroStyle === "editorial" ? "left" : "center",
      visualWeight,
      layering: d.heroStyle === "monumental" ? "overlapping" : "flat",
      hasOverlay: d.imageStyle === "fullbleed",
      overlayOpacity: d.imageStyle === "fullbleed" ? 0.35 : 0,
      ctaCount: 1,
      ctaPlacement: "below-headline",
      stickyBehavior: "none",
      headlineScale,
    },
    typography: {
      pairingCategory,
      pairingName: d.typePairing,
      headingWeight: d.typeWeight,
      bodyWeight: 400,
      trackingTightness,
      editorialScale,
      uppercaseUsage: d.typeWeight >= 700 ? "headings" : "none",
      hierarchyDepth,
      textDensity,
    },
    layout: {
      gridPhilosophy,
      columnCount: d.heroStyle === "split" ? 2 : 1,
      spacingScale: d.rhythm,
      spacingMultiplier: d.spacingMultiplier,
      sectionRhythm,
      alignmentPhilosophy: d.heroStyle === "editorial" ? "left-aligned" : "centered",
      overlapPatterns: d.heroStyle === "monumental",
      asymmetryIntensity,
      sectionDividers: d.sectionDividers,
      containerWidth: 1280,
    },
    image: {
      galleryStyle,
      dominantAspectRatio: "landscape",
      croppingPhilosophy: d.imageStyle === "fullbleed" ? "full-subject" : "breathing",
      backgroundTreatment: d.imageStyle === "fullbleed" ? "overlay" : "none",
      imageStyle: d.imageStyle,
      imageRadius,
      imageDensity,
    },
    component: {
      cardStyle: d.cardStyle,
      cardRadius: imageRadius,
      cardHoverEffect: d.cardHover,
      ctaStyle: d.ctaStyle,
      ctaSize,
      dividerUsage: d.sectionDividers,
      badgeStyle: "none",
      processPresentation: "none",
    },
    motion: {
      intensity: d.motionLevel,
      entranceType: d.entranceType,
      scrollBehavior: d.motionLevel >= 2 ? "parallax" : "none",
      microInteractions: d.motionLevel >= 2,
      springPhysics,
      staggerDelay: d.motionLevel >= 3 ? 0.08 : 0.05,
      transitionDuration: d.motionLevel >= 3 ? 0.5 : 0.3,
      interactionPhilosophy,
    },
    brand: {
      luxuryScore,
      modernityScore,
      editorialScore,
      minimalismScore,
      premiumScore,
      colorMode: d.colorMode,
      usesGradients: d.usesGradients,
      prefersDark: d.prefersDark,
      emotionalDirection: d.prefersDark ? "cool" : "warm",
      visualDensity: textDensity === "sparse" ? "sparse" : textDensity === "dense" ? "dense" : "moderate",
      surfaceColor: null,
      inkColor: null,
    },
  };
}
