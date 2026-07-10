import { describe, it, expect } from "vitest";
import type { Block } from "@/lib/generation/types";
import type { SceneDna, SceneMeasurement, SceneType } from "@/lib/measure/scenes";
import {
  compileSceneSpecs,
  matchScenesToBlocks,
  sceneSpecFrom,
  assertRenderable,
  MIN_SCENE_TYPE_CONFIDENCE,
} from "./scene-spec";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

let seq = 0;
function scene(type: SceneType, over: Partial<SceneDna> = {}): SceneDna {
  const order = over.order ?? seq++;
  return {
    path: `section:nth-of-type(${order + 1})`,
    order,
    type,
    typeConfidence: 0.9,
    typeReason: "test",
    bounds: {
      rect: { x: 0, y: order * 800, width: 1440, height: 780 },
      viewportRatio: 0.87,
      fullBleed: true,
    },
    background: { kind: "color", color: "rgb(250, 246, 242)", hasImage: false },
    media: [],
    ctas: [],
    density: { childCount: 3, mediaCount: 0 },
    ...over,
  };
}

function block(type: Block["type"], id?: string): Block {
  return { id: id ?? `${type}-${seq++}`, type, variant: "default", props: {} };
}

const measurement = (scenes: SceneDna[]): SceneMeasurement => ({ scenes, viewport: 1440, notes: [] });

/* -------------------------------------------------------------------------- */
/*  sceneSpecFrom — measured field extraction, bounds gating                  */
/* -------------------------------------------------------------------------- */

