import { describe, it, expect } from "vitest";
import type { MeasuredTokens } from "@/lib/measure/tokens";
import { compileDNA } from "@/lib/generation/dna";
import { analyzeBusinessProfile } from "@/lib/generation/business";
import type { SiteAnalysis } from "@/lib/generation/types";
import { compileTokens, TOKEN_CONFIDENCE_FLOOR } from "./tokens";

function dnaFixture() {
  const analysis: SiteAnalysis = {
    url: "https://x.example", brandName: "X", industry: "architect", industryLabel: "Architecture",
    fetched: true, detectedSections: [], navItems: [],
    extractedContent: {
      headline: "H", description: "D", services: ["a"], images: [],
    },
    scores: { design: 60, performance: 70, seo: 60, mobile: 70, accessibility: 60 },
    issues: [],
  };
  const profile = analyzeBusinessProfile(analysis, "elegant");
  return compileDNA({
    profile, industry: "architect", mood: "elegant", font: "serif",
    hasImages: true, hasTestimonials: false, hasStats: false, sourceDark: false,
  });
}

function measuredFixture(): MeasuredTokens {
  return {
    palette: {
      surface: { value: "#faf6f2", confidence: 0.9, origin: "measure/tokens.ts#surface@1440" },
      surface2: { value: "#1c1310", confidence: 0.7, origin: "measure/tokens.ts#surface2@1440" },
      ink: { value: "#1c1310", confidence: 0.9, origin: "measure/tokens.ts#ink@1440" },
      accent: { value: "#b4552d", confidence: 0.8, origin: "measure/tokens.ts#accent@1440" },
      border: { value: "#e8ddd2", confidence: 0.6, origin: "measure/tokens.ts#border@1440" },
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
      { family: "Inter", weight: "100 900", style: "normal", src: "https://cdn.x/inter-var.woff2", status: "declared" },
      { family: "Unused Face", weight: "400", style: "normal", src: "https://cdn.x/unused.woff2", status: "declared" },
      { family: "NoSrc", weight: "400", style: "normal", src: null, status: "loaded" },
    ],
    prefersDark: { value: false, confidence: 0.9, origin: "measure/tokens.ts#prefersDark@1440" },
    coverage: { nodesUsed: 40, viewportsUsed: [390, 1440], notes: [] },
  };
}

describe("compileTokens — measured palette → Theme (fill-only)", () => {
  const compiled = compileTokens(dnaFixture(), measuredFixture());

  it("maps the measured roles onto the existing optional Theme fields", () => {
    expect(compiled.themePatch).toMatchObject({
      surface: "#faf6f2",
      surface2: "#1c1310",
      ink: "#1c1310",
      primary: "#1c1310", // real heading colour = the site's ink
      accent: "#b4552d",
      dark: false,
    });
    expect(compiled.sources["theme.surface"]).toBe("measured");
  });

  it("filters roles below the A2 confidence floor — deriveScheme keeps them", () => {
    const weak = measuredFixture();
    weak.palette.surface = { value: "#123456", confidence: TOKEN_CONFIDENCE_FLOOR - 0.01, origin: "o" };
    const out = compileTokens(dnaFixture(), weak);
    expect(out.themePatch.surface).toBeUndefined();
    expect(out.themePatch.ink).toBe("#1c1310"); // confident roles still land
  });
});

describe("compileTokens — real fonts", () => {
  const compiled = compileTokens(dnaFixture(), measuredFixture());

  it("exact families with coherent fallback stacks (serif detected on Fraunces)", () => {
    expect(compiled.fontFamilies.display).toBe("Fraunces, Georgia, serif");
    expect(compiled.fontFamilies.body).toBe("Inter, system-ui, -apple-system, sans-serif");
    expect(compiled.vars["--rf-font-display"]).toBe("Fraunces, Georgia, serif");
  });

  it("emits @font-face only for USED families with a real src", () => {
    expect(compiled.fontFaceCss).toContain('font-family:"Fraunces"');
    expect(compiled.fontFaceCss).toContain('font-weight:100 900'); // variable range kept
    expect(compiled.fontFaceCss).toContain("font-display:swap");
    expect(compiled.fontFaceCss).not.toContain("Unused Face");
    expect(compiled.fontFaceCss).not.toContain("NoSrc");
  });
});

describe("compileTokens — --rf-* vars from the resolved DNA", () => {
  it("compiles typography/spacing/radius/shadow/motion into variables", () => {
    const dna = dnaFixture();
    const compiled = compileTokens(dna, measuredFixture());
    expect(compiled.vars["--rf-text-display"]).toBe(dna.typeScale.display);
    expect(compiled.vars["--rf-heading-weight"]).toBe(String(dna.typeScale.headingWeight));
    expect(compiled.vars["--rf-space-section"]).toBe(`${Math.round(80 * dna.rhythm.spacingMultiplier)}px`);
    expect(compiled.vars["--rf-radius-card"]).toBe(dna.cardSystem.radius);
    expect(compiled.vars["--rf-container"]).toBe(dna.contentMaxWidth);
    expect(compiled.sources["--rf-text-display"]).toBe("dna");
  });

  it("without measurements: empty patch, no fonts, vars still compiled from DNA", () => {
    const compiled = compileTokens(dnaFixture(), undefined);
    expect(compiled.themePatch).toEqual({});
    expect(compiled.fontFaceCss).toBe("");
    expect(compiled.fontFamilies).toEqual({});
    expect(compiled.vars["--rf-text-display"]).toBeTruthy();
    expect(compiled.vars["--rf-font-body"]).toBeUndefined();
  });
});
