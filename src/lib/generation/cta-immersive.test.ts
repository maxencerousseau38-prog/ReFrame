import { describe, it, expect } from "vitest";
import { pickVariant } from "@/lib/generation/catalog";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis } from "@/lib/generation/types";

describe("CTAImmersive routing", () => {
  it("is the closing signature for image-led warm sectors", () => {
    for (const s of ["restaurant", "hotel", "realestate", "architect"]) {
      expect(pickVariant("cta", s, "Acme", "warm")).toBe("CTAImmersive");
    }
  });
  it("leaves calm sectors on the light editorial CTA", () => {
    expect(pickVariant("cta", "health", "X", "elegant")).toBe("CTAEditorial");
  });
});

function mk(images: string[]): SiteAnalysis {
  const p = INDUSTRY_PROFILES["restaurant"];
  return {
    url: "https://x.com", brandName: "N", industry: "restaurant", industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "cta", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: { headline: "H", description: "D", services: ["a"], heroImageUrl: images[0], images },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

describe("CTAImmersive image allocation", () => {
  it("gets its own distinct photo when the page is image-rich (shares the pool with the gallery)", () => {
    const imgs = ["A", "B", "C", "D", "E", "F"].map((x) => `https://x/${x}`);
    const s = generateSite(mk(imgs), { mode: "smart" });
    const cta = s.blocks.find((b) => b.type === "cta");
    const heroImg = (s.blocks.find((b) => b.type === "hero")?.props as any)?.image;
    const img = (cta?.props as any)?.image;
    console.log("cta variant:", cta?.variant, "image:", img);
    expect(cta?.variant).toBe("CTAImmersive");
    expect(typeof img).toBe("string"); // the closing gets a real photo
    expect(img).not.toBe(heroImg); // and never the hero's (no repeat)
  });
});
