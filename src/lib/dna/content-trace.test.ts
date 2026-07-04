import { describe, it, expect } from "vitest";
import type { SiteAnalysis } from "@/lib/generation/types";
import { runPipeline } from "@/lib/generation/pipeline";
import { planSmart } from "@/lib/generation/planner";
import { heroCtaLabel, type SceneMeasurement } from "@/lib/measure/scenes";

function makeAnalysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://atelier.fr",
    brandName: "Atelier Lumière",
    industry: "artisan",
    industryLabel: "Artisan",
    fetched: true,
    confidence: "full",
    detectedSections: [],
    navItems: ["Atelier"],
    structure: {
      nav: ["Atelier"],
      sections: [
        { type: "hero", order: 0, confidence: 0.9 },
        { type: "services", order: 1, confidence: 0.8, label: "Nos savoir-faire" },
      ],
    },
    extractedContent: {
      headline: "Menuiserie d'art",
      description: "Bois massif.",
      language: "fr",
      ctaLabel: "Discuter de votre projet",
      services: ["Agencement"],
      images: ["https://x/1.jpg"],
      contact: { email: "a@b.fr" },
    },
    scores: { design: 60, performance: 70, seo: 65, mobile: 75, accessibility: 60 },
    issues: [],
    ...overrides,
  };
}

describe("F14 — the plan never lies about the FAQ", () => {
  it("no real FAQ → no FAQ slot, no 'Added an FAQ' recommendation", () => {
    const plan = planSmart(undefined, undefined, { hasFaq: false });
    expect(plan.slots.some((s) => s.category === "faq")).toBe(false);
    expect(plan.recommendations.some((r) => r.action.includes("FAQ"))).toBe(false);
    // industry flow branch too
    const flowPlan = planSmart(undefined, "artisan", { hasFaq: false });
    expect(flowPlan.slots.some((s) => s.category === "faq")).toBe(false);
  });

  it("real FAQ (or unknown) → behavior unchanged (V5 compat)", () => {
    const withFaq = planSmart(undefined, "artisan", { hasFaq: true });
    expect(withFaq.slots.some((s) => s.category === "faq")).toBe(true);
    const legacy = planSmart(undefined, "artisan"); // no opts: V5 callers
    expect(legacy.slots.some((s) => s.category === "faq")).toBe(true);
  });

  it("end to end: pipeline emits no FAQ slot AND no FAQ recommendation without real items", () => {
    const result = runPipeline(makeAnalysis());
    expect(result.schema.blocks.some((b) => b.type === "faq")).toBe(false);
    expect(result.schema.recommendations?.some((r) => r.action.includes("FAQ"))).toBe(false);
  });
});

describe("F16 — measured hero CTA", () => {
  it("returns the hero scene's first CTA as a MeasuredValue", () => {
    const m: SceneMeasurement = {
      viewport: 1440,
      notes: [],
      scenes: [
        {
          path: "section:nth-of-type(1)", order: 0, type: "hero",
          typeConfidence: 0.9, typeReason: "test",
          bounds: { rect: { x: 0, y: 0, width: 1440, height: 800 }, viewportRatio: 0.89, fullBleed: true },
          background: { kind: "color", color: "rgb(255,255,255)", hasImage: false },
          media: [], ctas: [{ label: "Réserver une visite", radiusPx: 9999, path: "a:nth-of-type(1)" }],
          density: { childCount: 3, mediaCount: 0 },
        },
      ],
    };
    expect(heroCtaLabel(m)).toMatchObject({ value: "Réserver une visite", confidence: 0.9 });
    expect(heroCtaLabel({ viewport: 0, notes: [], scenes: [] })).toBeUndefined();
  });
});

describe("F15 — content provenance in the trace", () => {
  const result = runPipeline(makeAnalysis());

  it("language: measured French beats the English fallback, both visible", () => {
    const entry = result.trace.find((t) => t.field === "content.language")!;
    expect(entry.chosen).toMatchObject({ source: "measured", value: '"fr"' });
    expect(entry.rejected.some((r) => r.source === "preset" && r.value === '"en"')).toBe(true);
  });

  it("headings: the real heading wins, the localized label is archived", () => {
    const entry = result.trace.find((t) => t.field === "content.heading.services")!;
    expect(entry.chosen.source).toBe("measured");
    expect(entry.chosen.value).toContain("Nos savoir-faire");
    expect(entry.rejected[0].value).toContain("Nos services"); // label(services, fr)
  });

  it("CTA: the real copy wins over the industry preset", () => {
    const entry = result.trace.find((t) => t.field === "content.cta")!;
    expect(entry.chosen.source).toBe("measured");
    expect(entry.chosen.value).toContain("Discuter de votre projet");
    expect(entry.rejected.some((r) => r.source === "preset")).toBe(true);
  });

  it("without detection, the preset fallback is the traced choice (honest)", () => {
    const english = runPipeline(makeAnalysis({
      structure: undefined,
      extractedContent: { ...makeAnalysis().extractedContent, language: undefined, ctaLabel: undefined },
    }));
    const langEntry = english.trace.find((t) => t.field === "content.language")!;
    expect(langEntry.chosen.source).toBe("preset");
    const ctaEntry = english.trace.find((t) => t.field === "content.cta")!;
    expect(ctaEntry.chosen.source).toBe("preset");
  });
});
