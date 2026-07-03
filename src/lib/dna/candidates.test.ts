import { describe, it, expect } from "vitest";
import type { VisualDNA } from "@/lib/extraction/types";
import type { SiteAnalysis } from "@/lib/generation/types";
import { runPipeline } from "@/lib/generation/pipeline";
import { visualDnaPartial, measuredLayer, curatedLayer } from "./candidates";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

function makeVisualDna(overrides: Partial<VisualDNA> = {}): VisualDNA {
  return {
    hero: {
      viewportOccupation: 92,
      imageRatio: "landscape",
      imagePosition: "behind",
      textAlignment: "left",
      headlineWordCount: 5,
      hasOverlay: true,
      layering: "flat",
      compositionType: "fullbleed",
      ctaCount: 1,
      ctaPlacement: "below-headline",
      visualWeight: "image-heavy",
    },
    typography: {
      headingFont: "Inter Display",
      bodyFont: "Inter",
      accentFont: null,
      editorialScale: "editorial",
      headingWeight: 600,
      uppercaseUsage: "nav-only",
      trackingTight: true,
      fontHierarchyDepth: 3,
      textDensity: "sparse",
    },
    layout: {
      containerWidth: 1240,
      columnCount: 2,
      asymmetry: true,
      sectionCount: 6,
      spacingScale: "editorial",
      verticalSpacing: 128,
      alignmentPhilosophy: "left-aligned",
      overlapPatterns: false,
      sectionRhythm: [],
    },
    image: {
      dominantAspectRatio: "landscape",
      fullscreenUsage: true,
      galleryRhythm: "editorial",
      backgroundTreatment: "overlay",
      imageCount: 8,
      heroImagePresent: true,
      portfolioStyle: "fullbleed",
    },
    component: {
      cardRadius: 0,
      cardBorder: "none",
      cardShadow: "none",
      iconStyle: null,
      ctaStyle: "sharp",
      ctaCount: 2,
      badgeLanguage: "none",
      dividerUsage: true,
    },
    motion: {
      animationIntensity: 3,
      entranceAnimations: ["reveal"],
      scrollAnimations: true,
      parallaxDetected: true,
      hoverBehavior: ["scale"],
      interactionPhilosophy: "cinematic",
      staggerDetected: true,
      transitionDuration: 500,
    },
    brand: {
      luxuryScore: 80,
      modernityScore: 60,
      editorialScore: 85,
      minimalismScore: 75,
      visualDensity: "sparse",
      premiumScore: 85,
      emotionalDirection: "cool",
      personality: ["refined"],
      surfaceColor: "#faf6f2",
      inkColor: "#1c1310",
      accentColor: "#b4552d",
      isDark: false,
    },
    ...overrides,
  };
}

function makeAnalysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://atelier-lumiere.example",
    brandName: "Atelier Lumière",
    industry: "architect",
    industryLabel: "Architecture",
    fetched: true,
    confidence: "full",
    detectedSections: ["hero", "portfolio", "contact"],
    navItems: ["Studio", "Projets", "Contact"],
    extractedContent: {
      headline: "Espaces qui respirent",
      description: "Architecture contemporaine en matériaux bruts.",
      services: ["Résidentiel", "Tertiaire", "Scénographie"],
      images: ["https://x/1.jpg", "https://x/2.jpg"],
      heroImageUrl: "https://x/1.jpg",
      contact: { email: "studio@atelier.example" },
    },
    scores: { design: 60, performance: 70, seo: 65, mobile: 75, accessibility: 60 },
    issues: [],
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/*  visualDnaPartial — only measured fields are offered                       */
/* -------------------------------------------------------------------------- */

