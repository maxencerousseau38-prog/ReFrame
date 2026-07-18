import { describe, it, expect } from "vitest";
import { planSmart, familyOf, FAMILY_RHYTHM } from "@/lib/generation/planner";
import { generateSite } from "@/lib/generation/engine";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { SiteAnalysis, Industry } from "@/lib/generation/types";

/**
 * Design families are the root of real variety: each family gives a whole class
 * of brands its own narrative arc AND its own reading rhythm, so generated sites
 * stop reading as one skeleton re-skinned. These lock that in.
 */

const arc = (industry: string) => planSmart(undefined, industry).slots.map((s) => s.type);

describe("design families — sector routing", () => {
  it("routes each sector to its intended family", () => {
    expect(familyOf("architect")).toBe("editorial");
    expect(familyOf("agency")).toBe("editorial");
    expect(familyOf("restaurant")).toBe("hospitality");
    expect(familyOf("hotel")).toBe("hospitality");
    expect(familyOf("saas")).toBe("product");
    expect(familyOf("ecommerce")).toBe("retail");
    expect(familyOf("fashion")).toBe("retail");
    expect(familyOf("health")).toBe("trust");
    expect(familyOf("lawyer")).toBe("trust");
  });
  it("has no family for an unknown sector (falls back to the generic flow)", () => {
    expect(familyOf("mysterysector")).toBeUndefined();
  });
});

describe("design families — distinct narrative arcs", () => {
  it("gives each family a genuinely different section architecture", () => {
    const editorial = arc("architect").join(">");
    const hospitality = arc("restaurant").join(">");
    const product = arc("saas").join(">");
    const retail = arc("ecommerce").join(">");
    const trust = arc("health").join(">");
    // All five arcs are different from one another.
    const arcs = [editorial, hospitality, product, retail, trust];
    expect(new Set(arcs).size).toBe(5);
  });

  it("editorial leads with the work (portfolio-first)", () => {
    // First content section after the hero is the portfolio, not features.
    expect(arc("architect")[1]).toBe("portfolio");
  });

  it("hospitality is imagery + story with no metrics or FAQ", () => {
    const a = arc("restaurant");
    expect(a).toContain("gallery");
    expect(a).not.toContain("stats");
    expect(a).not.toContain("faq");
  });

  it("product is the dense value→metrics→proof→objections funnel", () => {
    const a = arc("saas");
    expect(a).toContain("stats");
    expect(a).toContain("faq");
    // Value section leads (no gallery/portfolio detour).
    expect(a[1]).toBe("features");
  });

  it("retail is short & punchy — shop imagery, no about/stats/faq", () => {
    const a = arc("ecommerce");
    expect(a).toContain("gallery");
    expect(a).not.toContain("about");
    expect(a).not.toContain("stats");
    expect(a).not.toContain("faq");
  });

  it("trust is credentials-led — features, then who-we-are, then proof", () => {
    const a = arc("health");
    expect(a.indexOf("about")).toBeGreaterThan(a.indexOf("features"));
    expect(a).toContain("stats");
    expect(a).toContain("faq");
  });
});

describe("design families — reading rhythm ordering", () => {
  it("editorial breathes the most, product is the densest, never below 1", () => {
    expect(FAMILY_RHYTHM.editorial).toBeGreaterThan(FAMILY_RHYTHM.hospitality);
    expect(FAMILY_RHYTHM.hospitality).toBeGreaterThan(FAMILY_RHYTHM.trust);
    expect(FAMILY_RHYTHM.product).toBe(1);
    for (const r of Object.values(FAMILY_RHYTHM)) expect(r).toBeGreaterThanOrEqual(1);
  });
});

function mk(industry: Industry): SiteAnalysis {
  const p = INDUSTRY_PROFILES[industry];
  const images = ["A", "B", "C", "D", "E", "F"].map((x) => `https://x/${x}`);
  return {
    url: "https://x.com", brandName: "N", industry, industryLabel: p.label, fetched: true, confidence: "full", detectedSections: [],
    brand: { accentColor: p.theme.accent }, navItems: ["Home"],
    structure: { sections: ["hero", "footer"].map((type, i) => ({ type, order: i + 1, confidence: 0.9 })), nav: [] },
    extractedContent: { headline: "H", description: "D", services: ["a", "b", "c"], heroImageUrl: images[0], images },
    scores: { design: 60, performance: 60, seo: 60, mobile: 60, accessibility: 60 }, issues: [],
  } as unknown as SiteAnalysis;
}

describe("design families — the engine publishes the family + rhythm", () => {
  it("stamps schema.family and schema.rhythm on a smart-mode generation", () => {
    const editorial = generateSite(mk("architect" as Industry), { mode: "smart" });
    expect(editorial.family).toBe("editorial");
    expect(editorial.rhythm).toBe(FAMILY_RHYTHM.editorial);

    const product = generateSite(mk("saas" as Industry), { mode: "smart" });
    expect(product.family).toBe("product");
    expect(product.rhythm).toBe(FAMILY_RHYTHM.product);
  });

  it("classic mode carries no family (keeps the neutral V5 rhythm)", () => {
    const classic = generateSite(mk("architect" as Industry), { mode: "classic" });
    expect(classic.family).toBeUndefined();
    expect(classic.rhythm).toBeUndefined();
  });
});
