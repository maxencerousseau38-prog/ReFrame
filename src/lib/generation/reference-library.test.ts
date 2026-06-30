import { describe, it, expect } from "vitest";
import { ENRICHED_REFERENCE_DB } from "./reference-library";
import { REFERENCE_DB } from "./reference-db";

describe("ENRICHED_REFERENCE_DB", () => {
  it("has the same length as REFERENCE_DB", () => {
    expect(ENRICHED_REFERENCE_DB.length).toBe(REFERENCE_DB.length);
  });

  it("has unique ids", () => {
    const ids = ENRICHED_REFERENCE_DB.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives Archform a richDna entry", () => {
    const archform = ENRICHED_REFERENCE_DB.find((r) => r.id === "ref-archform");
    expect(archform?.richDna).toBeDefined();
    expect(archform?.richDna?.hero.compositionType).toBe("monumental");
  });

  it("Archform richDna.hero.compositionType matches its legacy dna.heroStyle", () => {
    const archform = ENRICHED_REFERENCE_DB.find((r) => r.id === "ref-archform")!;
    expect(archform.richDna!.hero.compositionType).toBe(archform.dna.heroStyle);
  });

  it("leaves references other than Archform without richDna", () => {
    const others = ENRICHED_REFERENCE_DB.filter((r) => r.id !== "ref-archform");
    expect(others.every((r) => r.richDna === undefined)).toBe(true);
  });

  it("preserves the original CuratedReference fields untouched", () => {
    for (const ref of REFERENCE_DB) {
      const enriched = ENRICHED_REFERENCE_DB.find((r) => r.id === ref.id)!;
      expect(enriched.name).toBe(ref.name);
      expect(enriched.dna).toEqual(ref.dna);
    }
  });
});
