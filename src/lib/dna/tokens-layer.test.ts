import { describe, it, expect } from "vitest";
import type { SiteAnalysis } from "@/lib/generation/types";
import type { MeasuredTokens } from "@/lib/measure/tokens";
import { runPipeline } from "@/lib/generation/pipeline";
import { resolveTree } from "./resolver";
import { tokensLayer } from "./candidates";

function makeTokens(overrides: Partial<MeasuredTokens> = {}): MeasuredTokens {
  return {
    palette: {
      surface: { value: "#faf6f2", confidence: 0.9, origin: "measure/tokens.ts#surface@1440" },
      accent: { value: "#b4552d", confidence: 0.8, origin: "measure/tokens.ts#accent@1440" },
    },
    typography: {
      displayFont: { value: "Fraunces", confidence: 0.95, origin: "measure/tokens.ts#displayFont@1440" },
      headingWeight: { value: 600, confidence: 0.95, origin: "measure/tokens.ts#headingWeight@1440" },
      tracking: { value: "-0.024em", confidence: 0.85, origin: "measure/tokens.ts#tracking@1440" },
      displayClamp: { value: "clamp(44px, 24.7px + 4.95vw, 96px)", confidence: 0.85, origin: "measure/tokens.ts#displayClamp@390+1440" },
    },
    spacing: {
      spacingMultiplier: { value: 1.5, confidence: 0.8, origin: "measure/tokens.ts#spacingMultiplier@1440" },
      containerWidth: { value: 1240, confidence: 0.7, origin: "measure/tokens.ts#containerWidth@1440" },
    },
    surfaces: {
      cardRadius: { value: 12, confidence: 0.75, origin: "measure/tokens.ts#cardRadius@1440" },
      cardShadow: { value: "rgba(0,0,0,0.08) 0px 8px 32px 0px", confidence: 0.7, origin: "measure/tokens.ts#cardShadow@1440" },
      buttonRadius: { value: 9999, confidence: 0.9, origin: "measure/tokens.ts#buttonRadius@1440" },
    },
    cssVariables: {},
    fonts: [],
    prefersDark: { value: false, confidence: 0.9, origin: "measure/tokens.ts#prefersDark@1440" },
    coverage: { nodesUsed: 40, viewportsUsed: [390, 1440], notes: [] },
    ...overrides,
  };
}

function makeAnalysis(overrides: Partial<SiteAnalysis> = {}): SiteAnalysis {
  return {
    url: "https://atelier.example",
    brandName: "Atelier Lumière",
    industry: "architect",
    industryLabel: "Architecture",
    fetched: true,
    confidence: "full",
    detectedSections: [],
    navItems: ["Studio", "Projets"],
    extractedContent: {
      headline: "Espaces qui respirent",
      description: "Architecture contemporaine.",
      services: ["Résidentiel", "Tertiaire"],
      images: ["https://x/1.jpg"],
      heroImageUrl: "https://x/1.jpg",
      contact: { email: "studio@atelier.example" },
    },
    scores: { design: 60, performance: 70, seo: 65, mobile: 75, accessibility: 60 },
    issues: [],
    ...overrides,
  };
}

describe("tokensLayer", () => {
  it("maps measured tokens onto DNA fields with per-field confidence and origin", () => {
    const layer = tokensLayer(makeTokens())!;
    expect(layer.source).toBe("measured");
    expect(layer.fieldConfidence!["typeScale.display"]).toBe(0.85);
    expect(layer.fieldOrigin!["typeScale.display"]).toContain("displayClamp");
    expect(layer.fieldConfidence!["rhythm.spacingMultiplier"]).toBe(0.8);
    expect((layer.data as { ctaDirection: { style: string } }).ctaDirection.style).toBe("pill");
    expect((layer.data as { contentMaxWidth: string }).contentMaxWidth).toBe("1240px");
  });

  it("returns undefined without tokens or with an empty measurement", () => {
    expect(tokensLayer(undefined)).toBeUndefined();
    expect(
      tokensLayer(makeTokens({
        typography: {}, spacing: {}, surfaces: {}, prefersDark: undefined,
      }))
    ).toBeUndefined();
  });
});

describe("runPipeline with measured tokens (C4 end to end)", () => {
  it("the measured fluid display scale reaches the DNA", () => {
    const result = runPipeline(makeAnalysis({ measuredTokens: makeTokens() }));
    expect(result.dna.typeScale.display).toBe("clamp(44px, 24.7px + 4.95vw, 96px)");
    expect(result.dna.typeScale.headingWeight).toBe(600);
    expect(result.dna.cardSystem.radius).toBe("12px");
    expect(result.dna.rhythm.spacingMultiplier).toBe(1.5);
    expect(result.dna.contentMaxWidth).toBe("1240px");

    const entry = result.trace.find((t) => t.field === "typeScale.display")!;
    expect(entry.chosen.source).toBe("measured");
    expect(entry.chosen.origin).toContain("displayClamp");
  });

  it("A2 per field: ONE weak measurement is demoted without dragging the others down", () => {
    const tokens = makeTokens();
    tokens.spacing.spacingMultiplier = {
      value: 1, confidence: 0.2, origin: "measure/tokens.ts#spacingMultiplier@sparse",
    };
    const result = runPipeline(makeAnalysis({ measuredTokens: tokens }));

    // The weak field loses to the curated moodboard value…
    const spacing = result.trace.find((t) => t.field === "rhythm.spacingMultiplier")!;
    expect(spacing.chosen.source).not.toBe("measured");
    expect(spacing.rejected.some((r) => r.source === "measured" && r.confidence === 0.2)).toBe(true);
    // …while confident fields keep winning (per-field, not per-layer).
    expect(result.dna.typeScale.headingWeight).toBe(600);
  });

  it("resolver honours fieldConfidence/fieldOrigin overrides generically", () => {
    const res = resolveTree(
      { data: { a: 0, b: 0 }, source: "preset", origin: "p" },
      [{
        data: { a: 1, b: 2 },
        source: "measured",
        origin: "layer-origin",
        fieldConfidence: { a: 0.3 },   // weak → demoted below curated
        fieldOrigin: { a: "field-origin-a" },
      },
      { data: { a: 9 }, source: "curated", origin: "c" }]
    );
    expect(res.value).toEqual({ a: 9, b: 2 });
    expect(res.slots.get("a")!.rejected.find((r) => r.source === "measured")!.origin).toBe("field-origin-a");
    expect(res.slots.get("b")!.chosen.origin).toBe("layer-origin");
  });
});