describe("sceneSpecFrom", () => {
  it("offers minHeightVh for a hero with a sane viewport ratio, with measured provenance", () => {
    const spec = sceneSpecFrom(scene("hero", { bounds: { rect: { x: 0, y: 0, width: 1440, height: 810 }, viewportRatio: 0.9, fullBleed: true } }));
    expect(spec?.minHeightVh).toBe(90);
    expect(spec?.sceneType).toBe("hero");
    expect(spec?.provenance.minHeightVh).toBe("measured");
  });

  it("does NOT offer minHeightVh outside sane bounds (no clamping, no fabrication)", () => {
    const tall = sceneSpecFrom(scene("hero", { bounds: { rect: { x: 0, y: 0, width: 1440, height: 2700 }, viewportRatio: 3, fullBleed: true } }));
    expect(tall?.minHeightVh).toBeUndefined();
    const flat = sceneSpecFrom(scene("hero", { bounds: { rect: { x: 0, y: 0, width: 1440, height: 90 }, viewportRatio: 0.1, fullBleed: true } }));
    expect(flat?.minHeightVh).toBeUndefined();
  });

  it("offers heroMediaPosition from measured hero media, never 'none'", () => {
    const withMedia = sceneSpecFrom(scene("hero", { hero: { mediaPosition: "left", ctaCount: 1 } }));
    expect(withMedia?.heroMediaPosition).toBe("left");
    expect(withMedia?.provenance.heroMediaPosition).toBe("measured");
    const noMedia = sceneSpecFrom(scene("hero", { hero: { mediaPosition: "none", ctaCount: 1 } }));
    expect(noMedia?.heroMediaPosition).toBeUndefined();
    const notHero = sceneSpecFrom(scene("section", { hero: { mediaPosition: "left", ctaCount: 1 } }));
    expect(notHero?.heroMediaPosition).toBeUndefined();
  });

  it("does not offer minHeightVh for non-hero scenes", () => {
    const spec = sceneSpecFrom(scene("section", { bounds: { rect: { x: 0, y: 0, width: 1440, height: 810 }, viewportRatio: 0.9, fullBleed: true } }));
    expect(spec?.minHeightVh).toBeUndefined();
  });

  it("offers paddingY only when both sides are measured and within bounds", () => {
    expect(sceneSpecFrom(scene("section", { spacing: { paddingTopPx: 120, paddingBottomPx: 96.4 } }))?.paddingY)
      .toEqual({ topPx: 120, bottomPx: 96 });
    expect(sceneSpecFrom(scene("section", { spacing: { paddingTopPx: 120 } }))?.paddingY).toBeUndefined();
    expect(sceneSpecFrom(scene("section", { spacing: { paddingTopPx: 120, paddingBottomPx: 900 } }))?.paddingY).toBeUndefined();
  });

  it("offers background/contrastPair from measured values", () => {
    const spec = sceneSpecFrom(scene("section", {
      background: { kind: "color", color: "rgb(28, 19, 16)", hasImage: false },
      contrast: { background: "rgb(28, 19, 16)", ink: "rgb(250, 246, 242)", ratio: 13.2 },
    }));
    expect(spec?.background).toBe("rgb(28, 19, 16)");
    expect(spec?.contrastPair).toEqual({ background: "rgb(28, 19, 16)", ink: "rgb(250, 246, 242)", ratio: 13.2 });
  });

  it("gates columns to 2..4 and gap to 0..160", () => {
    expect(sceneSpecFrom(scene("section", { grid: { columnCount: 3, gapPx: 32 } }))?.cols).toBe(3);
    expect(sceneSpecFrom(scene("section", { grid: { columnCount: 7, gapPx: 32 } }))?.cols).toBeUndefined();
    expect(sceneSpecFrom(scene("section", { grid: { columnCount: 3, gapPx: 400 } }))?.gapPx).toBeUndefined();
    expect(sceneSpecFrom(scene("section", { grid: { columnCount: 3, gapPx: 32 } }))?.gapPx).toBe(32);
  });

  it("simplifies a 2-track grid to a bounded fr ratio; exotic tracks are not offered", () => {
    expect(sceneSpecFrom(scene("section", { grid: { templateColumns: "600px 400px", columnCount: 2 } }))?.colsRatio).toBe("1.5fr 1fr");
    expect(sceneSpecFrom(scene("section", { grid: { templateColumns: "500px 500px", columnCount: 2 } }))?.colsRatio).toBe("1fr 1fr");
    // ratio 3 → out of [0.5, 2]
    expect(sceneSpecFrom(scene("section", { grid: { templateColumns: "900px 300px", columnCount: 2 } }))?.colsRatio).toBeUndefined();
    // non-px tracks (minmax/auto) → not simplifiable
    expect(sceneSpecFrom(scene("section", { grid: { templateColumns: "minmax(0, 1fr) auto", columnCount: 2 } }))?.colsRatio).toBeUndefined();
  });

  it("picks the dominant media zone, 'behind' wins, and derives alternate from a left zone", () => {
    const behind = sceneSpecFrom(scene("hero", {
      media: [
        { zone: "left-middle", ratio: 1.5, path: "img1" },
        { zone: "behind", ratio: 1.78, path: "img2" },
      ],
    }));
    expect(behind?.mediaZone).toBe("behind");
    expect(behind?.alternate).toBeUndefined();

    const left = sceneSpecFrom(scene("section", { media: [{ zone: "left-middle", ratio: 1.5, path: "img1" }] }));
    expect(left?.mediaZone).toBe("left-middle");
    expect(left?.alternate).toBe(true);

    const right = sceneSpecFrom(scene("section", { media: [{ zone: "right-middle", ratio: 1.5, path: "img1" }] }));
    expect(right?.alternate).toBe(false);
  });

  it("returns a renderable spec (path + type + non-empty provenance)", () => {
    const spec = sceneSpecFrom(scene("section", { spacing: { paddingTopPx: 96, paddingBottomPx: 96 } }));
    expect(spec && assertRenderable(spec)).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  matchScenesToBlocks — B4                                                  */
/* -------------------------------------------------------------------------- */

describe("matchScenesToBlocks", () => {
  it("matches hero and footer by type, sections by rank; nav scenes have no block", () => {
    const scenes = [
      scene("nav", { order: 0 }),
      scene("hero", { order: 1 }),
      scene("section", { order: 2, heading: "Services" }),
      scene("section", { order: 3, heading: "À propos" }),
      scene("footer", { order: 4 }),
    ];
    const blocks = [block("hero", "h"), block("services", "s1"), block("about", "s2"), block("footer", "f")];
    const m = matchScenesToBlocks(scenes, blocks);
    expect(m.get("h")?.type).toBe("hero");
    expect(m.get("f")?.type).toBe("footer");
    expect(m.get("s1")?.heading).toBe("Services");
    expect(m.get("s2")?.heading).toBe("À propos");
  });

  it("matches gallery scenes to the gallery family (portfolio/gallery/products) by rank", () => {
    const scenes = [scene("hero", { order: 0 }), scene("gallery", { order: 1, heading: "Réalisations" }), scene("section", { order: 2 })];
    const blocks = [block("hero", "h"), block("features", "feat"), block("gallery", "g")];
    const m = matchScenesToBlocks(scenes, blocks);
    expect(m.get("g")?.heading).toBe("Réalisations");
    expect(m.get("feat")?.type).toBe("section");
  });

  it("demotes a low-confidence hero to a generic section (A2)", () => {
    const scenes = [scene("hero", { order: 0, typeConfidence: MIN_SCENE_TYPE_CONFIDENCE - 0.1 })];
    const blocks = [block("hero", "h"), block("features", "feat")];
    const m = matchScenesToBlocks(scenes, blocks);
    expect(m.get("h")).toBeUndefined();
    expect(m.get("feat")?.path).toBe(scenes[0].path);
  });

  it("leaves extra blocks unmatched instead of stretching scenes", () => {
    const scenes = [scene("hero", { order: 0 }), scene("section", { order: 1 })];
    const blocks = [block("hero", "h"), block("features", "s1"), block("cta", "s2"), block("contact", "s3")];
    const m = matchScenesToBlocks(scenes, blocks);
    expect(m.size).toBe(2);
    expect(m.get("s1")).toBeDefined();
    expect(m.get("s2")).toBeUndefined();
    expect(m.get("s3")).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/*  compileSceneSpecs — B3, transparency contract                             */
/* -------------------------------------------------------------------------- */

describe("compileSceneSpecs", () => {
  it("returns the EXACT same array (same references) without measurements — V5 transparency", () => {
    const blocks = [block("hero"), block("features"), block("footer")];
    expect(compileSceneSpecs(blocks, undefined)).toBe(blocks);
    expect(compileSceneSpecs(blocks, measurement([]))).toBe(blocks);
  });

  it("attaches SceneSpecs to matched blocks without mutating the input", () => {
    const blocks = [block("hero", "h"), block("features", "s1"), block("footer", "f")];
    const scenes = [
      scene("hero", { order: 0, bounds: { rect: { x: 0, y: 0, width: 1440, height: 810 }, viewportRatio: 0.9, fullBleed: true } }),
      scene("section", { order: 1, spacing: { paddingTopPx: 128, paddingBottomPx: 128 }, grid: { columnCount: 3, gapPx: 24 } }),
      scene("footer", { order: 2 }),
    ];
    const out = compileSceneSpecs(blocks, measurement(scenes));

    expect(blocks[0].scene).toBeUndefined(); // input untouched
    expect(out[0].scene?.minHeightVh).toBe(90);
    expect(out[0].scene?.sceneType).toBe("hero");
    expect(out[1].scene?.paddingY).toEqual({ topPx: 128, bottomPx: 128 });
    expect(out[1].scene?.cols).toBe(3);
    expect(out[1].scene?.gapPx).toBe(24);
    expect(out[2].scene?.sceneType).toBe("footer");
    // every offered field carries measured provenance
    for (const b of out) {
      for (const src of Object.values(b.scene?.provenance ?? {})) expect(src).toBe("measured");
    }
  });

  it("keeps the original block reference when a scene offers no usable decision", () => {
    const blocks = [block("hero", "h")];
    // hero with out-of-bounds ratio, no padding/grid/media/background color
    const bare = scene("hero", {
      order: 0,
      bounds: { rect: { x: 0, y: 0, width: 1440, height: 4000 }, viewportRatio: 4.4, fullBleed: true },
      background: { kind: "none", hasImage: false },
    });
    const out = compileSceneSpecs(blocks, measurement([bare]));
    expect(out[0]).toBe(blocks[0]);
  });
});
