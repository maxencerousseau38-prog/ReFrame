import { describe, it, expect } from "vitest";
import { pickVariant } from "@/lib/generation/catalog";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * FooterSignature — the editorial dark sign-off. Signature for the editorial +
 * hospitality families; other sectors keep footer variety. Also guards the F21
 * fix: footers carry the REAL tagline and never the "Crafted with care." filler.
 */
describe("FooterSignature routing", () => {
  it("is the signature footer for editorial + immersive-hospitality sectors", () => {
    for (const s of ["architect", "realestate", "restaurant", "hotel"] as Industry[]) {
      expect(pickVariant("footer", s, "Acme", "elegant")).toBe("FooterSignature");
    }
  });
  it("does not monopolize other sectors (variety preserved)", () => {
    // A product sector never signs off with the editorial footer.
    expect(pickVariant("footer", "saas" as Industry, "Acme", "minimal")).not.toBe("FooterSignature");
    expect(pickVariant("footer", "gym" as Industry, "Acme", "bold")).not.toBe("FooterSignature");
  });
});

function mk(industry: Industry): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const images = ["A", "B", "C", "D", "E", "F"].map((x) => `https://x/${x}`);
  return {
    url: "https://x.com", brandName: "Northlight", industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: {
      headline: "Design that moves the needle",
      description: "D", services: ["Brand identity", "Web design"], heroImageUrl: images[0], images,
      contact: { email: "hello@northlight.studio" }, socialLinks: [{ platform: "Instagram", url: "https://instagram.com/x" }],
    },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

describe("FooterSignature — engine wiring + no fabrication (F21)", () => {
  it("architect signs off with FooterSignature carrying the REAL tagline", () => {
    const s = generateSite(mk("architect" as Industry), { mode: "smart" });
    const footer = s.blocks.find((b) => b.type === "footer");
    expect(footer?.variant).toBe("FooterSignature");
    const props = footer?.props as any;
    // The real one-liner is passed through, never a hardcoded filler.
    expect(typeof props.tagline).toBe("string");
    expect(props.tagline).toContain("needle");
    expect(props.tagline).not.toMatch(/crafted with care/i);
  });
  it("every footer receives a tagline field so no variant needs a fabricated fallback", () => {
    for (const ind of ["architect", "saas", "restaurant", "health"] as Industry[]) {
      const s = generateSite(mk(ind), { mode: "smart" });
      const props = s.blocks.find((b) => b.type === "footer")?.props as any;
      expect(props).toHaveProperty("tagline");
    }
  });
});
