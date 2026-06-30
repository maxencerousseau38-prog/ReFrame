import { describe, it, expect } from "vitest";
import { analyzeCss } from "../css-analyzer";
import type { V7AnalysisContext } from "../types";
import type { RawPage } from "@/lib/scraping/types";

/* -------------------------------------------------------------------------- */
/*  Test fixture builder                                                      */
/* -------------------------------------------------------------------------- */

function makeCtx(css: string, html = "<html><body></body></html>"): V7AnalysisContext {
  return {
    rawPage: { url: "https://example.com", finalUrl: "https://example.com", html, mode: "static", httpStatus: 200, responseHeaders: {}, blocked: false, challengeDetected: false, timings: { fetchMs: 0, totalMs: 0 } } as RawPage,
    inlineCSS: css,
    externalCSS: "",
    allCSS: css,
    platform: "custom",
    hasPlaywrightData: false,
  };
}

/* -------------------------------------------------------------------------- */
/*  Custom properties                                                         */
/* -------------------------------------------------------------------------- */

describe("CSSAnalyzer — custom properties", () => {
  it("extracts CSS custom properties from :root", () => {
    const ctx = makeCtx(`:root { --brand: #1a1a2e; --spacing-base: 8px; --font-size-lg: 1.5rem; }`);
    const result = analyzeCss(ctx);
    expect(result.customProperties["brand"]).toBe("#1a1a2e");
    expect(result.customProperties["spacing-base"]).toBe("8px");
    expect(result.hasCustomProperties).toBe(true);
  });

  it("extracts dark-mode custom property bucket", () => {
    const ctx = makeCtx(`
      :root { --bg: #ffffff; --text: #000000; }
      [data-theme="dark"] { --bg: #0a0a0a; --text: #f0f0f0; }
    `);
    const result = analyzeCss(ctx);
    expect(result.customPropertyThemes.default["bg"]).toBe("#ffffff");
    expect(result.customPropertyThemes.dark["bg"]).toBe("#0a0a0a");
  });

  it("reports hasCustomProperties: false when none present", () => {
    const ctx = makeCtx(`body { color: black; }`);
    const result = analyzeCss(ctx);
    expect(result.hasCustomProperties).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Typography                                                                */
/* -------------------------------------------------------------------------- */

describe("CSSAnalyzer — typography", () => {
  it("extracts font families from font-family declarations", () => {
    const ctx = makeCtx(`
      h1 { font-family: "Inter Display", Inter, sans-serif; }
      body { font-family: Inter, system-ui, sans-serif; }
    `);
    const result = analyzeCss(ctx);
    expect(result.fontFamilies).toContain("Inter Display");
    expect(result.fontFamilies).toContain("Inter");
  });

  it("extracts font weights", () => {
    const ctx = makeCtx(`h1 { font-weight: 700; } p { font-weight: 400; } .label { font-weight: 500; }`);
    const result = analyzeCss(ctx);
    expect(result.fontWeights).toContain(700);
    expect(result.fontWeights).toContain(400);
    expect(result.fontWeights).toContain(500);
    expect(result.fontWeights).toEqual([400, 500, 700]);
  });

  it("extracts font sizes in px", () => {
    const ctx = makeCtx(`h1 { font-size: 56px; } h2 { font-size: 36px; } p { font-size: 16px; }`);
    const result = analyzeCss(ctx);
    const pxSizes = result.fontSizes.filter((s) => s.unit === "px").map((s) => s.value);
    expect(pxSizes).toContain(56);
    expect(pxSizes).toContain(16);
  });

  it("detects clamp() fluid type usage", () => {
    const ctx = makeCtx(`h1 { font-size: clamp(2rem, 5vw, 4rem); }`);
    const result = analyzeCss(ctx);
    expect(result.hasClamp).toBe(true);
  });

  it("detects letter spacing values", () => {
    const ctx = makeCtx(`h1 { letter-spacing: -0.022em; } .label { letter-spacing: 0.1em; }`);
    const result = analyzeCss(ctx);
    expect(result.letterSpacings.length).toBeGreaterThan(0);
    expect(result.letterSpacings.some((s) => s.value === -0.022)).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/* -------------------------------------------------------------------------- */

describe("CSSAnalyzer — layout", () => {
  it("detects CSS Grid usage", () => {
    const ctx = makeCtx(`.grid { display: grid; grid-template-columns: repeat(3, 1fr); }`);
    const result = analyzeCss(ctx);
    expect(result.hasCSSGrid).toBe(true);
    expect(result.gridDefinitions.length).toBeGreaterThan(0);
    expect(result.gridDefinitions[0].columnCount).toBe(3);
  });

  it("detects Flexbox usage", () => {
    const ctx = makeCtx(`.flex { display: flex; justify-content: center; align-items: center; }`);
    const result = analyzeCss(ctx);
    expect(result.hasFlexbox).toBe(true);
    expect(result.flexboxUsage.justifyContent).toContain("center");
    expect(result.flexboxUsage.alignItems).toContain("center");
  });

  it("detects border radius values", () => {
    const ctx = makeCtx(`.pill { border-radius: 9999px; } .card { border-radius: 12px; }`);
    const result = analyzeCss(ctx);
    expect(result.borderRadii).toContain(9999);
    expect(result.borderRadii).toContain(12);
  });

  it("detects z-index levels", () => {
    const ctx = makeCtx(`nav { z-index: 100; } .modal { z-index: 1000; }`);
    const result = analyzeCss(ctx);
    expect(result.zIndexLevels).toContain(100);
    expect(result.zIndexLevels).toContain(1000);
  });
});

/* -------------------------------------------------------------------------- */
/*  Motion                                                                    */
/* -------------------------------------------------------------------------- */

describe("CSSAnalyzer — motion", () => {
  it("extracts transition info", () => {
    const ctx = makeCtx(`a { transition: color 0.16s ease, transform 0.2s cubic-bezier(.25,.46,.45,.94); }`);
    const result = analyzeCss(ctx);
    expect(result.transitions.length).toBeGreaterThan(0);
    expect(result.transitions[0].durationMs).toBe(160);
    expect(result.transitions[0].property).toBe("color");
  });

  it("extracts keyframe names and classifies roles", () => {
    const ctx = makeCtx(`
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
    `);
    const result = analyzeCss(ctx);
    const fadeKf = result.keyframes.find((k) => k.name === "fadeIn");
    const slideKf = result.keyframes.find((k) => k.name === "slideUp");
    expect(fadeKf?.role).toBe("fade");
    expect(slideKf?.role).toBe("slide");
  });

  it("detects scroll-driven animation", () => {
    const ctx = makeCtx(`.hero { animation-timeline: scroll(); animation-range: 0% 100%; }`);
    const result = analyzeCss(ctx);
    expect(result.hasScrollDrivenAnimation).toBe(true);
  });

  it("detects scroll snap", () => {
    const ctx = makeCtx(`.scroll { scroll-snap-type: y mandatory; }`);
    const result = analyzeCss(ctx);
    expect(result.hasScrollSnap).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  Responsive                                                                */
/* -------------------------------------------------------------------------- */

describe("CSSAnalyzer — responsive", () => {
  it("extracts media query breakpoints", () => {
    const ctx = makeCtx(`
      @media (min-width: 768px) { .col { width: 50%; } }
      @media (min-width: 1280px) { .col { width: 25%; } }
    `);
    const result = analyzeCss(ctx);
    const breakpoints = result.mediaQueries.map((mq) => mq.valuePx).filter(Boolean);
    expect(breakpoints).toContain(768);
    expect(breakpoints).toContain(1280);
  });

  it("detects container queries", () => {
    const ctx = makeCtx(`@container sidebar (inline-size > 300px) { .card { display: flex; } }`);
    const result = analyzeCss(ctx);
    expect(result.hasContainerQueries).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  Framework detection                                                       */
/* -------------------------------------------------------------------------- */

describe("CSSAnalyzer — framework detection", () => {
  it("detects Tailwind from @tailwind directive", () => {
    const ctx = makeCtx(`@tailwind base; @tailwind components; @tailwind utilities;`);
    const result = analyzeCss(ctx);
    expect(result.cssFramework).toBe("tailwind");
  });

  it("detects Tailwind from class names in HTML", () => {
    const ctx = makeCtx(`body { }`, `<div class="flex items-center gap-4 text-xl font-bold"></div>`);
    const result = analyzeCss(ctx);
    expect(result.cssFramework).toBe("tailwind");
  });

  it("reports 'none' for plain CSS", () => {
    const ctx = makeCtx(`body { font-family: Inter; color: #000; } h1 { font-size: 48px; }`);
    const result = analyzeCss(ctx);
    expect(result.cssFramework).toBe("none");
  });
});

/* -------------------------------------------------------------------------- */
/*  Determinism                                                               */
/* -------------------------------------------------------------------------- */

describe("CSSAnalyzer — correctness", () => {
  it("never throws on empty CSS", () => {
    expect(() => analyzeCss(makeCtx(""))).not.toThrow();
  });

  it("never throws on malformed CSS", () => {
    expect(() => analyzeCss(makeCtx("{{{{ not valid css !! @@@"))).not.toThrow();
  });

  it("is deterministic — same input produces same output", () => {
    const ctx = makeCtx(`h1 { font-size: 48px; font-weight: 700; } body { font-family: Inter; }`);
    const a = analyzeCss(ctx);
    const b = analyzeCss(ctx);
    expect(a).toEqual(b);
  });
});
