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
/*  Additional premium design languages — MEASURED decisions only.            */
/*  Each is an original abstraction of a well-known premium design language    */
/*  into comparable data (enums/numbers). Never markup, never copied layout.  */
/* -------------------------------------------------------------------------- */

// Modern dark-tech SaaS (Linear-like): cinematic ambient hero, product
// preview, restrained accent on near-black, purposeful micro-motion.
const LINEAR_DNA: ReferenceDNA = {
  hero: {
    compositionType: "cinematic", viewportOccupation: 90, imagePosition: "right",
    textAlignment: "left", visualWeight: "balanced", layering: "flat", hasOverlay: false,
    overlayOpacity: 0, ctaCount: 2, ctaPlacement: "below-headline", stickyBehavior: "none",
    headlineScale: "modern",
  },
  typography: {
    pairingCategory: "sans-only", pairingName: "Inter Display + Inter", headingWeight: 560,
    bodyWeight: 400, trackingTightness: "tight", editorialScale: "modern", uppercaseUsage: "none",
    hierarchyDepth: 4, textDensity: "moderate",
  },
  layout: {
    gridPhilosophy: "symmetric", columnCount: 3, spacingScale: "generous", spacingMultiplier: 1.5,
    sectionRhythm: "steady", alignmentPhilosophy: "left-aligned", overlapPatterns: false,
    asymmetryIntensity: "none", sectionDividers: false, containerWidth: 1200,
  },
  image: {
    galleryStyle: "feature", dominantAspectRatio: "landscape", croppingPhilosophy: "breathing",
    backgroundTreatment: "gradient-scrim", imageStyle: "rounded", imageRadius: 12, imageDensity: "minimal",
  },
  component: {
    cardStyle: "glass", cardRadius: 12, cardHoverEffect: "glow", ctaStyle: "pill", ctaSize: "md",
    dividerUsage: false, badgeStyle: "pill", processPresentation: "cards",
  },
  motion: {
    intensity: 3, entranceType: "blur-fade", scrollBehavior: "reveal", microInteractions: true,
    springPhysics: "light", staggerDelay: 0.06, transitionDuration: 0.4, interactionPhilosophy: "purposeful",
  },
  brand: {
    luxuryScore: 55, modernityScore: 95, editorialScore: 45, minimalismScore: 80, premiumScore: 85,
    colorMode: "accent-rare", usesGradients: true, prefersDark: true, emotionalDirection: "cool",
    visualDensity: "moderate", surfaceColor: "#08090a", inkColor: "#f7f8f8",
  },
};

// Clean light product/B2B (Stripe-like): split hero + preview, tidy grids,
// duotone accents on white, deliberate hierarchy, slide-up entrances.
const STRIPE_DNA: ReferenceDNA = {
  hero: {
    compositionType: "split", viewportOccupation: 80, imagePosition: "right", textAlignment: "left",
    visualWeight: "balanced", layering: "flat", hasOverlay: false, overlayOpacity: 0, ctaCount: 2,
    ctaPlacement: "below-headline", stickyBehavior: "none", headlineScale: "modern",
  },
  typography: {
    pairingCategory: "sans-only", pairingName: "Sohne-like sans + Inter", headingWeight: 540,
    bodyWeight: 425, trackingTightness: "subtle", editorialScale: "modern", uppercaseUsage: "nav-only",
    hierarchyDepth: 5, textDensity: "moderate",
  },
  layout: {
    gridPhilosophy: "symmetric", columnCount: 3, spacingScale: "standard", spacingMultiplier: 1.25,
    sectionRhythm: "alternating", alignmentPhilosophy: "left-aligned", overlapPatterns: false,
    asymmetryIntensity: "subtle", sectionDividers: false, containerWidth: 1080,
  },
  image: {
    galleryStyle: "grid", dominantAspectRatio: "landscape", croppingPhilosophy: "breathing",
    backgroundTreatment: "gradient-scrim", imageStyle: "rounded", imageRadius: 8, imageDensity: "moderate",
  },
  component: {
    cardStyle: "elevated", cardRadius: 8, cardHoverEffect: "lift", ctaStyle: "pill", ctaSize: "md",
    dividerUsage: false, badgeStyle: "rounded", processPresentation: "numbered",
  },
  motion: {
    intensity: 2, entranceType: "slide-up", scrollBehavior: "reveal", microInteractions: true,
    springPhysics: "light", staggerDelay: 0.05, transitionDuration: 0.3, interactionPhilosophy: "purposeful",
  },
  brand: {
    luxuryScore: 50, modernityScore: 88, editorialScore: 50, minimalismScore: 70, premiumScore: 82,
    colorMode: "duotone", usesGradients: true, prefersDark: false, emotionalDirection: "cool",
    visualDensity: "moderate", surfaceColor: "#ffffff", inkColor: "#0a2540",
  },
};

