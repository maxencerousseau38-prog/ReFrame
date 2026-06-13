import { describe, it, expect } from "vitest";
import { generateSite } from "./engine";
import type { BlockType, SiteAnalysis, SiteStructure } from "./types";

function analysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://acme.com",
    brandName: "Acme",
    industry: "agency",
    industryLabel: "Agency",
    fetched: true,
    detectedSections: [],
    navItems: ["A", "B", "C"],
    extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: [] },
    scores: { design: 50, performance: 50, seo: 50, mobile: 50, accessibility: 50 },
    issues: [],
    ...overrides,
  };
}

function structure(types: BlockType[]): SiteStructure {
  return { sections: types.map((t, i) => ({ type: t, order: i + 1, confidence: 0.9 })), nav: [] };
}

// Block identity is randomized; compare only the meaningful selection + content.
function shape(s: ReturnType<typeof generateSite>) {
  return {
    mode: s.mode,
    blocks: s.blocks.map((b) => ({ type: b.type, variant: b.variant, props: b.props })),
  };
}

describe("generateSite", () => {
  it("defaults to preserve and keeps the detected structure", () => {
    const s = generateSite(
      analysis({ structure: structure(["hero", "services", "portfolio", "footer"]) })
    );
    expect(s.mode).toBe("preserve");
    expect(s.blocks.map((b) => b.type)).toEqual(["hero", "services", "portfolio", "footer"]);
  });

  it("is deterministic (same input, same selection and content)", () => {
    const a = analysis({ structure: structure(["hero", "about", "footer"]) });
    expect(shape(generateSite(a))).toEqual(shape(generateSite(a)));
  });

  it("routes extended section types to their dedicated variants", () => {
    const a = analysis({
      structure: structure(["hero", "about", "services", "portfolio", "footer"]),
    });
    const byType = Object.fromEntries(
      generateSite(a, { mode: "preserve" }).blocks.map((b) => [b.type, b.variant])
    );
    expect(byType.about).toBe("AboutSplit");
    expect(byType.services).toBe("ServicesList");
    expect(byType.portfolio).toBe("PortfolioGrid");
  });

  it("never fabricates testimonials or stats: omits them without real data", () => {
    const a = analysis({ structure: structure(["hero", "testimonials", "stats", "footer"]) });
    const types = generateSite(a, { mode: "preserve" }).blocks.map((b) => b.type);
    expect(types).not.toContain("testimonials");
    expect(types).not.toContain("stats");
  });

  it("renders testimonials and stats when real data is provided", () => {
    const a = analysis({
      structure: structure(["hero", "testimonials", "stats", "footer"]),
      extractedContent: {
        headline: "H", description: "D", services: ["A", "B", "C"], images: [],
        testimonials: [{ quote: "Great work", name: "Real Client", role: "Owner" }],
        stats: [{ value: "12", label: "Years" }],
      },
    });
    const types = generateSite(a, { mode: "preserve" }).blocks.map((b) => b.type);
    expect(types).toContain("testimonials");
    expect(types).toContain("stats");
  });

  it("classic uses the canonical layout (no fabricated testimonials)", () => {
    const s = generateSite(analysis({ structure: structure(["hero", "about", "footer"]) }), {
      mode: "classic",
    });
    expect(s.blocks.map((b) => b.type)).toEqual([
      "hero", "features", "faq", "cta", "contact", "footer",
    ]);
    expect(s.recommendations).toBeUndefined();
  });

  it("smart attaches conversion recommendations", () => {
    const s = generateSite(analysis({ structure: structure(["hero", "about", "footer"]) }), {
      mode: "smart",
    });
    expect(s.recommendations?.length ?? 0).toBeGreaterThan(0);
  });

  it("uses the source accent color when one was detected", () => {
    const s = generateSite(analysis({ brand: { accentColor: "#ff0066" } }));
    expect(s.theme.accent).toBe("#ff0066");
  });
});
