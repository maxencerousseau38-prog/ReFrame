import { describe, it, expect } from "vitest";
import type {
  ComputedNodeStyle,
  RawBlockGeometry,
  RenderedSite,
  ViewportCapture,
} from "@/lib/capture/types";
import { measureTokens, parseColor } from "./tokens";

/* -------------------------------------------------------------------------- */
/*  Synthetic RenderedSite                                                    */
/* -------------------------------------------------------------------------- */

let pathSeq = 0;
function node(
  role: ComputedNodeStyle["role"],
  styles: Record<string, string>,
  rect = { x: 0, y: 0, width: 600, height: 80 },
  tag = role === "heading" ? "h1" : role === "text" ? "p" : role === "action" ? "a" : "section"
): ComputedNodeStyle {
  return { path: `${tag}:nth-of-type(${++pathSeq})`, tag, role, rect, styles };
}

function block(backgroundColor: string, rect: RawBlockGeometry["rect"]): RawBlockGeometry {
  return {
    path: `section:nth-of-type(${++pathSeq})`,
    rect,
    backgroundColor,
    backgroundImage: "none",
    childCount: 3,
    headingText: null,
  };
}

function viewport(
  width: 390 | 768 | 1440,
  nodes: ComputedNodeStyle[],
  blocks: RawBlockGeometry[]
): ViewportCapture {
  return { viewport: width, screenshot: null, nodes, blocks, scrollHeight: 4000 };
}

function site(viewports: ViewportCapture[], extra: Partial<RenderedSite> = {}): RenderedSite {
  return {
    url: "https://x.example",
    capturedAt: "2026-07-03T00:00:00.000Z",
    html: "<html></html>",
    stylesheets: [],
    runtimeCss: [],
    cssVariables: { "--brand": "#b4552d" },
    fonts: [{ family: "Inter Display", weight: "600", style: "normal", src: null, status: "loaded" }],
    viewports,
    animations: [],
    quality: {
      tier: "rendered", html: "rendered", css: "full", cssFetched: 1, cssFailed: [],
      computedSnapshot: true, screenshots: [], fonts: "collected", geometry: true,
      challenge: false, durationMs: 0, notes: [],
    },
    ...extra,
  };
}