describe("visualDnaPartial", () => {
  it("offers only what was measured; unmapped/absent values stay undefined", () => {
    const partial = visualDnaPartial(
      makeVisualDna({
        hero: { ...makeVisualDna().hero, viewportOccupation: 0, ctaCount: 0, compositionType: "split" },
        layout: { ...makeVisualDna().layout, containerWidth: null, verticalSpacing: null },
        typography: { ...makeVisualDna().typography, headingWeight: null, trackingTight: false },
        motion: { ...makeVisualDna().motion, entranceAnimations: [], transitionDuration: null, parallaxDetected: false, scrollAnimations: false },
      })
    );

    expect(partial.heroDirection?.heightVh).toBeUndefined();
    expect(partial.heroDirection?.ctaCount).toBeUndefined();
    expect(partial.heroDirection?.style).toBe("split");
    expect(partial.contentMaxWidth).toBeUndefined();
    expect(partial.rhythm?.spacingMultiplier).toBeUndefined();
    expect(partial.typeScale?.headingWeight).toBeUndefined();
    expect(partial.typeScale?.tracking).toBeUndefined();
    expect(partial.motion?.entranceType).toBeUndefined();
    expect(partial.motion?.duration).toBeUndefined();
    expect(partial.motion?.scrollBehavior).toBeUndefined();
  });

  it("maps measured values faithfully (port of visual-dna-merge)", () => {
    const partial = visualDnaPartial(makeVisualDna());
    expect(partial.heroDirection).toMatchObject({
      style: "fullbleed",
      heightVh: 92,
      hasParallax: true,
      hasOverlay: true,
      imagePosition: "behind",
      ctaCount: 1,
    });
    expect(partial.rhythm).toMatchObject({ density: "editorial", spacingMultiplier: 2, hasDividers: true });
    expect(partial.typeScale).toMatchObject({ headingWeight: 600, tracking: "-0.025em" });
    expect(partial.cardSystem).toMatchObject({ radius: "0px", style: "editorial", shadow: "none" });
    expect(partial.motion).toMatchObject({ level: 3, entranceType: "reveal", scrollBehavior: "parallax", duration: 0.5 });
    expect(partial.ctaDirection).toMatchObject({ style: "sharp" });
    expect(partial.galleryDirection).toMatchObject({ style: "editorial", aspectRatio: "landscape" });
    expect(partial.colorStrategy).toMatchObject({ preferDark: false, mode: "accent-rare" });
    expect(partial.contentMaxWidth).toBe("1240px");
  });
});

/* -------------------------------------------------------------------------- */
/*  runPipeline integration — the audit's root cause #2, killed               */
/* -------------------------------------------------------------------------- */

describe("runPipeline with measurements (I1 end to end)", () => {
  it("measured hero geometry SURVIVES the moodboard (old applyMoodboard clobbered it)", () => {
    const withMeasures = runPipeline(makeAnalysis({ visualDna: makeVisualDna() }));

    // These exact fields were overwritten wholesale by computeDnaOverrides in V5.
    expect(withMeasures.dna.heroDirection.heightVh).toBe(92);
    expect(withMeasures.dna.heroDirection.imagePosition).toBe("behind");
    expect(withMeasures.dna.heroDirection.style).toBe("fullbleed");
    expect(withMeasures.dna.motion.level).toBe(3);
    expect(withMeasures.dna.contentMaxWidth).toBe("1240px");
    expect(withMeasures.dna.signature).toContain("+vdna");
  });

  it("without measurements the moodboard still fills its fields (value-compatible with V5)", () => {
    const result = runPipeline(makeAnalysis());
    expect(result.dna.signature).not.toContain("+vdna");
    // Curated hero direction comes from the top reference, complete.
    expect(result.moodboard.dnaOverrides.heroDirection?.style).toBe(result.dna.heroDirection.style);
  });

  it("exposes the full provenance trace in the pipeline result", () => {
    const result = runPipeline(makeAnalysis({ visualDna: makeVisualDna() }));
    expect(result.trace.length).toBeGreaterThan(20);

    const height = result.trace.find((t) => t.field === "heroDirection.heightVh")!;
    expect(height.chosen.source).toBe("measured");
    expect(height.chosen.origin).toContain("visual-dna");
    expect(height.rejected.some((r) => r.source === "curated" || r.source === "preset")).toBe(true);
    expect(height.reason.length).toBeGreaterThan(0);
  });

  it("pipeline stays deterministic with the resolver in place", () => {
    const a = runPipeline(makeAnalysis({ visualDna: makeVisualDna() }));
    const b = runPipeline(makeAnalysis({ visualDna: makeVisualDna() }));
    expect(a.dna).toEqual(b.dna);
    expect(a.trace).toEqual(b.trace);
  });
});

/* -------------------------------------------------------------------------- */
/*  Layer builders                                                            */
/* -------------------------------------------------------------------------- */

describe("layer builders", () => {
  it("measuredLayer is absent without VisualDNA (nothing invented)", () => {
    expect(measuredLayer(undefined)).toBeUndefined();
    expect(measuredLayer(makeVisualDna())).toMatchObject({ source: "measured" });
  });

  it("curatedLayer carries the top reference id in its origin (traceability)", () => {
    const result = runPipeline(makeAnalysis());
    const layer = curatedLayer(result.moodboard);
    expect(layer).toBeDefined();
    expect(layer!.source).toBe("curated");
    expect(layer!.origin).toContain("computeDnaOverrides");
  });
});