// Bold creative studio (Agencia-like): colossal condensed statement on
// near-black, extreme tracking, overlapping asymmetry, cinematic stagger.
const AGENCIA_DNA: ReferenceDNA = {
  hero: {
    compositionType: "cinematic", viewportOccupation: 100, imagePosition: "none", textAlignment: "left",
    visualWeight: "text-heavy", layering: "stacked", hasOverlay: false, overlayOpacity: 0, ctaCount: 1,
    ctaPlacement: "below-headline", stickyBehavior: "none", headlineScale: "monumental",
  },
  typography: {
    pairingCategory: "display-sans", pairingName: "Condensed grotesk + Inter", headingWeight: 700,
    bodyWeight: 400, trackingTightness: "extreme", editorialScale: "bold", uppercaseUsage: "extensive",
    hierarchyDepth: 3, textDensity: "sparse",
  },
  layout: {
    gridPhilosophy: "asymmetric", columnCount: 2, spacingScale: "editorial", spacingMultiplier: 1.75,
    sectionRhythm: "crescendo", alignmentPhilosophy: "left-aligned", overlapPatterns: true,
    asymmetryIntensity: "bold", sectionDividers: false, containerWidth: 1360,
  },
  image: {
    galleryStyle: "masonry", dominantAspectRatio: "mixed", croppingPhilosophy: "full-subject",
    backgroundTreatment: "none", imageStyle: "fullbleed", imageRadius: 0, imageDensity: "image-heavy",
  },
  component: {
    cardStyle: "flat", cardRadius: 0, cardHoverEffect: "scale", ctaStyle: "text-arrow", ctaSize: "lg",
    dividerUsage: false, badgeStyle: "none", processPresentation: "numbered",
  },
  motion: {
    intensity: 3, entranceType: "stagger", scrollBehavior: "parallax", microInteractions: true,
    springPhysics: "heavy", staggerDelay: 0.08, transitionDuration: 0.5, interactionPhilosophy: "cinematic",
  },
  brand: {
    luxuryScore: 55, modernityScore: 90, editorialScore: 75, minimalismScore: 45, premiumScore: 78,
    colorMode: "accent-rare", usesGradients: false, prefersDark: true, emotionalDirection: "warm",
    visualDensity: "moderate", surfaceColor: "#0a0a0a", inkColor: "#fafafa",
  },
};

// Luxury fine-dining / editorial (Noma-like): monumental editorial hero,
// serif display, extreme whitespace, restrained reveal motion, monochrome.
const NOMA_DNA: ReferenceDNA = {
  hero: {
    compositionType: "editorial", viewportOccupation: 100, imagePosition: "behind", textAlignment: "center",
    visualWeight: "balanced", layering: "flat", hasOverlay: true, overlayOpacity: 0.3, ctaCount: 1,
    ctaPlacement: "bottom", stickyBehavior: "parallax-scroll", headlineScale: "monumental",
  },
  typography: {
    pairingCategory: "serif-sans", pairingName: "Serif display + sans", headingWeight: 400, bodyWeight: 400,
    trackingTightness: "subtle", editorialScale: "monumental", uppercaseUsage: "nav-only", hierarchyDepth: 4,
    textDensity: "sparse",
  },
  layout: {
    gridPhilosophy: "editorial-grid", columnCount: 2, spacingScale: "editorial", spacingMultiplier: 2.0,
    sectionRhythm: "editorial-pause", alignmentPhilosophy: "centered", overlapPatterns: false,
    asymmetryIntensity: "subtle", sectionDividers: true, containerWidth: 1200,
  },
  image: {
    galleryStyle: "editorial", dominantAspectRatio: "portrait", croppingPhilosophy: "breathing",
    backgroundTreatment: "overlay", imageStyle: "editorial", imageRadius: 0, imageDensity: "moderate",
  },
  component: {
    cardStyle: "editorial", cardRadius: 0, cardHoverEffect: "none", ctaStyle: "ghost", ctaSize: "md",
    dividerUsage: true, badgeStyle: "none", processPresentation: "none",
  },
  motion: {
    intensity: 2, entranceType: "reveal", scrollBehavior: "parallax", microInteractions: false,
    springPhysics: "critically-damped", staggerDelay: 0.05, transitionDuration: 0.6, interactionPhilosophy: "restrained",
  },
  brand: {
    luxuryScore: 90, modernityScore: 60, editorialScore: 90, minimalismScore: 85, premiumScore: 92,
    colorMode: "monochrome", usesGradients: false, prefersDark: false, emotionalDirection: "neutral",
    visualDensity: "sparse", surfaceColor: "#f7f5f0", inkColor: "#1a1a1a",
  },
};

