import { describe, it, expect } from "vitest";
import { parseSiteSchema } from "./validate";

const valid = {
  id: "x",
  sourceUrl: "https://acme.com",
  industry: "saas",
  brand: { name: "Acme", tagline: "t" },
  theme: { primary: "#0a0a0a", accent: "#6366f1", radius: "lg", font: "inter", mood: "minimal" },
  blocks: [
    { id: "h", type: "hero", variant: "HeroPremium1", props: { title: "Hi" } },
    { id: "f", type: "footer", variant: "Footer1", props: {} },
  ],
};

const HERO_VARIANTS = ["HeroPremium1", "HeroPremium2", "HeroSpotlight", "HeroEditorial"];

describe("parseSiteSchema", () => {
  it("rejects non-objects and unsalvageable schemas", () => {
    expect(parseSiteSchema(null)).toBeNull();
    expect(parseSiteSchema("nope")).toBeNull();
    expect(parseSiteSchema({ blocks: [] })).toBeNull();
    expect(parseSiteSchema({ blocks: [{ type: "notatype" }] })).toBeNull();
  });

  it("accepts a valid schema and preserves its blocks", () => {
    const s = parseSiteSchema(valid)!;
    expect(s).not.toBeNull();
    expect(s.blocks.map((b) => b.variant)).toEqual(["HeroPremium1", "Footer1"]);
    expect(s.theme.mood).toBe("minimal");
  });

  it("defaults every malformed theme field", () => {
    const s = parseSiteSchema({
      ...valid,
      theme: { primary: "nope", radius: "banana", font: "comic", mood: "angry" },
    })!;
    expect(s.theme.primary).toBe("#0a0a0a");
    expect(s.theme.radius).toBe("lg");
    expect(s.theme.font).toBe("inter");
    expect(s.theme.mood).toBe("minimal");
  });

  it("repairs unknown and wrong-category variants to valid ones for the type", () => {
    const s = parseSiteSchema({
      ...valid,
      blocks: [
        { id: "a", type: "hero", variant: "MadeUp", props: {} },
        { id: "b", type: "hero", variant: "Footer1", props: {} },
      ],
    })!;
    for (const b of s.blocks) {
      expect(b.type).toBe("hero");
      expect(HERO_VARIANTS).toContain(b.variant);
    }
  });

  it("drops blocks with an invalid type but keeps the valid ones", () => {
    const s = parseSiteSchema({
      ...valid,
      blocks: [
        { id: "a", type: "hero", variant: "HeroPremium1", props: {} },
        { id: "bad", type: "xxx", variant: "HeroPremium1", props: {} },
      ],
    })!;
    expect(s.blocks).toHaveLength(1);
    expect(s.blocks[0].type).toBe("hero");
  });

  it("coerces missing props to an object and fills a default brand", () => {
    const s = parseSiteSchema({ blocks: [{ type: "hero", variant: "HeroPremium1" }] })!;
    expect(s.blocks[0].props).toEqual({});
    expect(typeof s.brand.name).toBe("string");
    expect(s.brand.name.length).toBeGreaterThan(0);
  });
});
