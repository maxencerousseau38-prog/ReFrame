import { describe, it, expect } from "vitest";
import { pickVariant } from "@/lib/generation/catalog";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import type { Industry } from "@/lib/generation/types";

/**
 * Hero-monopoly fix, editorial family. The premium heroes already existed but a
 * single `prefer` (+5) beat the per-brand jitter (max 1.6), so every architect /
 * realestate brand got the identical hero. Co-preferring the two architectural
 * signatures (HeroMonumental + HeroArchform) makes them tie → the seed distributes.
 */
const BRANDS = ["Atelier Nord", "Studio Vela", "Maison Lume", "Forma", "Aksel Haus", "Volume", "Nord & Co", "Praxis"];
const heroesFor = (sector: Industry) => {
  const mood = INDUSTRY_PROFILES[sector].theme.mood as any;
  return Array.from(new Set(BRANDS.map((b) => pickVariant("hero", sector, b, mood))));
};

describe("editorial family — hero variety within a sector", () => {
  it("architect distributes across its two architectural signatures", () => {
    const heroes = heroesFor("architect" as Industry);
    expect(heroes.length).toBeGreaterThan(1);
    for (const h of heroes) expect(["HeroMonumental", "HeroArchform"]).toContain(h);
  });
  it("realestate distributes across its two architectural signatures", () => {
    const heroes = heroesFor("realestate" as Industry);
    expect(heroes.length).toBeGreaterThan(1);
    for (const h of heroes) expect(["HeroMonumental", "HeroArchform"]).toContain(h);
  });
  it("hospitality and health already vary (no single-hero monopoly)", () => {
    expect(heroesFor("restaurant" as Industry).length).toBeGreaterThan(1);
    expect(heroesFor("hotel" as Industry).length).toBeGreaterThan(1);
    expect(heroesFor("health" as Industry).length).toBeGreaterThan(1);
  });
  it("agency keeps its intentional single signature (HeroAgencia by design)", () => {
    // HeroAgencia (colossal near-black wordmark) is agency's defining look; variety
    // there comes from colour/copy/sections, not a co-equal hero (fit over forced variety).
    const heroes = heroesFor("agency" as Industry);
    expect(heroes).toEqual(["HeroAgencia"]);
  });
  it("is deterministic per brand", () => {
    expect(pickVariant("hero", "architect", "Atelier Nord", "elegant")).toBe(
      pickVariant("hero", "architect", "Atelier Nord", "elegant")
    );
  });
});
