import { describe, it, expect } from "vitest";
import { planClassic, planPreserve, planSmart } from "./planner";
import type { BlockType, SiteStructure } from "./types";

const CANONICAL = ["hero", "features", "testimonials", "faq", "cta", "contact", "footer"];

function struct(types: BlockType[]): SiteStructure {
  return { sections: types.map((t, i) => ({ type: t, order: i + 1, confidence: 0.9 })), nav: [] };
}

describe("planClassic", () => {
  it("emits the canonical structure", () => {
    expect(planClassic().slots.map((s) => s.type)).toEqual(CANONICAL);
  });
});

describe("planPreserve", () => {
  it("falls back to classic for missing or thin structures", () => {
    expect(planPreserve(undefined).slots.map((s) => s.type)).toEqual(CANONICAL);
    expect(planPreserve(struct(["hero", "footer"])).slots.map((s) => s.type)).toEqual(CANONICAL);
  });

  it("falls back to classic when there's no real content section to preserve", () => {
    // hero + contact + footer is a near-empty stub (the casselin/manutan case):
    // build the full canonical page instead.
    expect(planPreserve(struct(["hero", "contact", "footer"])).slots.map((s) => s.type)).toEqual(
      CANONICAL
    );
  });

  it("preserves as soon as there is one genuine content section", () => {
    const p = planPreserve(struct(["hero", "about", "footer"]));
    expect(p.slots.map((s) => s.type)).toEqual(["hero", "about", "footer"]);
  });

  it("keeps the client's order with hero first and footer last", () => {
    const p = planPreserve(struct(["hero", "about", "services", "portfolio", "footer"]));
    expect(p.slots.map((s) => s.type)).toEqual(["hero", "about", "services", "portfolio", "footer"]);
    expect(p.recommendations).toHaveLength(0);
  });

  it("re-anchors hero and footer even if the source lists them out of place", () => {
    const p = planPreserve(struct(["services", "hero", "footer", "about"]));
    expect(p.slots[0].type).toBe("hero");
    expect(p.slots[p.slots.length - 1].type).toBe("footer");
  });
});

describe("planSmart", () => {
  it("adds conversion sections and records why", () => {
    const p = planSmart(struct(["hero", "about", "footer"]));
    const cats = p.slots.map((s) => s.category);
    expect(cats).toContain("features");
    expect(cats).toContain("cta");
    expect(cats).toContain("contact");
    // Smart never injects a testimonials section (we don't fabricate praise).
    expect(cats).not.toContain("testimonials");
    expect(p.recommendations.length).toBeGreaterThan(0);
    expect(p.slots[0].type).toBe("hero");
    expect(p.slots[p.slots.length - 1].type).toBe("footer");
  });
});
