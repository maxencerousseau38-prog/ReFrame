import { describe, it, expect } from "vitest";
import type { SiteAnalysis } from "./types";
import type { MeasuredTokens } from "@/lib/measure/tokens";
import { runPipeline } from "./pipeline";
import { tokenVarOverrides } from "@/lib/dna/tokens";

function measured(): MeasuredTokens {
  return {
    palette: {
      surface: { value: "#faf6f2", confidence: 0.9, origin: "measure/tokens.ts#surface@1440" },
      ink: { value: "#1c1310", confidence: 0.9, origin: "measure/tokens.ts#ink@1440" },
      accent: { value: "#b4552d", confidence: 0.8, origin: "measure/tokens.ts#accent@1440" },
    },
    typography: {
      displayFont: { value: "Fraunces", confidence: 0.95, origin: "measure/tokens.ts#displayFont@1440" },
      bodyFont: { value: "Inter", confidence: 0.9, origin: "measure/tokens.ts#bodyFont@1440" },
    },
    spacing: {},
    surfaces: {},
    cssVariables: {},
    fonts: [
      { family: "Fraunces", weight: "600", style: "normal", src: "https://cdn.x/fraunces.woff2", status: "loaded" },
    ],
    prefersDark: { value: false, confidence: 0.9, origin: "measure/tokens.ts#prefersDark@1440" },
    coverage: { nodesUsed: 40, viewportsUsed: [390, 1440], notes: [] },
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
    brand: { accentColor: "#0055ff" }, // extraction hint — the measurement must win
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

describe("compose with measured tokens (C5 end to end)", () => {
  const withTokens = runPipeline(makeAnalysis({ measuredTokens: measured() }));
  const without = runPipeline(makeAnalysis());

  it("the REAL palette reaches the theme — deriveScheme demoted to fallback", () => {
    expect(withTokens.schema.theme.surface).toBe("#faf6f2");
    expect(withTokens.schema.theme.ink).toBe("#1c1310");
    expect(withTokens.schema.theme.primary).toBe("#1c1310");
  });

  it("the measured accent outranks the extraction hint and the industry preset", () => {
    expect(withTokens.schema.theme.accent).toBe("#b4552d");
    expect(without.schema.theme.accent).toBe("#0055ff"); // hint keeps winning without measures
  });

  it("compiled tokens travel on the schema: --rf-* vars, real fonts, @font-face", () => {
    const tokens = withTokens.schema.tokens!;
    expect(tokens).toBeDefined();
    expect(tokens.vars["--rf-text-display"]).toBeTruthy();
    expect(tokens.fontFamilies.display).toBe("Fraunces, Georgia, serif");
    expect(tokens.fontFaceCss).toContain('font-family:"Fraunces"');

    const overrides = tokenVarOverrides(tokens);
    expect(overrides["--brand-font"]).toBe("Inter, system-ui, -apple-system, sans-serif");
    expect(overrides["--rf-font-display"]).toContain("Fraunces");
  });

  it("V5 compatibility: no measurements → tokens carry DNA --rf-* vars, PALETTE untouched", () => {
    // A1 enabler: --rf-* composition vars are emitted for every site so the
    // DNA's rhythm/container/type-scale can reach the renderer. But the
    // measured PALETTE/fonts patch stays gated on a real capture (fill-only).
    expect(without.schema.tokens).toBeDefined();
    expect(without.schema.tokens!.vars["--rf-space-section"]).toBeTruthy();
    expect(without.schema.tokens!.fontFaceCss).toBe(""); // no measured fonts
    expect(without.schema.theme.surface).toBeUndefined(); // deriveScheme keeps the role (no palette patch)
    expect(without.schema.theme.ink).toBeUndefined();
    expect(tokenVarOverrides(undefined)).toEqual({});
  });
});
