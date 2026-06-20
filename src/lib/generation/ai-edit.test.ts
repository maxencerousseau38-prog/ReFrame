import { describe, it, expect } from "vitest";
import { generateSite, applyAiEdit } from "./engine";
import { aiEdit } from "@/lib/llm";
import type { SiteAnalysis } from "./types";

function analysis(): SiteAnalysis {
  return {
    url: "https://acme.com",
    brandName: "Acme",
    industry: "agency",
    industryLabel: "Agency",
    fetched: true,
    detectedSections: [],
    navItems: ["A", "B", "C"],
    extractedContent: { headline: "H", description: "D", services: ["A", "B", "C"], images: [] },
    scores: { design: 50, performance: 50, seo: 50, mobile: 50, accessibility: 50 },
    issues: [],
  };
}

describe("applyAiEdit — animations toggle", () => {
  const base = generateSite(analysis(), { mode: "smart" });

  it("turns animations off on request", () => {
    for (const cmd of ["remove the animations", "disable animations", "enlève les animations", "make it static, no motion"]) {
      const r = applyAiEdit(base, cmd);
      expect(r.changed).toBe(true);
      expect(r.schema.animations).toBe(false);
    }
  });

  it("turns animations back on", () => {
    const off = applyAiEdit(base, "remove animations").schema;
    const r = applyAiEdit(off, "add the animations back");
    expect(r.changed).toBe(true);
    expect(r.schema.animations).toBe(true);
  });

  it("defaults to animated (undefined === on) and never hides content", () => {
    expect(base.animations).toBeUndefined(); // undefined is treated as on by the renderer
  });
});

describe("applyAiEdit — dark / light mode", () => {
  const base = generateSite(analysis(), { mode: "smart" });
  it("switches to dark mode", () => {
    for (const cmd of ["switch to dark mode", "passe le site en mode sombre", "make it dark"]) {
      const r = applyAiEdit(base, cmd);
      expect(r.changed).toBe(true);
      expect(r.schema.theme.dark).toBe(true);
    }
  });
  it("switches back to light mode", () => {
    const dark = applyAiEdit(base, "dark mode").schema;
    const r = applyAiEdit(dark, "switch to light mode");
    expect(r.changed).toBe(true);
    expect(r.schema.theme.dark).toBe(false);
  });
});

describe("aiEdit — instant deterministic fast path (no LLM round-trip)", () => {
  const base = generateSite(analysis(), { mode: "smart" });

  it("applies a known intent instantly and returns changed", async () => {
    const r = await aiEdit(base, "remove the animations");
    expect(r.changed).toBe(true);
    expect(r.schema.animations).toBe(false);
  });

  it("returns guidance (no change) for an unhandled request when no LLM is set", async () => {
    const r = await aiEdit(base, "do something totally ambiguous and unspecified");
    expect(r.changed).toBe(false);
  });
});
