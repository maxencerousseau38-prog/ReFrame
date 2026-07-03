import { describe, it, expect } from "vitest";
import { collectSnapshot, COMPUTED_PROPS, SNAPSHOT_LIMITS } from "./snapshot";
import { renderCapture } from "./render";

describe("collectSnapshot (serializability contract)", () => {
  it("is fully self-contained: no import/require/outer closure references", () => {
    const src = collectSnapshot.toString();
    // Playwright serializes the function into the page: any module reference
    // would throw at runtime inside the browser. Guard it statically.
    expect(src).not.toMatch(/\brequire\s*\(/);
    expect(src).not.toMatch(/\bimport\s*\(/);
    expect(src).not.toMatch(/__vite|__commonJS|exports\./);
    // It must not reference the module-scope constants either — they are
    // passed as arguments.
    expect(src).not.toContain("COMPUTED_PROPS");
    expect(src).not.toContain("SNAPSHOT_LIMITS");
  });

  it("exposes the fixed computed-props subset from the spec", () => {
    // Anchors of each family — a removal would silently blind MEASURE.
    for (const p of [
      "color",
      "backgroundColor",
      "fontFamily",
      "fontSize",
      "letterSpacing",
      "paddingTop",
      "borderRadius",
      "boxShadow",
      "gridTemplateColumns",
      "transitionDuration",
      "transform",
    ]) {
      expect(COMPUTED_PROPS).toContain(p);
    }
    expect(COMPUTED_PROPS.length).toBeGreaterThanOrEqual(35);
  });

  it("keeps the spec caps", () => {
    expect(SNAPSHOT_LIMITS.maxBlocks).toBe(80);
    expect(SNAPSHOT_LIMITS.maxNodes).toBe(400);
    expect(SNAPSHOT_LIMITS.maxCssVariables).toBe(200);
    expect(SNAPSHOT_LIMITS.minBlockHeight).toBe(40);
  });
});

describe("renderCapture (no-browser degradation)", () => {
  it("returns null under Vitest (hermetic guard) instead of throwing", async () => {
    // browser.ts refuses to launch under VITEST without AUDIT — Tier 2 must
    // degrade to null so the orchestrator falls back to Tier 1, traced.
    const result = await renderCapture("https://example.com");
    expect(result).toBeNull();
  });
});
