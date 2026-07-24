import { describe, it, expect } from "vitest";
import { deriveBrandPersonality } from "@/lib/generation/brand-personality";
import { deriveMood, analyzeBusinessProfile } from "@/lib/generation/business";
import { runPipeline } from "@/lib/generation/pipeline";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Brand Personality Engine (live path: runPipeline → deriveBrandPersonality →
 * selectDesignDNA → artDirect → compose).
 *
 * Two businesses in the SAME sector must no longer produce similar sites: the
 * engine reads temperament from the content and steers the whole generation, so
 * a serene, ceremonial restaurant and a raw, kinetic one become different worlds
 * — recognisable before a word is read.
 */

function mk(industry: Industry, brand: string, url: string, copy: any): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const imgs = ["a", "b", "c", "d", "e"].map((k) => `https://x.com/${k}.jpg`);
  return {
    url, brandName: brand, industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "about", "services", "portfolio", "testimonials", "contact", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: copy.headline, description: copy.desc, aboutBody: copy.about, services: copy.services ?? ["A", "B", "C"],
      testimonials: [{ quote: "Great.", name: "X", role: "Guest" }],
      images: imgs, imagesRich: imgs.map((url, i) => ({ url, alt: "photo", kind: i === 0 ? "content" : "gallery", w: 1500, h: 1000 })),
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

const SERENE = mk("restaurant", "Le Gavroche", "https://legavroche.fr", {
  headline: "Cuisine gastronomique étoilée",
  desc: "Une expérience raffinée, calme et cérémoniale. Haute gastronomie d'exception, un moment suspendu.",
  about: "Restaurant Michelin, élégance intemporelle, service contemplatif.",
});
const FIERCE = mk("restaurant", "Brut", "https://brut-resto.fr", {
  headline: "Neo-bistrot brut et industriel",
  desc: "Une cuisine brute, audacieuse, énergique. Un lieu vibrant, contrasté, sans compromis.",
  about: "Brut, moderne, dynamique — une carte punchy qui bouge vite.",
});

function personaOf(a: SiteAnalysis) {
  const mood = deriveMood(a, a.industry);
  return deriveBrandPersonality(a, analyzeBusinessProfile(a, mood), mood);
}

describe("deriveBrandPersonality — temperament from the business", () => {
  it("a serene gastronomic brand and a raw energetic one read as opposite temperaments", () => {
    const serene = personaOf(SERENE);
    const fierce = personaOf(FIERCE);
    expect(serene.energy).toBeLessThan(fierce.energy);
    expect(serene.sophistication).toBeGreaterThan(fierce.sophistication);
    expect(fierce.boldness).toBeGreaterThan(serene.boldness);
    expect(serene.temperament).not.toBe(fierce.temperament);
    expect(serene.character).not.toBe(fierce.character);
  });

  it("is deterministic per brand", () => {
    expect(personaOf(SERENE).signature).toBe(personaOf(SERENE).signature);
  });

  it("derives from the business, not the sector: two restaurants differ sharply", () => {
    const a = personaOf(SERENE), b = personaOf(FIERCE);
    expect(Math.abs(a.energy - b.energy)).toBeGreaterThan(30);
  });
});

describe("personality steers the whole generation (live path)", () => {
  it("two same-sector brands become different worlds across the art direction", () => {
    const r1 = runPipeline(SERENE);
    const r2 = runPipeline(FIERCE);

    // The personality is surfaced on the pipeline result and the art direction.
    expect(r1.personality.temperament).not.toBe(r2.personality.temperament);
    expect(r1.artDirection.personalityCharacter).toBe(r1.personality.character);

    // At least several art-direction axes must diverge — not just colour/type.
    const axes1 = [r1.designDNA.dna.name, r1.artDirection.sectionRhythm, r1.artDirection.motionPhilosophy, r1.artDirection.contrastStrategy, r1.artDirection.pageStorytelling, r1.artDirection.heroVariant];
    const axes2 = [r2.designDNA.dna.name, r2.artDirection.sectionRhythm, r2.artDirection.motionPhilosophy, r2.artDirection.contrastStrategy, r2.artDirection.pageStorytelling, r2.artDirection.heroVariant];
    const diffs = axes1.filter((v, i) => v !== axes2[i]).length;
    expect(diffs).toBeGreaterThanOrEqual(4);

    // The serene brand breathes more per section than the kinetic one.
    const avgPad = (r: typeof r1) => {
      const pads = r.schema.blocks.map((b) => (b.scene as any)?.paddingY?.topPx).filter((n: number) => typeof n === "number");
      return pads.length ? pads.reduce((a: number, b: number) => a + b, 0) / pads.length : 0;
    };
    expect(avgPad(r1)).toBeGreaterThan(avgPad(r2));
  });

  it("the personality is wired ahead of Design Intelligence (it biases DNA choice)", () => {
    // Both restaurants; different temperament → different DNA grammar.
    expect(runPipeline(SERENE).designDNA.dna.category).not.toBe(runPipeline(FIERCE).designDNA.dna.category);
  });
});
