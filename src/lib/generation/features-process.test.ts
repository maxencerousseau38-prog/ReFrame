import { describe, it, expect } from "vitest";
import { pickVariant } from "@/lib/generation/catalog";

describe("FeaturesProcess routing", () => {
  it("is the architect signature (image-led monumental process)", () => {
    for (const brand of ["Acme", "Globex", "Umbra"]) {
      expect(pickVariant("features", "architect", brand, "bold")).toBe("FeaturesProcess");
    }
  });
  it("is one competitive option for agencies (not a monopoly)", () => {
    const picks = ["Acme", "Globex", "Initech", "Umbra", "Vertex", "Nimbus"].map((b) =>
      pickVariant("features", "agency", b, "bold")
    );
    expect(new Set(picks).size).toBeGreaterThan(1); // variety preserved
  });
});
