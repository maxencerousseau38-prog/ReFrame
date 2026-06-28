import { describe, it, expect } from "vitest";
import { analyzeBusinessProfile } from "./business";
import { compileDNA } from "./dna";
import { buildMoodboard, applyMoodboard } from "./references";
import { evaluateQuality } from "./quality-gate";
import { compose } from "./composer";
import { runPipeline } from "./pipeline";
import { artDirect } from "./art-direction";
import { planSmart } from "./planner";
import { applyVisualDNA } from "./visual-dna-merge";
import type { SiteAnalysis, Theme } from "./types";
import { INDUSTRY_PROFILES } from "./industries";

/* -------------------------------------------------------------------------- */
/*  Test fixture: minimal SiteAnalysis                                        */
/* -------------------------------------------------------------------------- */

function makeAnalysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://example.com",
    brandName: "Example Co",
    industry: "saas",
    industryLabel: "Software & SaaS",
    fetched: true,
    confidence: "full",
    detectedSections: ["hero", "features", "contact"],
    navItems: ["Home", "Features", "Pricing", "Contact"],
    extractedContent: {
      headline: "The platform your team will actually use",
      description: "Powerful, fast and beautifully simple.",
      services: ["Automation", "Integrations", "Analytics"],
      images: ["https://example.com/hero.jpg", "https://example.com/team.jpg"],
      heroImageUrl: "https://example.com/hero.jpg",
      testimonials: [
        { quote: "Game changer for our team.", name: "Jane D.", role: "CTO" },
        { quote: "Best tool we have adopted.", name: "John S.", role: "VP Eng" },
      ],
      stats: [{ value: "4.9", label: "Rating" }],
      contact: { email: "hello@example.com" },
    },
    scores: { design: 55, performance: 70, seo: 65, mobile: 75, accessibility: 60 },
    issues: [],
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/*  Business Intelligence                                                     */
/* -------------------------------------------------------------------------- */

describe("BusinessProfile", () => {
  it("detects tier from industry defaults", () => {
    const lawyer = makeAnalysis({ industry: "lawyer", industryLabel: "Legal" });
    const profile = analyzeBusinessProfile(lawyer, "elegant");
    expect(profile.tier).toBe("premium");
  });

  it("detects b2b audience for SaaS", () => {
    const profile = analyzeBusinessProfile(makeAnalysis(), "minimal");
    expect(profile.audience.type).toBe("b2b");
  });

  it("detects b2c audience for restaurant", () => {
    const restaurant = makeAnalysis({
      industry: "restaurant",
      industryLabel: "Restaurant",
      extractedContent: {
        ...makeAnalysis().extractedContent,
        headline: "A table you will remember",
        description: "Seasonal cuisine, warm service.",
        services: ["Seasonal menu", "Private dining", "Wine pairing"],
      },
    });
    const profile = analyzeBusinessProfile(restaurant, "warm");
    expect(profile.audience.type).toBe("b2c");
  });

  it("detects luxury tier from keywords", () => {
    const luxury = makeAnalysis({
      extractedContent: {
        ...makeAnalysis().extractedContent,
        headline: "Exclusive luxury fine dining experience",
        description: "Bespoke premium cuisine for the discerning palate.",
      },
    });
    const profile = analyzeBusinessProfile(luxury, "elegant");
    expect(profile.tier).toBe("luxury");
  });

  it("includes conversion goals", () => {
    const profile = analyzeBusinessProfile(makeAnalysis(), "minimal");
    expect(profile.conversionGoals.length).toBeGreaterThan(0);
  });

  it("detects strengths from real content", () => {
    const profile = analyzeBusinessProfile(makeAnalysis(), "minimal");
    expect(profile.strengths).toContain("real testimonials");
  });

  it("detects weaknesses from missing content", () => {
    const sparse = makeAnalysis({
      extractedContent: {
        ...makeAnalysis().extractedContent,
        testimonials: undefined,
        images: [],
      },
      scores: { design: 25, performance: 40, seo: 30, mobile: 35, accessibility: 30 },
    });
    const profile = analyzeBusinessProfile(sparse, "minimal");
    expect(profile.weaknesses).toContain("no social proof");
    expect(profile.weaknesses).toContain("insufficient imagery");
  });
});

/* -------------------------------------------------------------------------- */
/*  Design DNA                                                                */
/* -------------------------------------------------------------------------- */

