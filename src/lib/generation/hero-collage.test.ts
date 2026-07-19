import { describe, it, expect } from "vitest";
import { pickVariant } from "@/lib/generation/catalog";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * HeroCollage breaks the hero monopoly: a single `prefer` hero (+5) always beat
 * the per-brand jitter (max 1.6), so every restaurant got the identical hero.
 * Co-preferring HeroCollage with HeroImageFull for hospitality makes the two tie,
 * so the brand seed distributes — two same-sector brands now differ up top.
 */
describe("HeroCollage — hero variety within a family", () => {
  it("hospitality distributes across two signature heroes (not one)", () => {
    const brands = ["Osteria Nord", "Bistro Sud", "Le Marais", "Casa Vela", "Nordly", "Fumo", "Aria", "Sel"];
    for (const sector of ["restaurant", "hotel"] as Industry[]) {
      const picks = brands.map((b) => pickVariant("hero", sector, b, sector === "restaurant" ? "warm" : "elegant"));
      const distinct = Array.from(new Set(picks));
      // Genuinely more than one hero appears across brands...
      expect(distinct.length).toBeGreaterThan(1);
      // ...and both are the intended, sector-fitting signatures.
      for (const p of distinct) expect(["HeroImageFull", "HeroCollage"]).toContain(p);
    }
  });
  it("is deterministic per brand (same brand → same hero)", () => {
    expect(pickVariant("hero", "restaurant", "Osteria Nord", "warm")).toBe(
      pickVariant("hero", "restaurant", "Osteria Nord", "warm")
    );
  });
});

function mk(industry: Industry, images: string[], headline = "A table you'll remember"): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  return {
    url: "https://x.com", brandName: "Collage Test Brand", industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "gallery", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: { headline, description: "Seasonal cuisine.", services: ["Dinner", "Private dining"], heroImageUrl: images[0], images },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

/** Force a specific hero by trying brand seeds until the desired variant is picked. */
function brandForHero(sector: Industry, mood: any, want: string): string {
  for (let i = 0; i < 200; i++) {
    const seed = `Brand${i}`;
    if (pickVariant("hero", sector, seed, mood) === want) return seed;
  }
  throw new Error(`no seed produced ${want}`);
}

describe("HeroCollage — engine wiring + no duplicate photo", () => {
  it("when HeroCollage is picked it carries a second, DISTINCT real photo", () => {
    const seed = brandForHero("restaurant" as Industry, "warm", "HeroCollage");
    const imgs = ["A", "B", "C", "D", "E", "F"].map((x) => `https://x/${x}`);
    const a = mk("restaurant" as Industry, imgs);
    (a as any).brandName = seed;
    const s = generateSite(a, { mode: "smart" });
    const hero = s.blocks.find((b) => b.type === "hero");
    expect(hero?.variant).toBe("HeroCollage");
    const props = hero?.props as any;
    expect(typeof props.image).toBe("string");
    expect(typeof props.image2).toBe("string");
    expect(props.image2).not.toBe(props.image); // the collage never repeats its own photo
    // And neither hero photo repeats in any later imaged section (one photo, once).
    const laterImages = s.blocks
      .filter((b) => b.type !== "hero")
      .flatMap((b) => {
        const bp = b.props as any;
        const arr: string[] = [];
        if (typeof bp?.image === "string") arr.push(bp.image);
        if (Array.isArray(bp?.items)) for (const it of bp.items) if (typeof it?.image === "string") arr.push(it.image);
        return arr;
      });
    expect(laterImages).not.toContain(props.image);
    expect(laterImages).not.toContain(props.image2);
  });

  it("degrades to a single framed tile when only one photo exists (image2 dropped)", () => {
    const seed = brandForHero("restaurant" as Industry, "warm", "HeroCollage");
    const a = mk("restaurant" as Industry, ["https://x/only"]);
    (a as any).brandName = seed;
    const s = generateSite(a, { mode: "smart" });
    const props = s.blocks.find((b) => b.type === "hero")?.props as any;
    expect(props.image2).toBeUndefined();
  });

  it("non-collage heroes never carry image2 (no wasted pool slot)", () => {
    const seed = brandForHero("restaurant" as Industry, "warm", "HeroImageFull");
    const imgs = ["A", "B", "C", "D"].map((x) => `https://x/${x}`);
    const a = mk("restaurant" as Industry, imgs);
    (a as any).brandName = seed;
    const s = generateSite(a, { mode: "smart" });
    const props = s.blocks.find((b) => b.type === "hero")?.props as any;
    expect(props.variant).not.toBe("HeroCollage");
    expect(props).not.toHaveProperty("image2");
  });
});
