import { describe, it, expect } from "vitest";
import { runPipeline } from "@/lib/generation/pipeline";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Hero variety on the LIVE path (runPipeline → artDirect → compose).
 *
 * The hero is the first thing a visitor sees, so two same-sector brands opening
 * on the SAME hero is the single most recognizable "AI template" tell. The art
 * director used to (a) try hero styles in a fixed order — collapsing every
 * "immersive" brand onto the fullbleed group — and (b) pick with a bare FNV-1a
 * modulo whose weak low-bit avalanche mapped different brand seeds onto the same
 * index. Three restaurants all opened on the exact same hero. This guards the
 * fix: across a batch of same-sector brands the hero must genuinely diverge.
 */

function mk(industry: Industry, brand: string, url: string): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  return {
    url,
    brandName: brand,
    industry,
    industryLabel: p.label,
    fetched: true,
    confidence: "full",
    detectedSections: [],
    brand: { accentColor: p.theme.accent },
    navItems: ["Home", "About", "Services", "Contact"],
    structure: {
      sections: ["hero", "about", "services", "portfolio", "contact", "footer"].map((type, i) => ({
        type,
        order: i + 1,
        confidence: 0.9,
      })),
      nav: [],
    },
    extractedContent: {
      headline: `${brand} — crafted work`,
      description: "A studio description about who we are and what we make for our clients.",
      aboutBody: "We are a small dedicated team. We have shipped real work for years.",
      services: ["Strategy", "Design", "Build", "Care"],
      images: ["a", "b", "c", "d", "e"].map((k) => `https://x.com/${k}.jpg`),
      imagesRich: [
        { url: "https://x.com/a.jpg", alt: "hero photo", kind: "content", w: 1600, h: 1000 },
        { url: "https://x.com/b.jpg", alt: "team at work", kind: "portrait", w: 900, h: 1100 },
        { url: "https://x.com/c.jpg", alt: "detail one", kind: "gallery", w: 1400, h: 1000 },
        { url: "https://x.com/d.jpg", alt: "detail two", kind: "gallery", w: 1400, h: 1000 },
        { url: "https://x.com/e.jpg", alt: "detail three", kind: "gallery", w: 1400, h: 1000 },
      ],
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 },
    issues: [],
  } as unknown as SiteAnalysis;
}

const heroVariant = (a: SiteAnalysis) =>
  runPipeline(a).schema.blocks.find((b) => b.type === "hero")?.variant;

function heroesFor(industry: Industry, n = 12): string[] {
  return Array.from({ length: n }, (_, i) =>
    heroVariant(mk(industry, `Brand ${i}`, `https://brand-${i}.com`))
  ).filter((v): v is string => !!v);
}

describe("hero variety across same-sector brands", () => {
  for (const industry of ["restaurant", "architect", "saas", "agency"] as Industry[]) {
    it(`${industry}: a batch of brands opens on several different heroes`, () => {
      const heroes = heroesFor(industry);
      const distinct = new Set(heroes);
      // At least 3 distinct heroes across 12 same-sector brands, and no single
      // hero may dominate more than ~⅔ of the batch.
      expect(distinct.size).toBeGreaterThanOrEqual(3);
      const maxShare = Math.max(...Array.from(distinct).map((h) => heroes.filter((x) => x === h).length));
      expect(maxShare).toBeLessThanOrEqual(Math.ceil(heroes.length * 0.67));
    });
  }

  it("two adjacent brands in the same sector rarely share a hero", () => {
    // Deterministic: the same brand+url always yields the same hero (stable),
    // but distinct brands should mostly differ.
    const a = heroVariant(mk("restaurant", "Northlight", "https://northlight.fr"));
    const b = heroVariant(mk("restaurant", "Mamie Fada", "https://mamiefada.fr"));
    const c = heroVariant(mk("restaurant", "Le Comptoir", "https://lecomptoir.fr"));
    expect(new Set([a, b, c]).size).toBeGreaterThanOrEqual(2);
  });
});