/** A plausible measured page: cream surface, dark ink, terracotta CTA. */
function richViewport(width: 390 | 768 | 1440): ViewportCapture {
  const displaySize = width === 1440 ? 96 : 44;
  return viewport(
    width,
    [
      node("block", { paddingTop: "96px", paddingBottom: "96px" }, { x: 0, y: 0, width, height: 800 }),
      node("block", { paddingTop: "128px", paddingBottom: "96px" }, { x: 0, y: 800, width, height: 600 }),
      node("block", { paddingTop: "96px", paddingBottom: "128px" }, { x: 0, y: 1400, width, height: 600 }),
      node("heading", {
        fontFamily: '"Fraunces", serif',
        fontSize: `${displaySize}px`,
        fontWeight: "600",
        letterSpacing: `${-0.024 * displaySize}px`,
        textTransform: "none",
        color: "rgb(28, 19, 16)",
      }, { x: 0, y: 40, width: 700, height: 120 }),
      node("heading", {
        fontFamily: '"Fraunces", serif', fontSize: "40px", fontWeight: "600",
        textTransform: "none", color: "rgb(28, 19, 16)",
      }, { x: 0, y: 900, width: 500, height: 60 }, "h2"),
      node("text", {
        fontFamily: '"Inter", sans-serif', fontSize: "18px", fontWeight: "400",
        color: "rgb(90, 80, 74)",
      }, { x: 0, y: 200, width: 600, height: 120 }),
      node("action", {
        backgroundColor: "rgb(180, 85, 45)", color: "rgb(255, 255, 255)",
        borderRadius: "9999px",
      }, { x: 0, y: 360, width: 220, height: 52 }),
      node("media", { boxShadow: "rgba(0, 0, 0, 0.08) 0px 8px 32px 0px", borderRadius: "12px" }),
    ],
    [
      block("rgb(250, 246, 242)", { x: 0, y: 0, width, height: 2400 }),
      block("rgb(28, 19, 16)", { x: 0, y: 2400, width, height: 400 }),
      block("rgb(250, 246, 242)", { x: (width - Math.min(1240, width)) / 2, y: 100, width: Math.min(1240, width - 40), height: 900 }),
      block("rgb(250, 246, 242)", { x: (width - Math.min(1240, width)) / 2, y: 1100, width: Math.min(1240, width - 40), height: 900 }),
    ]
  );
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("parseColor", () => {
  it("parses rgb/rgba/hex and reports alpha", () => {
    expect(parseColor("rgb(250, 246, 242)")).toEqual({ r: 250, g: 246, b: 242, a: 1 });
    expect(parseColor("rgba(0, 0, 0, 0)")).toMatchObject({ a: 0 });
    expect(parseColor("#b4552d")).toEqual({ r: 180, g: 85, b: 45, a: 1 });
    expect(parseColor("transparent")).toBeNull();
  });
});

describe("measureTokens — palette by roles", () => {
  const tokens = measureTokens(site([richViewport(1440), richViewport(390)]));

  it("surface = dominant painted background, weighted by area", () => {
    expect(tokens.palette.surface?.value).toBe("#faf6f2");
    expect(tokens.palette.surface?.confidence).toBeGreaterThan(0.5);
    expect(tokens.palette.surface?.origin).toContain("measure/tokens.ts");
  });

  it("surface2 = the distinct secondary band (dark punctuation section)", () => {
    expect(tokens.palette.surface2?.value).toBe("#1c1310");
  });

  it("ink from text/heading colors, ink2 distinct", () => {
    expect(tokens.palette.ink?.value).toBe("#1c1310");
    expect(tokens.palette.ink2?.value).toBe("#5a504a");
  });

  it("accent from the real CTA background", () => {
    expect(tokens.palette.accent?.value).toBe("#b4552d");
    expect(tokens.palette.accent?.origin).toContain("action-background");
  });

  it("prefersDark false on a light surface", () => {
    expect(tokens.prefersDark?.value).toBe(false);
  });
});

describe("measureTokens — typography", () => {
  const tokens = measureTokens(site([richViewport(1440), richViewport(390)]));

  it("exact display/body families — no 5-value enum anymore", () => {
    expect(tokens.typography.displayFont?.value).toBe("Fraunces");
    expect(tokens.typography.bodyFont?.value).toBe("Inter");
  });

  it("real weight and em-relative tracking", () => {
    expect(tokens.typography.headingWeight?.value).toBe(600);
    expect(tokens.typography.tracking?.value).toBe("-0.024em");
  });

  it("px scale at the widest viewport", () => {
    expect(tokens.typography.scalePx?.value).toMatchObject({ display: 96, h2: 40, body: 18 });
  });

  it("reconstructs a fluid clamp() from the two measured widths", () => {
    const clamp = tokens.typography.displayClamp!.value;
    expect(clamp).toMatch(/^clamp\(44px, .*vw, 96px\)$/);
    // slope: (96-44)/(1440-390)*100 ≈ 4.95vw
    expect(clamp).toContain("4.95vw");
  });
});

describe("measureTokens — spacing & surfaces", () => {
  const tokens = measureTokens(site([richViewport(1440), richViewport(390)]));

  it("section paddings → median + multiplier snapped to the DNA scale", () => {
    expect(tokens.spacing.sectionPaddingY?.value.median).toBe(96);
    expect(tokens.spacing.spacingMultiplier?.value).toBe(1.5);
  });

  it("container width from repeated content-block widths", () => {
    expect(tokens.spacing.containerWidth?.value).toBe(1240);
  });

  it("button radius (pill) and card shadow/radius from shadowed nodes", () => {
    expect(tokens.surfaces.buttonRadius?.value).toBe(9999);
    expect(tokens.surfaces.cardShadow?.value).toContain("8px 32px");
    expect(tokens.surfaces.cardRadius?.value).toBe(12);
  });
});

describe("measureTokens — honesty (charter)", () => {
  it("Tier 1 capture → nothing measured, fonts/variables passthrough, note posted", () => {
    const tokens = measureTokens(site([]));
    expect(tokens.palette).toEqual({});
    expect(tokens.typography).toEqual({});
    expect(tokens.spacing).toEqual({});
    expect(tokens.prefersDark).toBeUndefined();
    expect(tokens.cssVariables["--brand"]).toBe("#b4552d");
    expect(tokens.fonts[0].family).toBe("Inter Display");
    expect(tokens.coverage.notes[0]).toContain("Tier 1");
  });

  it("dark site → prefersDark true", () => {
    const dark = viewport(1440, [], [block("rgb(10, 10, 12)", { x: 0, y: 0, width: 1440, height: 3000 })]);
    // needs at least one node for the snapshot to count as usable
    dark.nodes.push(node("block", {}, { x: 0, y: 0, width: 1440, height: 3000 }));
    const tokens = measureTokens(site([dark]));
    expect(tokens.prefersDark?.value).toBe(true);
  });

  it("every measured value carries confidence ∈ [0,1] and a file-precise origin", () => {
    const tokens = measureTokens(site([richViewport(1440), richViewport(390)]));
    const all = [
      ...Object.values(tokens.palette),
      ...Object.values(tokens.typography),
      ...Object.values(tokens.spacing),
      ...Object.values(tokens.surfaces),
      tokens.prefersDark,
    ].filter(Boolean) as Array<{ confidence: number; origin: string }>;
    expect(all.length).toBeGreaterThan(10);
    for (const m of all) {
      expect(m.confidence).toBeGreaterThan(0);
      expect(m.confidence).toBeLessThanOrEqual(1);
      expect(m.origin).toContain("measure/tokens.ts");
    }
  });
});
