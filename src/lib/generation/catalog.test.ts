import { describe, it, expect } from "vitest";
import { pickVariant, variantsFor, BLOCK_CATALOG } from "./catalog";

describe("pickVariant scoring", () => {
  it("is deterministic for the same inputs", () => {
    expect(pickVariant("hero", "saas", "Acme", "minimal")).toBe(
      pickVariant("hero", "saas", "Acme", "minimal")
    );
  });

  it("gives warm/elegant sectors the editorial hero", () => {
    expect(pickVariant("hero", "restaurant", "X", "warm")).toBe("HeroEditorial");
    expect(pickVariant("hero", "realestate", "X", "elegant")).toBe("HeroEditorial");
  });

  it("gives tech/bold sectors the spotlight hero and the bento features", () => {
    expect(pickVariant("hero", "saas", "X", "minimal")).toBe("HeroSpotlight");
    expect(pickVariant("features", "agency", "X", "bold")).toBe("FeaturesBento");
  });

  it("routes testimonials and CTA by mood (light editorial vs dark)", () => {
    // Warm/elegant brands get a LIGHT testimonials/CTA treatment (not the dark
    // slider/panel). Which light variant can vary per brand (seeded jitter), so
    // assert the routing intent rather than a single template.
    expect(["TestimonialsEditorial", "TestimonialsGrid"]).toContain(
      pickVariant("testimonials", "restaurant", "X", "warm")
    );
    expect(pickVariant("testimonials", "saas", "X", "minimal")).toBe("TestimonialsSlider1");
    expect(pickVariant("cta", "health", "X", "elegant")).toBe("CTAEditorial");
    expect(pickVariant("cta", "saas", "X", "minimal")).toBe("CTASection1");
  });

  it("diversifies same-profile brands where variants are competitive", () => {
    // Where several variants fit equally (e.g. warm testimonials: Editorial vs
    // Grid), distinct brands should not all land on the same template. (Where
    // one variant clearly dominates, it is still used for all - by design.)
    const picks = ["Acme", "Globex", "Initech", "Umbra", "Vertex", "Nimbus"].map((n) =>
      pickVariant("testimonials", "restaurant", n, "warm")
    );
    expect(new Set(picks).size).toBeGreaterThan(1);
  });

  it("always returns a registered variant of the requested category", () => {
    for (const industry of ["saas", "restaurant", "artisan", "health"] as const) {
      const v = pickVariant("hero", industry, "Seed", "bold");
      expect(BLOCK_CATALOG.some((b) => b.variant === v && b.category === "hero")).toBe(true);
    }
  });
});

describe("variantsFor", () => {
  it("lists sector-specific variants before universal ones", () => {
    const list = variantsFor("hero", "saas");
    // HeroSpotlight is saas-specific; HeroPremium1 is universal.
    expect(list).toContain("HeroSpotlight");
    expect(list).toContain("HeroPremium1");
    expect(list.indexOf("HeroSpotlight")).toBeLessThan(list.indexOf("HeroPremium1"));
  });
});
