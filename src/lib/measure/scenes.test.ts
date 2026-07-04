import { describe, it, expect } from "vitest";
import type {
  ComputedNodeStyle,
  RawBlockGeometry,
  RenderedSite,
  ViewportCapture,
} from "@/lib/capture/types";
import { measureScenes, sceneOrderMeasured } from "./scenes";

/* -------------------------------------------------------------------------- */
/*  Synthetic page: nav / hero (image right, 1 CTA) / gallery / footer        */
/* -------------------------------------------------------------------------- */

const rect = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

function n(
  path: string,
  role: ComputedNodeStyle["role"],
  r: ReturnType<typeof rect>,
  styles: Record<string, string> = {},
  tag?: string,
  text?: string
): ComputedNodeStyle {
  return {
    path, role, rect: r, styles,
    tag: tag ?? (role === "heading" ? "h1" : role === "action" ? "a" : role === "nav" ? "nav" : "div"),
    ...(text ? { text } : {}),
  };
}

function b(
  path: string,
  r: ReturnType<typeof rect>,
  backgroundColor = "rgb(250, 246, 242)",
  headingText: string | null = null,
  childCount = 3
): RawBlockGeometry {
  return { path, rect: r, backgroundColor, backgroundImage: "none", childCount, headingText };
}

function makeSite(): RenderedSite {
  const blocks: RawBlockGeometry[] = [
    b("nav:nth-of-type(1)", rect(0, 0, 1440, 72), "rgb(250, 246, 242)"),
    b("section:nth-of-type(1)", rect(0, 72, 1440, 780), "rgb(243, 233, 223)", "Menuiserie d'art à Grenoble", 4),
    b("div:nth-of-type(2)", rect(0, 852, 1440, 600), "rgb(250, 246, 242)", "Réalisations", 6),
    b("footer:nth-of-type(1)", rect(0, 1452, 1440, 300), "rgb(28, 19, 16)", null, 2),
    // nested duplicate of the hero (an inner <section> also caught) → de-nested
    b("section:nth-of-type(1) > div:nth-of-type(1)", rect(24, 96, 1392, 730), "rgba(0, 0, 0, 0)"),
  ];
  const nodes: ComputedNodeStyle[] = [
    n("nav:nth-of-type(1)", "nav", rect(0, 0, 1440, 72), {}, "nav"),
    n("section:nth-of-type(1)", "block", rect(0, 72, 1440, 780), {
      display: "grid", gridTemplateColumns: "420px 900px", gap: "32px 32px",
      paddingTop: "96px", paddingBottom: "96px",
    }, "section"),
    n("section:nth-of-type(1) > h1:nth-of-type(1)", "heading", rect(60, 160, 620, 180), {
      fontSize: "88px", fontWeight: "600", textAlign: "left", color: "rgb(28, 19, 16)",
    }, "h1", "Menuiserie d'art à Grenoble"),
    n("section:nth-of-type(1) > p:nth-of-type(1)", "text", rect(60, 380, 520, 90), {
      fontSize: "18px", color: "rgb(90, 80, 74)",
    }, "p", "Pièces uniques en bois massif."),
    n("section:nth-of-type(1) > a:nth-of-type(1)", "action", rect(60, 520, 240, 52), {
      borderRadius: "9999px", backgroundColor: "rgb(180, 85, 45)",
    }, "a", "Discuter de votre projet"),
    n("section:nth-of-type(1) > img:nth-of-type(1)", "media", rect(760, 140, 620, 620), {
      borderRadius: "12px",
    }, "img"),
    // gallery: 3 media, no prose
    n("div:nth-of-type(2)", "block", rect(0, 852, 1440, 600), {}, "div"),
    n("div:nth-of-type(2) > h2:nth-of-type(1)", "heading", rect(60, 900, 400, 48), { fontSize: "40px", color: "rgb(28, 19, 16)" }, "h2", "Réalisations"),
    n("div:nth-of-type(2) > img:nth-of-type(1)", "media", rect(60, 980, 420, 300), {}, "img"),
    n("div:nth-of-type(2) > img:nth-of-type(2)", "media", rect(510, 980, 420, 300), {}, "img"),
    n("div:nth-of-type(2) > img:nth-of-type(3)", "media", rect(960, 980, 420, 300), {}, "img"),
    n("footer:nth-of-type(1)", "block", rect(0, 1452, 1440, 300), {}, "footer"),
  ];
  const viewport: ViewportCapture = { viewport: 1440, screenshot: null, nodes, blocks, scrollHeight: 1752 };
  return {
    url: "https://x.example", capturedAt: "2026-07-04T00:00:00.000Z", html: "<html/>",
    stylesheets: [], runtimeCss: [], cssVariables: {}, fonts: [],
    viewports: [viewport],
    animations: [
      { path: "section:nth-of-type(1) > h1:nth-of-type(1)", kind: "transition", properties: ["color"], duration: 160, easing: "ease-out", delay: 0 },
    ],
    quality: {
      tier: "rendered", html: "rendered", css: "full", cssFetched: 0, cssFailed: [],
      computedSnapshot: true, screenshots: [], fonts: "none", geometry: true,
      challenge: false, durationMs: 0, notes: [],
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("measureScenes", () => {
  const m = measureScenes(makeSite());

  it("assembles ordered, de-nested scenes with inferred types + reasons", () => {
    expect(m.scenes.map((s) => s.type)).toEqual(["nav", "hero", "gallery", "footer"]);
    // the nested inner hero div was swallowed by de-nesting
    expect(m.scenes).toHaveLength(4);
    for (const s of m.scenes) {
      expect(s.typeConfidence).toBeGreaterThan(0);
      expect(s.typeReason.length).toBeGreaterThan(0);
    }
  });

  it("hero: dominant first scene, real headline, media RIGHT, real CTA measured", () => {
    const hero = m.scenes.find((s) => s.type === "hero")!;
    expect(hero.typeConfidence).toBeGreaterThanOrEqual(0.75);
    expect(hero.heading).toBe("Menuiserie d'art à Grenoble");
    expect(hero.hero).toMatchObject({
      headlineText: "Menuiserie d'art à Grenoble",
      headlineSizePx: 88,
      mediaPosition: "right",
      ctaCount: 1,
    });
    expect(hero.ctas[0]).toMatchObject({ label: "Discuter de votre projet", radiusPx: 9999 });
    expect(hero.grid).toMatchObject({ columnCount: 2, gapPx: 32 });
    expect(hero.spacing).toMatchObject({ paddingTopPx: 96, paddingBottomPx: 96 });
    expect(hero.motion).toMatchObject({ animated: true, kinds: ["transition"] });
  });

  it("measures real contrast per scene (WCAG ratio on measured colors)", () => {
    const hero = m.scenes.find((s) => s.type === "hero")!;
    expect(hero.contrast?.background).toBe("#f3e9df");
    expect(hero.contrast?.ink).toBe("#1c1310");
    expect(hero.contrast!.ratio).toBeGreaterThan(10); // dark ink on cream
  });

  it("gallery: 3+ media with almost no prose", () => {
    const gallery = m.scenes.find((s) => s.type === "gallery")!;
    expect(gallery.density.mediaCount).toBe(3);
    expect(gallery.media.every((x) => x.ratio && x.ratio > 1)).toBe(true);
  });

  it("Tier 1 (no blocks) → no scenes, honest note", () => {
    const site = makeSite();
    const empty = measureScenes({ ...site, viewports: [] });
    expect(empty.scenes).toEqual([]);
    expect(empty.notes[0]).toContain("unavailable");
  });

  it("responsive deltas: joined by path, stacking + hidden scenes measured", () => {
    const site = makeSite();
    // 390px capture: hero stacked (1 column, smaller heading, taller), gallery ABSENT.
    const narrow: ViewportCapture = {
      viewport: 390,
      screenshot: null,
      scrollHeight: 2400,
      blocks: [
        b("nav:nth-of-type(1)", rect(0, 0, 390, 64)),
        b("section:nth-of-type(1)", rect(0, 64, 390, 1180), "rgb(243, 233, 223)", "Menuiserie d'art à Grenoble"),
        b("footer:nth-of-type(1)", rect(0, 2100, 390, 300), "rgb(28, 19, 16)"),
      ],
      nodes: [
        n("section:nth-of-type(1)", "block", rect(0, 64, 390, 1180), {
          display: "grid", gridTemplateColumns: "358px",
        }, "section"),
        n("section:nth-of-type(1) > h1:nth-of-type(1)", "heading", rect(16, 120, 340, 140), {
          fontSize: "44px", fontWeight: "600", color: "rgb(28, 19, 16)",
        }, "h1", "Menuiserie d'art à Grenoble"),
      ],
    };
    const m2 = measureScenes({ ...site, viewports: [...site.viewports, narrow] });

    const hero = m2.scenes.find((s) => s.type === "hero")!;
    expect(hero.responsive![390]).toMatchObject({
      present: true,
      heightPx: 1180,
      headingSizePx: 44,
      columnCount: 1,
      stacked: true,
    });
    const gallery = m2.scenes.find((s) => s.type === "gallery")!;
    expect(gallery.responsive![390]).toEqual({ present: false });
    expect(m2.notes.some((note) => note.includes("not found at 390px"))).toBe(true);
  });

  it("sceneOrderMeasured exposes the measured order as a MeasuredValue", () => {
    const mv = sceneOrderMeasured(m)!;
    expect(mv.value).toEqual(["nav", "hero", "gallery", "footer"]);
    expect(mv.confidence).toBeGreaterThan(0.5);
    expect(mv.origin).toContain("measure/scenes.ts");
  });
});
