import { describe, it, expect } from "vitest";
import { scoreCreativeDirection } from "@/lib/generation/creative-director-score";
import type { QualityScore } from "@/lib/generation/quality-gate";
import type { SiteSchema } from "@/lib/generation/types";

/** A uniformly strong gate score, so the ONLY variable is section substance. */
function strongQuality(): QualityScore {
  const dim = { score: 90, maxScore: 100, issues: [], fixes: [] };
  return {
    editorialQuality: dim, compositionQuality: dim, visualRhythm: dim, layoutOriginality: dim,
    framerSimilarity: dim, conversionQuality: dim, brandFidelity: dim, premiumScore: dim,
    total: 90, passes: true, allFixes: [],
  };
}

function schemaWith(featuresItems: number): SiteSchema {
  return {
    id: "s", sourceUrl: "https://x.com", industry: "restaurant",
    brand: { name: "X" }, theme: { mood: "warm" } as any, mode: "smart", animations: true,
    blocks: [
      { id: "1", type: "hero", variant: "HeroArchform", props: {} },
      { id: "2", type: "features", variant: "FeaturesShowcase", props: { items: Array.from({ length: featuresItems }, (_, i) => ({ title: `f${i}` })) } },
      { id: "3", type: "footer", variant: "Footer1", props: {} },
    ],
  } as unknown as SiteSchema;
}

describe("CD score — section substance (CD #5)", () => {
  it("an empty content section is penalised hard and flagged as thin", () => {
    const full = scoreCreativeDirection(strongQuality(), undefined, undefined, schemaWith(4));
    const empty = scoreCreativeDirection(strongQuality(), undefined, undefined, schemaWith(0));
    expect(empty.overall).toBeLessThan(full.overall);
    expect(empty.visualQuality).toBeLessThan(full.visualQuality);
    expect(empty.templateRisk).toBeGreaterThan(full.templateRisk);
    // The weak axes must NAME the problem so the loop knows what to fix.
    const why = empty.weakest.map((w) => w.why).join(" ");
    expect(why).toContain("features");
  });

  it("a well-populated page with a strong gate passes the CD bar", () => {
    const full = scoreCreativeDirection(strongQuality(), undefined, undefined, schemaWith(4));
    expect(full.passes).toBe(true);
    expect(full.overall).toBeGreaterThanOrEqual(8.5);
  });
});