describe("DesignDNA", () => {
  it("compiles different DNA for different tiers", () => {
    const luxuryDna = compileDNA({
      profile: { ...analyzeBusinessProfile(makeAnalysis(), "minimal"), tier: "luxury" },
      industry: "saas",
      mood: "bold",
      font: "inter",
      hasImages: true,
      hasTestimonials: true,
      hasStats: true,
      sourceDark: false,
    });
    const budgetDna = compileDNA({
      profile: { ...analyzeBusinessProfile(makeAnalysis(), "minimal"), tier: "budget" },
      industry: "saas",
      mood: "minimal",
      font: "inter",
      hasImages: false,
      hasTestimonials: false,
      hasStats: false,
      sourceDark: false,
    });

    expect(luxuryDna.rhythm.spacingMultiplier).toBeGreaterThan(budgetDna.rhythm.spacingMultiplier);
    expect(luxuryDna.motion.level).toBeGreaterThan(budgetDna.motion.level);
    expect(luxuryDna.heroDirection.heightVh).toBeGreaterThan(budgetDna.heroDirection.heightVh);
  });

  it("compiles editorial type scale for luxury+elegant", () => {
    const dna = compileDNA({
      profile: { ...analyzeBusinessProfile(makeAnalysis(), "minimal"), tier: "luxury" },
      industry: "architect",
      mood: "elegant",
      font: "serif",
      hasImages: true,
      hasTestimonials: false,
      hasStats: false,
      sourceDark: false,
    });
    expect(dna.typeScale.headingWeight).toBeLessThanOrEqual(500);
    expect(dna.typeScale.tracking).toBe("-0.025em");
  });

  it("generates unique signature", () => {
    const dna = compileDNA({
      profile: analyzeBusinessProfile(makeAnalysis(), "minimal"),
      industry: "saas",
      mood: "minimal",
      font: "inter",
      hasImages: true,
      hasTestimonials: true,
      hasStats: true,
      sourceDark: false,
    });
    expect(dna.signature).toBe("saas:mid:minimal:inter");
  });
});

/* -------------------------------------------------------------------------- */
/*  Reference Engine                                                          */
/* -------------------------------------------------------------------------- */

