import { describe, it, expect } from "vitest";
import { deriveMotionDirection } from "@/lib/generation/motion-design";
import { deriveBrandPersonality } from "@/lib/generation/brand-personality";
import { deriveMood, analyzeBusinessProfile } from "@/lib/generation/business";
import { runPipeline } from "@/lib/generation/pipeline";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Motion Design Intelligence — animation expresses the brand personality.
 * A serene brand (The Curator) moves slowly, softly, over short distances; a
 * fierce brand (The Challenger) moves fast, far, with force. The motion flows to
 * the production schema (schema.motion) and, via context, to the reveals.
 */

function mk(industry: Industry, brand: string, url: string, copy: any): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const imgs = ["a", "b", "c"].map((k) => `https://x.com/${k}.jpg`);
  return {
    url, brandName: brand, industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "about", "services", "contact", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: { headline: copy.headline, description: copy.desc, aboutBody: copy.about, services: ["A", "B", "C"], images: imgs, imagesRich: imgs.map((url, i) => ({ url, alt: "p", kind: i === 0 ? "content" : "gallery", w: 1500, h: 1000 })) },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

const SERENE = mk("restaurant", "Le Gavroche", "https://legavroche.fr", {
  headline: "Cuisine gastronomique étoilée", desc: "Raffinée, calme, cérémoniale. Haute gastronomie d'exception.", about: "Michelin, élégance intemporelle, contemplatif.",
});
const FIERCE = mk("restaurant", "Brut", "https://brut-resto.fr", {
  headline: "Neo-bistrot brut industriel", desc: "Brute, audacieuse, énergique, vibrante, sans compromis.", about: "Brut, dynamique, punchy, bouge vite.",
});
const personaOf = (a: SiteAnalysis) => { const m = deriveMood(a, a.industry); return deriveBrandPersonality(a, analyzeBusinessProfile(a, m), m); };

describe("deriveMotionDirection", () => {
  it("a serene brand moves slower, shorter and softer than a fierce one", () => {
    const serene = deriveMotionDirection(personaOf(SERENE), 3);
    const fierce = deriveMotionDirection(personaOf(FIERCE), 3);
    expect(serene.duration).toBeGreaterThan(fierce.duration);         // slower
    expect(serene.revealDistance).toBeLessThan(fierce.revealDistance); // shorter travel
    expect(serene.hoverLift).toBeLessThan(fierce.hoverLift);           // gentler hover
    expect(serene.stagger).toBeLessThan(fierce.stagger);
    expect(serene.intensity).toBe("subtle");
    expect(fierce.intensity).toBe("expressive");
    // Distinct easing curves — the FEEL differs, not just the speed.
    expect(serene.easeCss).not.toBe(fierce.easeCss);
  });

  it("motion level 0 disables motion entirely (respects the DNA ceiling)", () => {
    const m = deriveMotionDirection(personaOf(SERENE), 0);
    expect(m.intensity).toBe("none");
    expect(m.duration).toBe(0);
    expect(m.revealDistance).toBe(0);
  });

  it("is deterministic and bounded", () => {
    const a = deriveMotionDirection(personaOf(FIERCE), 3);
    const b = deriveMotionDirection(personaOf(FIERCE), 3);
    expect(a).toEqual(b);
    expect(a.duration).toBeGreaterThanOrEqual(0.34);
    expect(a.duration).toBeLessThanOrEqual(0.95);
    expect(a.hoverScale).toBeLessThanOrEqual(1.05);
  });
});

describe("motion reaches the production schema", () => {
  it("runPipeline attaches a personality-matched motion system to schema.motion", () => {
    const rs = runPipeline(SERENE);
    const rf = runPipeline(FIERCE);
    expect(rs.schema.motion).toBeDefined();
    expect(rf.schema.motion).toBeDefined();
    expect(rs.motion.duration).toBeGreaterThan(rf.motion.duration);
    // The pipeline result exposes it and the schema carries the same object.
    expect(rs.schema.motion?.duration).toBe(rs.motion.duration);
  });
});
