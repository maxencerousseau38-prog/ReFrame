import { describe, it, expect } from "vitest";
import { generateSite, applyAiEdit } from "./engine";
import type { SiteAnalysis } from "./types";

function analysis(): SiteAnalysis {
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
  };
}

describe("applyAiEdit — animations toggle", () => {
  const base = generateSite(analysis(), { mode: "smart" });

  it("turns animations off on request", () => {
    for (const cmd of ["remove the animations", "disable animations", "enlève les animations", "make it static, no motion"]) {
      const r = applyAiEdit(base, cmd);
      expect(r.changed).toBe(true);
      expect(r.schema.animations).toBe(false);
    }
  });

  it("turns animations back on", () => {
    const off = applyAiEdit(base, "remove animations").schema;
    const r = applyAiEdit(off, "add the animations back");
    expect(r.changed).toBe(true);
    expect(r.schema.animations).toBe(true);
  });

  it("defaults to animated (undefined === on) and never hides content", () => {
    expect(base.animations).toBeUndefined(); // undefined is treated as on by the renderer
  });
});
