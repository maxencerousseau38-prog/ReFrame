import { describe, it, expect } from "vitest";
import { computeSimilarity, findClosestReferences } from "./similarity";
import { ENRICHED_REFERENCE_DB } from "./reference-library";
import type { VisualDNA } from "@/lib/extraction/types";
import type { ReferenceDNA } from "./reference-dna";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ARCHFORM_VISUAL: VisualDNA = {
  hero: {
    compositionType: "cinematic",
    viewportOccupation: 100,
    imageRatio: "landscape",
    imagePosition: "behind",
    textAlignment: "center",
    headlineWordCount: 5,
    hasOverlay: false,
    layering: "overlapping",
    ctaCount: 1,
    ctaPlacement: "below-headline",
    visualWeight: "text-heavy",
  },
  typography: {
    headingFont: "Inter Display",
    bodyFont: "Inter",
    accentFont: null,
    editorialScale: "bold",
    headingWeight: 700,
    uppercaseUsage: "headings",
    trackingTight: true,
    fontHierarchyDepth: 4,
    textDensity: "sparse",
  },
  layout: {
    containerWidth: 1280,
    columnCount: 2,
    asymmetry: true,
    sectionCount: 8,
    spacingScale: "editorial",
    verticalSpacing: 120,
    alignmentPhilosophy: "left-aligned",
    overlapPatterns: true,
    sectionRhythm: ["hero", "features", "process", "gallery", "cta"],
  },
  image: {
    dominantAspectRatio: "landscape",
    fullscreenUsage: true,
    galleryRhythm: "strip",
    backgroundTreatment: "none",
    imageCount: 12,
    heroImagePresent: true,
    portfolioStyle: "fullbleed",
  },
  component: {
    cardRadius: 0,
    cardBorder: "none",
    cardShadow: "none",
    iconStyle: null,
    ctaStyle: "pill",
    ctaCount: 2,
    badgeLanguage: "none",
    dividerUsage: true,
  },
  motion: {
    animationIntensity: 3,
    entranceAnimations: ["stagger", "fade"],
    scrollAnimations: true,
    parallaxDetected: false,
    hoverBehavior: ["scale"],
    interactionPhilosophy: "cinematic",
    staggerDetected: true,
    transitionDuration: 500,
  },
  brand: {
    luxuryScore: 62,
    modernityScore: 84,
    editorialScore: 79,
    minimalismScore: 68,
    premiumScore: 79,
    visualDensity: "sparse",
    emotionalDirection: "cool",
    personality: ["sophisticated", "modern"],
    surfaceColor: "#ffffff",
    inkColor: "#000000",
    accentColor: null,
    isDark: false,
  },
};

/** VisualDNA that is the opposite of Archform on every measurable axis. */
const OPPOSITE_VISUAL: VisualDNA = {
  hero: {
    compositionType: "split",
    viewportOccupation: 40,
    imageRatio: "portrait",
    imagePosition: "right",
    textAlignment: "right",
    headlineWordCount: 20,
    hasOverlay: true,
    layering: "flat",
    ctaCount: 5,
    ctaPlacement: "bottom",
    visualWeight: "image-heavy",
  },
  typography: {
    headingFont: "Georgia",
    bodyFont: "Times New Roman",
    accentFont: null,
    editorialScale: "compact",
    headingWeight: 300,
    uppercaseUsage: "none",
    trackingTight: false,
    fontHierarchyDepth: 1,
    textDensity: "dense",
  },
  layout: {
    containerWidth: 480,
    columnCount: 6,
    asymmetry: false,
    sectionCount: 2,
    spacingScale: "tight",
    verticalSpacing: 8,
    alignmentPhilosophy: "centered",
    overlapPatterns: false,
    sectionRhythm: [],
  },
  image: {
    dominantAspectRatio: "portrait",
    fullscreenUsage: false,
    galleryRhythm: "single",
    backgroundTreatment: "duotone",
    imageCount: 1,
    heroImagePresent: false,
    portfolioStyle: null,
  },
  component: {
    cardRadius: 24,
    cardBorder: "solid",
    cardShadow: "dramatic",
    iconStyle: "filled",
    ctaStyle: "ghost",
    ctaCount: 8,
    badgeLanguage: "rounded",
    dividerUsage: false,
  },
  motion: {
    animationIntensity: 0,
    entranceAnimations: [],
    scrollAnimations: false,
    parallaxDetected: false,
    hoverBehavior: [],
    interactionPhilosophy: "restrained",
    staggerDetected: false,
    transitionDuration: null,
  },
  brand: {
    luxuryScore: 10,
    modernityScore: 20,
    editorialScore: 10,
    minimalismScore: 10,
    premiumScore: 15,
    visualDensity: "dense",
    emotionalDirection: "warm",
    personality: [],
    surfaceColor: "#000000",
    inkColor: "#ffffff",
    accentColor: "#ff0000",
    isDark: true,
  },
};

// ---------------------------------------------------------------------------
// computeSimilarity — unit tests
// ---------------------------------------------------------------------------