// Warm hospitality (Flavor-like): full-bleed image hero with scrim, warm
// serif display, generous alternating rhythm, blur-fade, dark canvas.
const FLAVOR_DNA: ReferenceDNA = {
  hero: {
    compositionType: "fullbleed", viewportOccupation: 100, imagePosition: "behind", textAlignment: "center",
    visualWeight: "image-heavy", layering: "flat", hasOverlay: true, overlayOpacity: 0.45, ctaCount: 1,
    ctaPlacement: "below-headline", stickyBehavior: "none", headlineScale: "editorial",
  },
  typography: {
    pairingCategory: "serif-sans", pairingName: "Serif + Inter", headingWeight: 400, bodyWeight: 400,
    trackingTightness: "none", editorialScale: "editorial", uppercaseUsage: "nav-only", hierarchyDepth: 4,
    textDensity: "moderate",
  },
  layout: {
    gridPhilosophy: "editorial-grid", columnCount: 2, spacingScale: "generous", spacingMultiplier: 1.5,
    sectionRhythm: "alternating", alignmentPhilosophy: "centered", overlapPatterns: false,
    asymmetryIntensity: "subtle", sectionDividers: true, containerWidth: 1200,
  },
  image: {
    galleryStyle: "editorial", dominantAspectRatio: "landscape", croppingPhilosophy: "full-subject",
    backgroundTreatment: "gradient-scrim", imageStyle: "fullbleed", imageRadius: 0, imageDensity: "image-heavy",
  },
  component: {
    cardStyle: "editorial", cardRadius: 4, cardHoverEffect: "none", ctaStyle: "ghost", ctaSize: "md",
    dividerUsage: true, badgeStyle: "none", processPresentation: "none",
  },
  motion: {
    intensity: 2, entranceType: "blur-fade", scrollBehavior: "reveal", microInteractions: true,
    springPhysics: "light", staggerDelay: 0.06, transitionDuration: 0.5, interactionPhilosophy: "purposeful",
  },
  brand: {
    luxuryScore: 70, modernityScore: 65, editorialScore: 75, minimalismScore: 55, premiumScore: 80,
    colorMode: "accent-rare", usesGradients: false, prefersDark: true, emotionalDirection: "warm",
    visualDensity: "moderate", surfaceColor: "#14100c", inkColor: "#f0e9e0",
  },
};

/* -------------------------------------------------------------------------- */
/*  Library                                                                   */
/* -------------------------------------------------------------------------- */

const RICH_DNA_BY_ID: Record<string, ReferenceDNA> = {
  "ref-archform": ARCHFORM_DNA,
  "ref-linear": LINEAR_DNA,
  "ref-stripe": STRIPE_DNA,
  "ref-agencia": AGENCIA_DNA,
  "ref-noma": NOMA_DNA,
  "ref-flavor": FLAVOR_DNA,
};

export const ENRICHED_REFERENCE_DB: EnrichedReference[] = REFERENCE_DB.map((ref) => {
  const richDna = RICH_DNA_BY_ID[ref.id];
  return richDna ? { ...ref, richDna } : ref;
});
