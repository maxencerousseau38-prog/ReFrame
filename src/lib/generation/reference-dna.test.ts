import { describe, it, expect } from "vitest";
import { analyzeReference } from "./reference-dna";
import { REFERENCE_DB } from "./reference-db";

describe("analyzeReference", () => {
  it("migrates every curated reference without throwing", () => {
    for (const ref of REFERENCE_DB) {
      expect(() => analyzeReference(ref)).not.toThrow();
    }
  });

  it("populates all 7 sub-objects for every reference", () => {
    for (const ref of REFERENCE_DB) {
      const dna = analyzeReference(ref);
      expect(dna.hero).toBeDefined();
      expect(dna.typography).toBeDefined();
      expect(dna.layout).toBeDefined();
      expect(dna.image).toBeDefined();
      expect(dna.component).toBeDefined();
      expect(dna.motion).toBeDefined();
      expect(dna.brand).toBeDefined();
    }
  });

  it("keeps numeric fields within valid ranges", () => {
    for (const ref of REFERENCE_DB) {
      const dna = analyzeReference(ref);
      expect(dna.hero.viewportOccupation).toBeGreaterThanOrEqual(0);
      expect(dna.hero.viewportOccupation).toBeLessThanOrEqual(100);
      expect(dna.hero.overlayOpacity).toBeGreaterThanOrEqual(0);
      expect(dna.hero.overlayOpacity).toBeLessThanOrEqual(1);
      expect(dna.brand.luxuryScore).toBeGreaterThanOrEqual(0);
      expect(dna.brand.luxuryScore).toBeLessThanOrEqual(100);
      expect(dna.brand.premiumScore).toBeGreaterThanOrEqual(0);
      expect(dna.brand.premiumScore).toBeLessThanOrEqual(100);
      expect(dna.typography.headingWeight).toBeGreaterThanOrEqual(100);
      expect(dna.typography.headingWeight).toBeLessThanOrEqual(900);
    }
  });

  it("preserves the source heroStyle as compositionType", () => {
    const archform = REFERENCE_DB.find((r) => r.id === "ref-archform")!;
    const dna = analyzeReference(archform);
    expect(dna.hero.compositionType).toBe(archform.dna.heroStyle);
  });

  it("derives a monumental headline scale for editorial-rhythm references", () => {
    const archform = REFERENCE_DB.find((r) => r.id === "ref-archform")!;
    const dna = analyzeReference(archform);
    expect(archform.dna.rhythm).toBe("editorial");
    expect(dna.hero.headlineScale).toBe("monumental");
  });

  it("is deterministic — same reference, same output", () => {
    const ref = REFERENCE_DB[0];
    const a = analyzeReference(ref);
    const b = analyzeReference(ref);
    expect(a).toEqual(b);
  });

  it("luxury-tier references score higher luxuryScore than premium-tier", () => {
    const luxuryRef = REFERENCE_DB.find((r) => r.tier === "luxury")!;
    const premiumRef = REFERENCE_DB.find((r) => r.tier === "premium")!;
    const luxuryDna = analyzeReference(luxuryRef);
    const premiumDna = analyzeReference(premiumRef);
    expect(luxuryDna.brand.luxuryScore).toBeGreaterThan(premiumDna.brand.luxuryScore);
  });
});
