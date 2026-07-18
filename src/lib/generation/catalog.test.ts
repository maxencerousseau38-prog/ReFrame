import { describe, it, expect } from "vitest";
import { pickVariant, variantsFor, BLOCK_CATALOG } from "./catalog";

describe("pickVariant scoring", () => {
  it("is deterministic for the same inputs", () => {
    expect(pickVariant("hero", "saas", "Acme", "minimal")).toBe(
      pickVariant("hero", "saas", "Acme", "minimal")
    );
  });

  it("gives each sector its signature premium hero", () => {
    expect(pickVariant("hero", "restaurant", "X", "warm")).toBe("HeroImageFull"); // immersive food
    expect(["HeroMonumental", "HeroArchform"]).toContain(pickVariant("hero", "realestate", "X", "elegant")); // property showcase
    expect(pickVariant("hero", "agency", "X", "bold")).toBe("HeroAgencia"); // colossal wordmark
    expect(pickVariant("hero", "saas", "X", "minimal")).toBe("HeroBento"); // product + proof
    // bold/agency features = a modern card layout (bento or spotlight), not the plain grid
    expect(["FeaturesBento", "FeaturesSpotlight"]).toContain(pickVariant("features", "agency", "X", "bold"));
  });

  it("routes testimonials and CTA by mood (evening venues dark, others light)", () => {
    // Evening venues (restaurants, hotels) get the dark atmospheric Nocturne
    // beat as a sector signature — their pages were otherwise tonally flat.
    expect(pickVariant("testimonials", "restaurant", "X", "warm")).toBe("TestimonialsNocturne");
    expect(pickVariant("testimonials", "hotel", "X", "warm")).toBe("TestimonialsNocturne");
    // Other warm/elegant sectors keep a LIGHT treatment (Editorial/Grid/Stacked);
    // which one varies per brand (seeded jitter), so assert the routing intent.
    expect(["TestimonialsEditorial", "TestimonialsGrid", "TestimonialsStacked"]).toContain(
      pickVariant("testimonials", "health", "X", "warm")
    );
    expect(pickVariant("testimonials", "saas", "X", "minimal")).toBe("TestimonialsSlider1");
    expect(pickVariant("cta", "health", "X", "elegant")).toBe("CTAEditorial");
    // saas/minimal = a dark/bold CTA (not the light editorial one)
    expect(pickVariant("cta", "saas", "X", "minimal")).not.toBe("CTAEditorial");
  });

  it("diversifies same-profile brands where variants are competitive", () => {
    // Where several variants fit equally (warm testimonials: Editorial vs Grid
    // vs Stacked for non-evening sectors), distinct brands should not all land
    // on the same template. (Where one variant is a sector signature — e.g.
    // Nocturne for restaurants/hotels — it is still used for all, by design.)
    const picks = ["Acme", "Globex", "Initech", "Umbra", "Vertex", "Nimbus"].map((n) =>
      pickVariant("testimonials", "health", n, "warm")
    );
    expect(new Set(picks).size).toBeGreaterThan(1);
  });

  it("prefers the split product-preview hero for retail across brands", () => {
    // E-commerce gets the modern split hero with a floating product preview
    // (never the banned centered-headline + button), for every brand.
    for (const brand of ["Acme", "Globex", "Nimbus", "Vertex"]) {
      expect(pickVariant("hero", "ecommerce", brand, "minimal")).toBe("HeroSplitPremium");
    }
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
