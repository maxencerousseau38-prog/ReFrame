import { describe, it, expect } from "vitest";
import type { VisualDNA } from "./types";
import { findClosestReferences } from "./similarity";
import { ENRICHED_REFERENCE_DB } from "./reference-library";

/**
 * The enriched library must broaden premium coverage: different measured
 * design languages should match DIFFERENT references (never always Archform),
 * so reconstructed sites gain premium quality without looking uniform.
 * Values here are measured design decisions — no markup is ever involved.
 */

function visual(over: Partial<VisualDNA> = {}): VisualDNA {
  return {
    hero: { viewportOccupation: 80, imageRatio: "landscape", imagePosition: "right", textAlignment: "left", headlineWordCount: 6, hasOverlay: false, layering: "flat", compositionType: "split", ctaCount: 2, ctaPlacement: "below-headline", visualWeight: "balanced" },
    typography: { headingFont: "Inter", bodyFont: "Inter", accentFont: null, editorialScale: "modern", headingWeight: 560, uppercaseUsage: "none", trackingTight: true, fontHierarchyDepth: 4, textDensity: "moderate" },
    layout: { containerWidth: 1200, columnCount: 3, asymmetry: false, sectionCount: 6, spacingScale: "generous", verticalSpacing: 96, alignmentPhilosophy: "left-aligned", overlapPatterns: false, sectionRhythm: [] },
    image: { dominantAspectRatio: "landscape", fullscreenUsage: false, galleryRhythm: "single", backgroundTreatment: "none", imageCount: 3, heroImagePresent: true, portfolioStyle: "cards" },
    component: { cardRadius: 12, cardBorder: "hairline", cardShadow: "subtle", iconStyle: "line", ctaStyle: "pill", ctaCount: 2, badgeLanguage: "pill", dividerUsage: false },
    motion: { animationIntensity: 3, entranceAnimations: ["blur-fade"], scrollAnimations: true, parallaxDetected: false, hoverBehavior: ["glow"], interactionPhilosophy: "cinematic", staggerDetected: false, transitionDuration: 400 },
    brand: { luxuryScore: 55, modernityScore: 95, editorialScore: 45, minimalismScore: 80, visualDensity: "moderate", premiumScore: 85, emotionalDirection: "cool", personality: [], surfaceColor: "#08090a", inkColor: "#f7f8f8", accentColor: "#5e6ad2", isDark: true },
    ...over,
  };
}

const LINEAR_LIKE = visual(); // dark-tech SaaS

const NOMA_LIKE = visual({
  hero: { viewportOccupation: 100, imageRatio: "portrait", imagePosition: "behind", textAlignment: "center", headlineWordCount: 3, hasOverlay: true, layering: "flat", compositionType: "editorial", ctaCount: 1, ctaPlacement: "bottom", visualWeight: "balanced" },
  typography: { headingFont: "Serif", bodyFont: "Inter", accentFont: null, editorialScale: "editorial", headingWeight: 400, uppercaseUsage: "nav-only", trackingTight: false, fontHierarchyDepth: 4, textDensity: "sparse" },
  layout: { containerWidth: 1200, columnCount: 2, asymmetry: false, sectionCount: 5, spacingScale: "editorial", verticalSpacing: 160, alignmentPhilosophy: "centered", overlapPatterns: false, sectionRhythm: [] },
  brand: { luxuryScore: 90, modernityScore: 60, editorialScore: 90, minimalismScore: 85, visualDensity: "sparse", premiumScore: 92, emotionalDirection: "neutral", personality: [], surfaceColor: "#f7f5f0", inkColor: "#1a1a1a", accentColor: "#1a1a1a", isDark: false },
});

describe("enriched library — premium coverage without uniformity", () => {
  it("a dark-tech SaaS matches the dark-tech reference (not Archform)", () => {
    const p = findClosestReferences(LINEAR_LIKE, ENRICHED_REFERENCE_DB);
    expect(p.references[0].reference.id).toBe("ref-linear");
    expect(p.strongestMatch).toBeGreaterThanOrEqual(0.6);
  });

  it("a luxury editorial site matches the luxury editorial reference", () => {
    const p = findClosestReferences(NOMA_LIKE, ENRICHED_REFERENCE_DB);
    expect(p.references[0].reference.id).toBe("ref-noma");
    expect(p.strongestMatch).toBeGreaterThanOrEqual(0.6);
  });

  it("different design languages resolve to different references (diversity)", () => {
    const a = findClosestReferences(LINEAR_LIKE, ENRICHED_REFERENCE_DB).references[0].reference.id;
    const b = findClosestReferences(NOMA_LIKE, ENRICHED_REFERENCE_DB).references[0].reference.id;
    expect(a).not.toBe(b);
  });
});