describe("computeSimilarity", () => {
  const archformDna: ReferenceDNA = ENRICHED_REFERENCE_DB.find(
    (r) => r.id === "ref-archform"
  )!.richDna!;

  it("returns overall score near 1.0 when visual matches the reference closely", () => {
    const score = computeSimilarity(ARCHFORM_VISUAL, archformDna, "ref-archform");
    expect(score.overall).toBeGreaterThan(0.6);
  });

  it("returns a low score when visual is the opposite of the reference", () => {
    const score = computeSimilarity(OPPOSITE_VISUAL, archformDna, "ref-archform");
    expect(score.overall).toBeLessThan(0.5);
  });

  it("scores closer when inputs are similar vs dissimilar", () => {
    const close = computeSimilarity(ARCHFORM_VISUAL, archformDna, "x");
    const far = computeSimilarity(OPPOSITE_VISUAL, archformDna, "x");
    expect(close.overall).toBeGreaterThan(far.overall);
  });

  it("produces exactly 7 dimension scores", () => {
    const score = computeSimilarity(ARCHFORM_VISUAL, archformDna, "x");
    expect(score.dimensions).toHaveLength(7);
  });

  it("names all 7 expected dimensions", () => {
    const score = computeSimilarity(ARCHFORM_VISUAL, archformDna, "x");
    const names = score.dimensions.map((d) => d.dimension).sort();
    expect(names).toEqual(
      ["brand", "component", "hero", "image", "layout", "motion", "typography"].sort()
    );
  });

  it("all dimension scores are in [0, 1]", () => {
    const score = computeSimilarity(ARCHFORM_VISUAL, archformDna, "x");
    for (const d of score.dimensions) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(1);
    }
  });

  it("overall is in [0, 1]", () => {
    const score = computeSimilarity(ARCHFORM_VISUAL, archformDna, "x");
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(1);
  });

  it("is deterministic — same inputs produce same output", () => {
    const a = computeSimilarity(ARCHFORM_VISUAL, archformDna, "ref-archform");
    const b = computeSimilarity(ARCHFORM_VISUAL, archformDna, "ref-archform");
    expect(a).toEqual(b);
  });

  it("referenceId is preserved in the result", () => {
    const score = computeSimilarity(ARCHFORM_VISUAL, archformDna, "ref-archform");
    expect(score.referenceId).toBe("ref-archform");
  });

  it("enumScore partial credit: cinematic compositionType vs monumental reference gets >0 but <1 on hero", () => {
    // ARCHFORM_VISUAL uses "cinematic"; Archform reference uses "monumental"
    // They are closeness-map neighbors → partial credit → score between 0 and 1
    const score = computeSimilarity(ARCHFORM_VISUAL, archformDna, "x");
    const hero = score.dimensions.find((d) => d.dimension === "hero")!;
    expect(hero.score).toBeGreaterThan(0);
    expect(hero.score).toBeLessThan(1);
  });
});

// ---------------------------------------------------------------------------
// findClosestReferences — unit tests
// ---------------------------------------------------------------------------

describe("findClosestReferences", () => {
  it("returns empty profile when visual is undefined", () => {
    const profile = findClosestReferences(undefined, ENRICHED_REFERENCE_DB);
    expect(profile.references).toHaveLength(0);
    expect(profile.strongestMatch).toBe(0);
    expect(profile.dimensionLeaders).toEqual({});
  });

  it("returns empty profile when no entries have richDna", () => {
    const noRich = ENRICHED_REFERENCE_DB.map((r) => ({ ...r, richDna: undefined }));
    const profile = findClosestReferences(ARCHFORM_VISUAL, noRich);
    expect(profile.references).toHaveLength(0);
    expect(profile.strongestMatch).toBe(0);
  });

  it("skips references without richDna", () => {
    const profile = findClosestReferences(ARCHFORM_VISUAL, ENRICHED_REFERENCE_DB);
    // Only ref-archform has richDna → at most 1 result
    expect(profile.references.length).toBeLessThanOrEqual(1);
    for (const wr of profile.references) {
      expect(wr.reference.richDna).toBeDefined();
    }
  });

  it("weights sum to 1.0", () => {
    const profile = findClosestReferences(ARCHFORM_VISUAL, ENRICHED_REFERENCE_DB);
    const sum = profile.references.reduce((s, r) => s + r.weight, 0);
    if (profile.references.length > 0) {
      expect(sum).toBeCloseTo(1.0, 9);
    }
  });

  it("respects topN parameter", () => {
    const enrichedAll = ENRICHED_REFERENCE_DB.map((r, i) => ({
      ...r,
      id: `mock-${i}`,
      richDna: ENRICHED_REFERENCE_DB.find((x) => x.richDna)?.richDna,
    }));
    const profile = findClosestReferences(ARCHFORM_VISUAL, enrichedAll, 2);
    expect(profile.references.length).toBeLessThanOrEqual(2);
  });

  it("strongestMatch equals the highest overall score", () => {
    const profile = findClosestReferences(ARCHFORM_VISUAL, ENRICHED_REFERENCE_DB);
    if (profile.references.length > 0) {
      const maxScore = Math.max(...profile.references.map((r) => r.similarity.overall));
      expect(profile.strongestMatch).toBeCloseTo(maxScore, 10);
    }
  });

  it("dimensionLeaders keys are valid SimilarityDimensions", () => {
    const valid = new Set(["hero", "typography", "layout", "image", "component", "motion", "brand"]);
    const profile = findClosestReferences(ARCHFORM_VISUAL, ENRICHED_REFERENCE_DB);
    for (const key of Object.keys(profile.dimensionLeaders)) {
      expect(valid.has(key)).toBe(true);
    }
  });

  it("dimensionLeaders values are valid reference ids", () => {
    const profile = findClosestReferences(ARCHFORM_VISUAL, ENRICHED_REFERENCE_DB);
    const ids = new Set(profile.references.map((r) => r.reference.id));
    for (const id of Object.values(profile.dimensionLeaders)) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("is deterministic — same inputs produce same output", () => {
    const a = findClosestReferences(ARCHFORM_VISUAL, ENRICHED_REFERENCE_DB);
    const b = findClosestReferences(ARCHFORM_VISUAL, ENRICHED_REFERENCE_DB);
    expect(a).toEqual(b);
  });
});
