/**
 * Enriched reference library — wraps the curated REFERENCE_DB with
 * hand-curated ReferenceDNA measurements for select references.
 *
 * This is the "Continuous Learning" surface of the Reference Learning
 * Engine: enriching a reference is the *only* change needed to make the
 * similarity engine and Art Director aware of it. Nothing else in the
 * pipeline changes when a new richDna entry is added.
 *
 * References without `richDna` continue to work through the existing
 * Moodboard system exactly as before — `findClosestReferences()` simply
 * skips them.
 */

import { REFERENCE_DB } from "./reference-db";
import type { EnrichedReference, ReferenceDNA } from "./reference-dna";

/* -------------------------------------------------------------------------- */
/*  Archform — hand-curated from its inspiration text + Framer source        */
/* -------------------------------------------------------------------------- */

const ARCHFORM_DNA: ReferenceDNA = {
  hero: {
    compositionType: "monumental",
    viewportOccupation: 100,
    imagePosition: "behind",
    textAlignment: "center",
    visualWeight: "text-heavy",
    layering: "overlapping",
    hasOverlay: false,
    overlayOpacity: 0,
    ctaCount: 1,
    ctaPlacement: "below-headline",
    stickyBehavior: "pin-scroll",
    headlineScale: "monumental",
  },
  typography: {
    pairingCategory: "sans-only",
    pairingName: "Inter Display + Inter",
    headingWeight: 700,
    bodyWeight: 400,
    trackingTightness: "tight",
    editorialScale: "monumental",
    uppercaseUsage: "headings",
    hierarchyDepth: 4,
    textDensity: "sparse",
  },
  layout: {
    gridPhilosophy: "editorial-grid",
    columnCount: 2,
    spacingScale: "editorial",
    spacingMultiplier: 1.75,
    sectionRhythm: "editorial-pause",
    alignmentPhilosophy: "left-aligned",
    overlapPatterns: true,
    asymmetryIntensity: "subtle",
    sectionDividers: true,
    containerWidth: 1280,
  },
  image: {
    galleryStyle: "carousel-3d",
    dominantAspectRatio: "landscape",
    croppingPhilosophy: "full-subject",
    backgroundTreatment: "none",
    imageStyle: "fullbleed",
    imageRadius: 0,
    imageDensity: "moderate",
  },
  component: {
    cardStyle: "flat",
    cardRadius: 0,
    cardHoverEffect: "scale",
    ctaStyle: "pill",
    ctaSize: "lg",
    dividerUsage: true,
    badgeStyle: "none",
    processPresentation: "sticky-stack",
  },
  motion: {
    intensity: 3,
    entranceType: "stagger",
    scrollBehavior: "sticky",
    microInteractions: true,
    springPhysics: "heavy",
    staggerDelay: 0.08,
    transitionDuration: 0.5,
    interactionPhilosophy: "cinematic",
  },
  brand: {
    luxuryScore: 60,
    modernityScore: 85,
    editorialScore: 80,
    minimalismScore: 70,
    premiumScore: 80,
    colorMode: "monochrome",
    usesGradients: false,
    prefersDark: false,
    emotionalDirection: "cool",
    visualDensity: "sparse",
    surfaceColor: "#ffffff",
    inkColor: "#000000",
  },
};

/* -------------------------------------------------------------------------- */
/*  Library                                                                   */
/* -------------------------------------------------------------------------- */

const RICH_DNA_BY_ID: Record<string, ReferenceDNA> = {
  "ref-archform": ARCHFORM_DNA,
};

export const ENRICHED_REFERENCE_DB: EnrichedReference[] = REFERENCE_DB.map((ref) => {
  const richDna = RICH_DNA_BY_ID[ref.id];
  return richDna ? { ...ref, richDna } : ref;
});
