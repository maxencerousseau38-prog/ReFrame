import { describe, it, expect } from "vitest";
import { pickVariant } from "@/lib/generation/catalog";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { Industry } from "@/lib/generation/types";

/**
 * About/services monopoly fix. Before: StatementEditorial owned the about of all
 * 7 warm/elegant sectors and services was a pool-of-one (ServicesList) for them —
 * every same-sector brand got the identical section architecture. AboutAtelier and
 * ServicesAtelier are calibrated to TIE the incumbents' scores in those
 * territories, so the brand seed distributes between two genuinely different
 * architectures. Bold/minimal signatures (StatementAgencia, ServicesCards) stay
 * intentional, like HeroAgencia.
 */
const BRANDS = ["Atelier Nord", "Studio Vela", "Maison Lume", "Forma", "Aksel Haus", "Volume", "Nord & Co", "Praxis"];
const distinct = (cat: "about" | "services", sector: Industry) => {
  const mood = INDUSTRY_PROFILES[sector].theme.mood as any;
  return Array.from(new Set(BRANDS.map((b) => pickVariant(cat, sector, b, mood))));
};

describe("about — variety within a sector", () => {
  it("warm/elegant sectors split between the two editorial architectures", () => {
    for (const s of ["restaurant", "hotel", "architect", "realestate", "health", "lawyer"] as Industry[]) {
      const got = distinct("about", s);
      expect(got.length).toBeGreaterThan(1);
      for (const v of got) expect(["StatementEditorial", "AboutAtelier"]).toContain(v);
    }
  });
  it("bold/minimal sectors keep their intentional statement signature", () => {
    expect(distinct("about", "saas" as Industry)).toEqual(["StatementAgencia"]);
    expect(distinct("about", "gym" as Industry)).toEqual(["StatementAgencia"]);
  });
});

describe("services — variety within a sector", () => {
  it("warm/elegant sectors split between the index list and the interactive atelier", () => {
    for (const s of ["restaurant", "hotel", "architect", "realestate", "lawyer"] as Industry[]) {
      const got = distinct("services", s);
      expect(got.length).toBeGreaterThan(1);
      for (const v of got) expect(["ServicesList", "ServicesAtelier"]).toContain(v);
    }
  });
  it("health splits between cards and the atelier (its pool has all three)", () => {
    const got = distinct("services", "health" as Industry);
    expect(got.length).toBeGreaterThan(1);
  });
  it("is deterministic per brand", () => {
    expect(pickVariant("services", "restaurant", "Atelier Nord", "warm")).toBe(
      pickVariant("services", "restaurant", "Atelier Nord", "warm")
    );
  });
});
