import { describe, it, expect } from "vitest";
import { detectStructure, renderableCategory } from "./structure";

describe("detectStructure", () => {
  it("anchors hero first and footer last", () => {
    const s = detectStructure({
      headings: ["Welcome", "Our Services", "Reviews"],
      nav: [],
      hasForm: false,
      hasFooter: true,
    });
    expect(s.sections[0].type).toBe("hero");
    expect(s.sections[s.sections.length - 1].type).toBe("footer");
  });

  it("classifies headings and preserves their source order", () => {
    const s = detectStructure({
      headings: ["Hi", "Our Services", "Frequently Asked Questions"],
      nav: [],
      hasForm: false,
      hasFooter: false,
    });
    const types = s.sections.map((x) => x.type);
    expect(types).toContain("services");
    expect(types).toContain("faq");
    expect(types.indexOf("services")).toBeLessThan(types.indexOf("faq"));
  });

  it("adds a contact section when a form is present", () => {
    const s = detectStructure({ headings: ["Hi"], nav: [], hasForm: true, hasFooter: false });
    expect(s.sections.some((x) => x.type === "contact")).toBe(true);
  });

  it("collapses consecutive duplicate sections", () => {
    const s = detectStructure({
      headings: ["Hi", "Our work", "Projects"],
      nav: [],
      hasForm: false,
      hasFooter: false,
    });
    expect(s.sections.filter((x) => x.type === "portfolio")).toHaveLength(1);
  });

  it("picks up sections from nav labels the headings missed", () => {
    const s = detectStructure({ headings: ["Hi"], nav: ["Pricing"], hasForm: false, hasFooter: false });
    expect(s.sections.some((x) => x.type === "pricing")).toBe(true);
  });
});

describe("renderableCategory", () => {
  it("keeps types that have a dedicated component", () => {
    for (const t of ["hero", "services", "portfolio", "stats", "about", "footer"] as const) {
      expect(renderableCategory(t)).toBe(t);
    }
  });

  it("maps visual types to portfolio and the rest to features", () => {
    expect(renderableCategory("products")).toBe("portfolio");
    expect(renderableCategory("gallery")).toBe("portfolio");
    expect(renderableCategory("logos")).toBe("features");
    expect(renderableCategory("pricing")).toBe("features");
  });
});
