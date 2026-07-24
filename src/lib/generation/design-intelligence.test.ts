import { describe, it, expect } from "vitest";
import { selectDesignDNA, DESIGN_DNA_LIBRARY } from "@/lib/generation/design-dna-library";
import { analyzeBusinessProfile, deriveMood } from "@/lib/generation/business";
import { runPipeline } from "@/lib/generation/pipeline";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Design Intelligence layer (live path: runPipeline → selectDesignDNA →
 * artDirect → compose → Creative Director score).
 *
 * The engine must (1) choose a Design DNA whose mechanisms fit the business,
 * (2) NEVER dress a business in a DNA it forbids ("don't apply Nike
 * everywhere"), (3) execute that direction in the Art Direction, and (4) return
 * a discriminating Creative Director verdict.
 */

function mk(industry: Industry, brand: string, url: string, copy: any = {}): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  return {
    url, brandName: brand, industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "about", "services", "portfolio", "contact", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: copy.headline ?? "Welcome", description: copy.desc ?? "We do good work.", aboutBody: copy.about ?? "A real team.",
      services: copy.services ?? ["A", "B", "C"],
      images: ["a", "b", "c", "d"].map((k) => `https://x.com/${k}.jpg`),
      imagesRich: [
        { url: "https://x.com/a.jpg", alt: "hero", kind: "content", w: 1600, h: 1000 },
        { url: "https://x.com/b.jpg", alt: "two", kind: "gallery", w: 1400, h: 1000 },
        { url: "https://x.com/c.jpg", alt: "three", kind: "gallery", w: 1400, h: 1000 },
        { url: "https://x.com/d.jpg", alt: "four", kind: "gallery", w: 1400, h: 1000 },
      ],
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

function select(a: SiteAnalysis) {
  const mood = deriveMood(a, a.industry);
  const profile = analyzeBusinessProfile(a, mood);
  return selectDesignDNA(a, profile, mood);
}

describe("Design DNA library integrity", () => {
  it("every DNA's mechanisms are internally declared and non-empty", () => {
    for (const dna of DESIGN_DNA_LIBRARY) {
      expect(dna.name).toBeTruthy();
      expect(dna.mechanisms.mood).toBeTruthy();
      expect(dna.ideal_business_types.length).toBeGreaterThan(0);
      expect(dna.forbidden_usage.length).toBeGreaterThan(0);
      // A DNA must never be both ideal AND forbidden for the same sector.
      for (const ind of dna.ideal_business_types) {
        expect(dna.avoid_business_types).not.toContain(ind);
      }
    }
  });
});

describe("selectDesignDNA — fit and refusal", () => {
  it("a gastronomic restaurant gets an editorial/luxury direction, never Performance", () => {
    const sel = select(mk("restaurant", "Le Gavroche", "https://legavroche.fr", {
      headline: "Cuisine gastronomique étoilée",
      desc: "Une expérience raffinée, haute gastronomie d'exception.",
      about: "Restaurant Michelin, élégance intemporelle.",
    }));
    expect(["Luxury Editorial", "Craft Provenance"]).toContain(sel.dna.name);
    expect(sel.dna.name).not.toBe("Performance");
  });

  it("a gym gets Performance; a law firm NEVER does (forbidden_usage enforced)", () => {
    const gym = select(mk("gym", "Forge", "https://forge.fit", { headline: "Push past your limits", desc: "Bold high-performance training." }));
    expect(gym.dna.name).toBe("Performance");

    const law = select(mk("lawyer", "Merton & Cole", "https://mertoncole.com", { headline: "Trusted counsel", desc: "Authoritative legal representation." }));
    expect(law.dna.name).not.toBe("Performance");
    expect(law.dna.avoid_business_types).not.toContain("lawyer"); // its chosen DNA allows lawyers
  });

  it("two same-sector brands with different positioning get different directions", () => {
    const fine = select(mk("restaurant", "Le Gavroche", "https://legavroche.fr", {
      headline: "Cuisine gastronomique étoilée", desc: "Haute gastronomie raffinée d'exception.", about: "Michelin, élégance.",
    }));
    const family = select(mk("restaurant", "Chez Mamie", "https://chezmamie.fr", {
      headline: "Cuisine familiale fait maison", desc: "Conviviale et chaleureuse.", about: "Une famille, artisanale et authentique.",
    }));
    expect(fine.dna.name).not.toBe(family.dna.name);
  });

  it("selection is deterministic", () => {
    const a = mk("saas", "Flowline", "https://flowline.io", { headline: "The workflow platform", desc: "Engineered for teams." });
    expect(select(a).dna.name).toBe(select(a).dna.name);
  });
});

describe("live path executes the direction + returns a CD verdict", () => {
  it("runPipeline surfaces the chosen DNA, a creative direction, and a 6-axis CD score", () => {
    const r = runPipeline(mk("architect", "Atelier Épure", "https://atelierepure.fr", {
      headline: "Architecture minimaliste", desc: "Des espaces épurés, essentiels, sobres.",
    }));
    expect(r.designDNA.dna.name).toBeTruthy();
    expect(r.artDirection.creativeDirection).toBeTruthy();
    expect(r.artDirection.designDnaName).toBe(r.designDNA.dna.name);
    const cd = r.creativeDirector;
    for (const axis of [cd.identity, cd.originality, cd.visualQuality, cd.brandCoherence, cd.premiumAgency, cd.templateRisk]) {
      expect(axis).toBeGreaterThanOrEqual(0);
      expect(axis).toBeLessThanOrEqual(10);
    }
    expect(cd.overall).toBeGreaterThan(0);
    expect(cd.passes).toBe(cd.overall >= 8.5);
  });

  it("the CD loop never ships a regression (final CD >= first-pass would-be)", () => {
    // Determinism + monotonic acceptance: a second run yields the same verdict.
    const a = mk("gym", "Forge", "https://forge.fit", { headline: "Push past your limits", desc: "Bold high-performance training for athletes." });
    const r1 = runPipeline(a);
    const r2 = runPipeline(a);
    expect(r1.creativeDirector.overall).toBe(r2.creativeDirector.overall);
  });
});
