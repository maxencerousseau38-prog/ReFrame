import { describe, it, expect } from "vitest";
import type { VisualDNA } from "@/lib/generation/types";
import type { InspirationProfile } from "@/lib/generation/similarity";
import { findClosestReferences } from "@/lib/generation/similarity";
import { ENRICHED_REFERENCE_DB } from "@/lib/generation/reference-library";
import { inspirationLayer, MIN_INSPIRATION_MATCH } from "./candidates";
import { resolveTree } from "./resolver";

/* -------------------------------------------------------------------------- */
/*  Unit: inspirationLayer maps a premium reference into a curated layer      */
/* -------------------------------------------------------------------------- */

function archformProfile(strongestMatch: number): InspirationProfile {
  const ref = ENRICHED_REFERENCE_DB.find((r) => r.id === "ref-archform")!;
  return {
    references: [{ reference: ref, similarity: { overall: strongestMatch, dimensions: [], referenceId: ref.id }, weight: 1 }],
    strongestMatch,
    dimensionLeaders: {},
  };
}

describe("inspirationLayer", () => {
  it("emits a curated layer from the closest reference's MEASURED decisions", () => {
    const layer = inspirationLayer(archformProfile(0.72))!;
    expect(layer.source).toBe("curated");
    expect(layer.origin).toContain("ref-archform");
    expect(layer.confidence).toBe(0.72);
    const d = layer.data as any;
    // Archform's measurable design decisions — never markup.
    expect(d.heroDirection.style).toBe("monumental");
    expect(d.rhythm.spacingMultiplier).toBe(1.75);
    expect(d.rhythm.density).toBe("editorial");
    expect(d.motion.level).toBe(3);
    expect(d.motion.entranceType).toBe("stagger");
    expect(d.colorStrategy.mode).toBe("monochrome");
    expect(d.contentMaxWidth).toBe("1280px");
  });

  it("stays silent below the match threshold (diversity preserved, no force-fit)", () => {
    expect(inspirationLayer(archformProfile(MIN_INSPIRATION_MATCH - 0.01))).toBeUndefined();
    expect(inspirationLayer(undefined)).toBeUndefined();
    expect(inspirationLayer({ references: [], strongestMatch: 0, dimensionLeaders: {} })).toBeUndefined();
  });

  it("I1: measured source values always beat the inspiration (curated) layer", () => {
    const preset = { data: { rhythm: { spacingMultiplier: 1 }, motion: { level: 1 } }, source: "preset" as const, origin: "preset" };
    const measured = {
      data: { rhythm: { spacingMultiplier: 1.25 } }, source: "measured" as const, origin: "measure",
      fieldConfidence: { "rhythm.spacingMultiplier": 0.9 },
    };
    const res = resolveTree(preset, [measured, inspirationLayer(archformProfile(0.8))!]);
    // measured wins where it spoke…
    expect((res.value as any).rhythm.spacingMultiplier).toBe(1.25);
    // …inspiration fills the gap the source left (motion.level had no measure)
    expect((res.value as any).motion.level).toBe(3);
    expect(res.slots.get("rhythm.spacingMultiplier")!.chosen.source).toBe("measured");
    expect(res.slots.get("motion.level")!.chosen.source).toBe("curated");
  });
});

/* -------------------------------------------------------------------------- */
/*  Integration: a genuinely Archform-like site crosses the match threshold   */
/* -------------------------------------------------------------------------- */

function archformLikeVisualDna(): VisualDNA {
  return {
    hero: {
      viewportOccupation: 100, imageRatio: "landscape", imagePosition: "behind",
      textAlignment: "center", headlineWordCount: 4, hasOverlay: false,
      layering: "overlapping", compositionType: "editorial", ctaCount: 1,
      ctaPlacement: "below-headline", visualWeight: "text-heavy",
    },
    typography: {
      headingFont: "Inter Display", bodyFont: "Inter", accentFont: null,
      editorialScale: "bold", headingWeight: 700, uppercaseUsage: "headings",
      trackingTight: true, fontHierarchyDepth: 4, textDensity: "sparse",
    },
    layout: {
      containerWidth: 1280, columnCount: 2, asymmetry: true, sectionCount: 6,
      spacingScale: "editorial", verticalSpacing: 128, alignmentPhilosophy: "left-aligned",
      overlapPatterns: true, sectionRhythm: [],
    },
    image: {
      dominantAspectRatio: "landscape", fullscreenUsage: true, galleryRhythm: "editorial",
      backgroundTreatment: "none", imageCount: 6, heroImagePresent: true, portfolioStyle: "fullbleed",
    },
    component: {
      cardRadius: 0, cardBorder: "none", cardShadow: "none", iconStyle: null,
      ctaStyle: "pill", ctaCount: 1, badgeLanguage: "none", dividerUsage: true,
    },
    motion: {
      animationIntensity: 3, entranceAnimations: ["stagger"], scrollAnimations: true,
      parallaxDetected: true, hoverBehavior: ["scale"], interactionPhilosophy: "cinematic",
      staggerDetected: true, transitionDuration: 500,
    },
    brand: {
      luxuryScore: 60, modernityScore: 85, editorialScore: 80, minimalismScore: 70,
      visualDensity: "sparse", premiumScore: 80, emotionalDirection: "cool",
      personality: ["refined"], surfaceColor: "#ffffff", inkColor: "#000000",
      accentColor: "#111111", isDark: false,
    },
  };
}

describe("findClosestReferences + inspirationLayer (integration)", () => {
  it("an Archform-like measured site matches Archform above threshold", () => {
    const profile = findClosestReferences(archformLikeVisualDna(), ENRICHED_REFERENCE_DB);
    expect(profile.strongestMatch).toBeGreaterThanOrEqual(MIN_INSPIRATION_MATCH);
    expect(profile.references[0].reference.id).toBe("ref-archform");
    expect(inspirationLayer(profile)).toBeDefined();
  });

  it("no VisualDNA → empty profile → no layer (byte-identical fallback)", () => {
    const profile = findClosestReferences(undefined, ENRICHED_REFERENCE_DB);
    expect(profile.strongestMatch).toBe(0);
    expect(inspirationLayer(profile)).toBeUndefined();
  });
});