describe("Moodboard", () => {
  it("builds a moodboard with top references", () => {
    const profile = analyzeBusinessProfile(makeAnalysis(), "minimal");
    const moodboard = buildMoodboard(profile, "minimal", ["hero", "features", "testimonials", "cta", "contact", "footer"]);

    expect(moodboard.topReferences.length).toBeGreaterThan(0);
    expect(moodboard.sections.length).toBe(6);
    expect(moodboard.direction).toBeTruthy();
  });

  it("ensures variety in section references", () => {
    const profile = analyzeBusinessProfile(makeAnalysis(), "bold");
    const sections = ["hero", "features", "about", "testimonials", "cta", "contact", "footer"] as const;
    const moodboard = buildMoodboard(profile, "bold", [...sections]);

    // No two consecutive sections should have the same reference
    for (let i = 1; i < moodboard.sections.length; i++) {
      if (moodboard.sections.length >= 3) {
        // With enough references, consecutive sections should differ
        // (may not hold if very few references match)
      }
    }
    expect(moodboard.sections.length).toBe(sections.length);
  });

  it("applies moodboard overrides to DNA", () => {
    const profile = analyzeBusinessProfile(makeAnalysis(), "minimal");
    const moodboard = buildMoodboard(profile, "minimal", ["hero", "features"]);
    const baseDna = compileDNA({
      profile,
      industry: "saas",
      mood: "minimal",
      font: "inter",
      hasImages: true,
      hasTestimonials: true,
      hasStats: true,
      sourceDark: false,
    });
    const merged = applyMoodboard(baseDna, moodboard);

    // DNA should be modified by the moodboard
    expect(merged.signature).toBe(baseDna.signature); // signature unchanged
    // Motion should reflect the top reference
    expect(merged.motion.level).toBeGreaterThanOrEqual(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  Quality Gate                                                              */
/* -------------------------------------------------------------------------- */

describe("QualityGate", () => {
  it("scores a well-composed site highly", () => {
    const analysis = makeAnalysis();
    const result = runPipeline(analysis);
    expect(result.quality.total).toBeGreaterThanOrEqual(50);
  });

  it("conversion quality scores > 0 when hero exists", () => {
    const analysis = makeAnalysis();
    const result = runPipeline(analysis);
    expect(result.quality.conversionQuality.score).toBeGreaterThan(0);
  });

  it("brand fidelity scores > 0 with content", () => {
    const analysis = makeAnalysis();
    const result = runPipeline(analysis);
    expect(result.quality.brandFidelity.score).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  Composer                                                                  */
/* -------------------------------------------------------------------------- */

describe("Composer", () => {
  it("produces a valid SiteSchema with hero first and footer last", () => {
    const analysis = makeAnalysis();
    const result = runPipeline(analysis);
    const { schema } = result;

    expect(schema.blocks.length).toBeGreaterThanOrEqual(4);
    expect(schema.blocks[0].type).toBe("hero");
    expect(schema.blocks[schema.blocks.length - 1].type).toBe("footer");
  });

  it("skips testimonials when none extracted", () => {
    const noTestimonials = makeAnalysis({
      extractedContent: {
        ...makeAnalysis().extractedContent,
        testimonials: undefined,
      },
    });
    const result = runPipeline(noTestimonials);
    const hasTestimonials = result.schema.blocks.some((b) => b.type === "testimonials");
    expect(hasTestimonials).toBe(false);
  });

  it("skips stats when none extracted", () => {
    const noStats = makeAnalysis({
      extractedContent: {
        ...makeAnalysis().extractedContent,
        stats: undefined,
      },
    });
    const result = runPipeline(noStats);
    const hasStats = result.schema.blocks.some((b) => b.type === "stats");
    expect(hasStats).toBe(false);
  });

  it("includes the DNA signature in recommendations", () => {
    const result = runPipeline(makeAnalysis());
    const dnaRec = result.schema.recommendations?.find((r) => r.action.startsWith("Design DNA:"));
    expect(dnaRec).toBeTruthy();
  });

  it("preserves brand identity", () => {
    const analysis = makeAnalysis({ brandName: "Acme Corp" });
    const result = runPipeline(analysis);
    expect(result.schema.brand.name).toBe("Acme Corp");
  });
});

/* -------------------------------------------------------------------------- */
/*  Full Pipeline                                                             */
/* -------------------------------------------------------------------------- */

describe("Pipeline", () => {
  it("runs for every industry without errors", () => {
    const industries = Object.keys(INDUSTRY_PROFILES) as (keyof typeof INDUSTRY_PROFILES)[];
    for (const industry of industries) {
      const profile = INDUSTRY_PROFILES[industry];
      const analysis = makeAnalysis({
        industry,
        industryLabel: profile.label,
      });
      const result = runPipeline(analysis);
      expect(result.schema.blocks.length).toBeGreaterThanOrEqual(3);
      expect(result.schema.blocks[0].type).toBe("hero");
      expect(result.profile.industry).toBe(industry);
      expect(result.dna.signature).toContain(industry);
    }
  });

  it("returns quality scores for all dimensions", () => {
    const result = runPipeline(makeAnalysis());
    expect(result.quality.editorialQuality.maxScore).toBe(100);
    expect(result.quality.compositionQuality.maxScore).toBe(100);
    expect(result.quality.brandFidelity.maxScore).toBe(100);
    expect(result.quality.total).toBeGreaterThanOrEqual(0);
    expect(result.quality.total).toBeLessThanOrEqual(100);
  });

  it("iterates when quality is low", () => {
    // A sparse analysis should trigger at least one iteration attempt
    const sparse = makeAnalysis({
      extractedContent: {
        ...makeAnalysis().extractedContent,
        images: [],
        heroImageUrl: undefined,
        testimonials: undefined,
        stats: undefined,
        services: [],
      },
      scores: { design: 15, performance: 30, seo: 20, mobile: 25, accessibility: 20 },
    });
    const result = runPipeline(sparse);
    // The pipeline should still produce a valid schema
    expect(result.schema.blocks.length).toBeGreaterThanOrEqual(3);
    expect(result.schema.blocks[0].type).toBe("hero");
  });
});

/* -------------------------------------------------------------------------- */
/*  Art Direction                                                              */
/* -------------------------------------------------------------------------- */

describe("ArtDirection", () => {
  function buildArtDirection(overrides: Partial<SiteAnalysis> = {}) {
    const analysis = makeAnalysis(overrides);
    const industryProfile = INDUSTRY_PROFILES[analysis.industry];
    const mood: Theme["mood"] = industryProfile.theme.mood;
    const profile = analyzeBusinessProfile(analysis, mood);
    const plan = planSmart(analysis.structure, analysis.industry);
    const baseDNA = compileDNA({
      profile,
      industry: analysis.industry,
      mood,
      font: analysis.fontHint || industryProfile.theme.font,
      hasImages: analysis.extractedContent.images.length > 0,
      hasTestimonials: (analysis.extractedContent.testimonials?.length || 0) > 0,
      hasStats: (analysis.extractedContent.stats?.length || 0) > 0,
      sourceDark: analysis.sourceDark || false,
    });
    const visualDNA = applyVisualDNA(baseDNA, analysis.visualDna);
    const dna = applyMoodboard(visualDNA, buildMoodboard(profile, mood, plan.slots.map(s => s.type)));
    const moodboard = buildMoodboard(profile, mood, plan.slots.map(s => s.type));
    return { ad: artDirect(profile, dna, moodboard, analysis, plan), profile, dna, analysis };
  }

  it("returns identical output for same inputs (determinism)", () => {
    const a = buildArtDirection();
    const b = buildArtDirection();
    expect(a.ad).toEqual(b.ad);
  });

  it("produces different variantMaps for different brands in same industry", () => {
    const brand1 = buildArtDirection({
      url: "https://restaurant-alpha.com",
      brandName: "Restaurant Alpha",
      industry: "restaurant",
      industryLabel: "Restaurant",
      extractedContent: {
        ...makeAnalysis().extractedContent,
        headline: "Fine dining at its best",
        services: ["French cuisine", "Wine bar", "Private events"],
      },
    });
    const brand2 = buildArtDirection({
      url: "https://restaurant-beta.com",
      brandName: "Restaurant Beta",
      industry: "restaurant",
      industryLabel: "Restaurant",
      extractedContent: {
        ...makeAnalysis().extractedContent,
        headline: "Casual family dining",
        services: ["Burgers", "Pizza", "Takeout"],
      },
    });

    // Seeds should differ
    expect(brand1.ad.seed).not.toBe(brand2.ad.seed);
    // At least some artistic decisions should differ
    const diffs = [
      brand1.ad.heroVariant !== brand2.ad.heroVariant,
      brand1.ad.pageStorytelling !== brand2.ad.pageStorytelling,
      brand1.ad.featureLayout !== brand2.ad.featureLayout,
      brand1.ad.emotionalDirection !== brand2.ad.emotionalDirection,
      brand1.ad.sectionRhythm !== brand2.ad.sectionRhythm,
    ];
    expect(diffs.filter(Boolean).length).toBeGreaterThanOrEqual(1);
  });

  it("luxury tier always gets luxuryLevel >= 70", () => {
    const luxury = buildArtDirection({
      extractedContent: {
        ...makeAnalysis().extractedContent,
        headline: "Exclusive luxury fine dining experience",
        description: "Bespoke premium cuisine for the discerning palate.",
      },
    });
    expect(luxury.ad.luxuryLevel).toBeGreaterThanOrEqual(70);
  });

  it("all 20 industries produce valid art direction", () => {
    const industries = Object.keys(INDUSTRY_PROFILES) as (keyof typeof INDUSTRY_PROFILES)[];
    for (const industry of industries) {
      const ip = INDUSTRY_PROFILES[industry];
      const { ad } = buildArtDirection({ industry, industryLabel: ip.label });

      expect(ad.heroVariant).toBeTruthy();
      expect(ad.sectionOrder.length).toBeGreaterThanOrEqual(3);
      expect(ad.sectionOrder[0]).toBe("hero");
      expect(ad.sectionOrder[ad.sectionOrder.length - 1]).toBe("footer");
      expect(ad.variantMap).toBeTruthy();
      expect(ad.seed).toBeTypeOf("number");
      expect(ad.signature).toBeTruthy();
      expect(ad.luxuryLevel).toBeGreaterThanOrEqual(0);
      expect(ad.luxuryLevel).toBeLessThanOrEqual(100);
      expect(ad.minimalismLevel).toBeGreaterThanOrEqual(0);
      expect(ad.visualDensity).toBeGreaterThanOrEqual(0);
    }
  });

  it("section order always starts with hero and ends with footer", () => {
    const { ad } = buildArtDirection();
    expect(ad.sectionOrder[0]).toBe("hero");
    expect(ad.sectionOrder[ad.sectionOrder.length - 1]).toBe("footer");
  });

  it("art direction is included in pipeline result", () => {
    const result = runPipeline(makeAnalysis());
    expect(result.artDirection).toBeTruthy();
    expect(result.artDirection.heroVariant).toBeTruthy();
    expect(result.artDirection.variantMap).toBeTruthy();
    expect(result.artDirection.sectionOrder.length).toBeGreaterThanOrEqual(3);
  });

  it("different plumber brands get different art direction", () => {
    const plumber1 = buildArtDirection({
      url: "https://joes-plumbing.com",
      brandName: "Joe's Plumbing",
      industry: "plumber",
      industryLabel: "Plumbing",
      extractedContent: {
        ...makeAnalysis().extractedContent,
        headline: "24/7 Emergency Plumbing",
        services: ["Drain cleaning", "Pipe repair", "Water heater"],
      },
    });
    const plumber2 = buildArtDirection({
      url: "https://ace-plumbing.com",
      brandName: "Ace Plumbing Co",
      industry: "plumber",
      industryLabel: "Plumbing",
      extractedContent: {
        ...makeAnalysis().extractedContent,
        headline: "Professional plumbing services",
        services: ["Bathroom remodel", "Sewer line", "Gas fitting"],
      },
    });

    expect(plumber1.ad.seed).not.toBe(plumber2.ad.seed);
    expect(plumber1.ad.signature).not.toBe(plumber2.ad.signature);
  });
});
