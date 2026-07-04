/**
 * V2 MEASURE — SceneDNA: every section of the source page as a measured scene
 * (Chantier 6b).
 *
 * Built on the Chantier 6a contracts: block geometry joined to computed node
 * styles by PATH (same element = same path within a snapshot), wrappers
 * already descended (F1), paths unique per list (F3).
 *
 * Charter:
 *  - measurements only — a scene the capture can't support a field for keeps
 *    it undefined;
 *  - semantic typing IS an inference and says so: `type` always carries its
 *    own confidence and the mechanical rule in `typeReason`;
 *  - nothing invented, per-field/per-scene confidence everywhere it matters.
 */

import type {
  ComputedNodeStyle,
  CssAnimationRecord,
  DOMRectLike,
  RenderedSite,
  ViewportCapture,
} from "@/lib/capture/types";
import { contrastRatio } from "@/lib/generation/color";
import { parseColor, type MeasuredValue } from "./tokens";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type SceneType = "nav" | "hero" | "gallery" | "footer" | "section";

export interface SceneMedia {
  /** 3×3 grid zone of the media centre within the scene ("left"|"center"|"right" × "top"|"middle"|"bottom"), plus "behind" when it covers the scene. */
  zone: string;
  ratio: number | undefined;
  radiusPx?: number;
  path: string;
}

export interface SceneCta {
  label?: string;
  radiusPx?: number;
  background?: string;
  path: string;
}

export interface SceneDna {
  /** Stable join key: the block's path at the widest viewport (F3 contract). */
  path: string;
  order: number;
  /** Inferred semantic type — an inference, and it says so. */
  type: SceneType;
  typeConfidence: number;
  typeReason: string;
  /** The REAL heading of the scene, verbatim. */
  heading?: string;

  bounds: {
    rect: DOMRectLike;
    /** Height relative to the capture viewport height (900px reference). */
    viewportRatio: number;
    fullBleed: boolean;
  };
  grid?: {
    templateColumns?: string;
    columnCount?: number;
    gapPx?: number;
  };
  spacing?: {
    paddingTopPx?: number;
    paddingBottomPx?: number;
  };
  background: {
    kind: "color" | "image" | "none";
    color?: string;
    hasImage: boolean;
  };
  contrast?: {
    background: string;
    ink: string;
    ratio: number;
  };
  text?: {
    align?: string;
    maxWidthPx?: number;
    headingSizePx?: number;
    headingWeight?: number;
  };
  media: SceneMedia[];
  ctas: SceneCta[];
  motion?: {
    animated: boolean;
    kinds: string[];
  };
  density: {
    childCount: number;
    mediaCount: number;
  };

  /** Extension: hero-specific measurements (present when type === "hero"). */
  hero?: {
    headlineText?: string;
    headlineSizePx?: number;
    headlineWidthPx?: number;
    mediaPosition?: "behind" | "left" | "right" | "top" | "bottom" | "none";
    ctaCount: number;
  };
}

export interface SceneMeasurement {
  scenes: SceneDna[];
  viewport: number;
  notes: string[];
}

/* -------------------------------------------------------------------------- */
/*  Geometry helpers                                                          */
/* -------------------------------------------------------------------------- */

const area = (r: DOMRectLike): number => Math.max(0, r.width) * Math.max(0, r.height);

function containedShare(inner: DOMRectLike, outer: DOMRectLike): number {
  const x = Math.max(0, Math.min(inner.x + inner.width, outer.x + outer.width) - Math.max(inner.x, outer.x));
  const y = Math.max(0, Math.min(inner.y + inner.height, outer.y + outer.height) - Math.max(inner.y, outer.y));
  const a = area(inner);
  return a === 0 ? 0 : (x * y) / a;
}

const px = (v: string | undefined): number | undefined => {
  if (!v) return undefined;
  const m = v.match(/^(-?\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : undefined;
};

function zoneOf(inner: DOMRectLike, outer: DOMRectLike): string {
  if (containedShare(outer, inner) >= 0.8) return "behind";
  const cx = inner.x + inner.width / 2;
  const cy = inner.y + inner.height / 2;
  const col = cx < outer.x + outer.width / 3 ? "left" : cx > outer.x + (2 * outer.width) / 3 ? "right" : "center";
  const row = cy < outer.y + outer.height / 3 ? "top" : cy > outer.y + (2 * outer.height) / 3 ? "bottom" : "middle";
  return `${col}-${row}`;
}

/* -------------------------------------------------------------------------- */
/*  Scene assembly                                                            */
/* -------------------------------------------------------------------------- */

const VIEWPORT_H = 900; // capture viewport height (render.ts)

export function measureScenes(site: RenderedSite): SceneMeasurement {
  const notes: string[] = [];
  const wide = [...site.viewports].sort((a, b) => b.viewport - a.viewport)[0];
  if (!wide || wide.blocks.length === 0) {
    notes.push("no rendered blocks; scene measurement unavailable");
    return { scenes: [], viewport: wide?.viewport ?? 0, notes };
  }

  const outer = deNest(wide);
  const scenes = outer
    .sort((a, b) => a.rect.y - b.rect.y)
    .map((block, i) => buildScene(block, i, wide, site.animations));

  inferHero(scenes);
  return { scenes, viewport: wide.viewport, notes };
}

/** Keep the outermost block of each area; nav/footer tags always survive. */
function deNest(v: ViewportCapture) {
  const byArea = [...v.blocks].sort((a, b) => area(b.rect) - area(a.rect));
  const kept: typeof v.blocks = [];
  const nodeByPath = new Map(v.nodes.map((n) => [n.path, n]));
  for (const b of byArea) {
    const tag = nodeByPath.get(b.path)?.tag;
    const isLandmark = tag === "nav" || tag === "footer" || tag === "header";
    const swallowed = kept.some((k) => containedShare(b.rect, k.rect) >= 0.85);
    if (!swallowed || isLandmark) kept.push(b);
  }
  return kept;
}

function buildScene(
  block: ViewportCapture["blocks"][number],
  order: number,
  v: ViewportCapture,
  animations: CssAnimationRecord[]
): SceneDna {
  const nodeByPath = new Map(v.nodes.map((n) => [n.path, n]));
  const self = nodeByPath.get(block.path);
  const inside = (n: ComputedNodeStyle) =>
    n.path !== block.path && containedShare(n.rect, block.rect) >= 0.6;
  const children = v.nodes.filter(inside);

  const headings = children.filter((n) => n.role === "heading");
  const texts = children.filter((n) => n.role === "text");
  const medias = children.filter((n) => n.role === "media");
  const actions = children.filter((n) => n.role === "action");

  /* ---- type inference (mechanical, confidence-scored) ---- */

  let type: SceneType = "section";
  let typeConfidence = 0.4;
  let typeReason = "default: no distinguishing signal";
  const tag = self?.tag;
  if (tag === "nav" || children.some((n) => n.role === "nav") || self?.role === "nav") {
    type = "nav"; typeConfidence = 0.9; typeReason = "nav landmark tag";
  } else if (tag === "footer") {
    type = "footer"; typeConfidence = 0.9; typeReason = "footer landmark tag";
  } else if (medias.length >= 3 && texts.length <= 1) {
    type = "gallery"; typeConfidence = 0.7; typeReason = `${medias.length} media, ≤1 text node`;
  }
  // hero is decided across scenes (inferHero) — position matters.

  /* ---- background & contrast ---- */

  const bgColor = parseColor(block.backgroundColor);
  const hasImage = block.backgroundImage !== "none" && block.backgroundImage !== "";
  const background: SceneDna["background"] = {
    kind: hasImage ? "image" : bgColor && bgColor.a >= 0.5 ? "color" : "none",
    color: bgColor && bgColor.a >= 0.5 ? block.backgroundColor : undefined,
    hasImage,
  };

  let contrast: SceneDna["contrast"];
  const inkNode = headings[0] ?? texts[0];
  if (background.color && inkNode?.styles.color) {
    const bgHex = rgbToHex(background.color);
    const inkHex = rgbToHex(inkNode.styles.color);
    if (bgHex && inkHex) {
      contrast = { background: bgHex, ink: inkHex, ratio: round2(contrastRatio(inkHex, bgHex)) };
    }
  }

  /* ---- grid / spacing / text from the block's own computed styles ---- */

  const gridTemplate = self?.styles.gridTemplateColumns;
  const grid =
    gridTemplate && gridTemplate !== "none"
      ? {
          templateColumns: gridTemplate,
          columnCount: gridTemplate.split(" ").filter(Boolean).length,
          gapPx: px(self?.styles.gap?.split(" ")[0]),
        }
      : undefined;

  const spacing = self
    ? { paddingTopPx: px(self.styles.paddingTop), paddingBottomPx: px(self.styles.paddingBottom) }
    : undefined;

  const heading0 = headings.sort((a, b) => (px(b.styles.fontSize) ?? 0) - (px(a.styles.fontSize) ?? 0))[0];
  const text: SceneDna["text"] | undefined = heading0
    ? {
        align: heading0.styles.textAlign,
        maxWidthPx: heading0.rect.width || undefined,
        headingSizePx: px(heading0.styles.fontSize),
        headingWeight: parseInt(heading0.styles.fontWeight ?? "", 10) || undefined,
      }
    : undefined;

  /* ---- media / ctas / motion ---- */

  const media: SceneMedia[] = medias.map((m) => ({
    zone: zoneOf(m.rect, block.rect),
    ratio: m.rect.height > 0 ? round2(m.rect.width / m.rect.height) : undefined,
    radiusPx: px(m.styles.borderRadius),
    path: m.path,
  }));

  const ctas: SceneCta[] = actions.map((a) => ({
    label: a.text,
    radiusPx: px(a.styles.borderRadius),
    background: a.styles.backgroundColor,
    path: a.path,
  }));

  const sceneAnims = animations.filter(
    (a) => a.path === block.path || a.path.startsWith(`${block.path} > `)
  );
  const motion =
    sceneAnims.length > 0
      ? { animated: true, kinds: Array.from(new Set(sceneAnims.map((a) => a.kind))) }
      : undefined;

  return {
    path: block.path,
    order,
    type,
    typeConfidence,
    typeReason,
    heading: block.headingText ?? undefined,
    bounds: {
      rect: block.rect,
      viewportRatio: round2(block.rect.height / VIEWPORT_H),
      fullBleed: block.rect.width >= v.viewport - 8,
    },
    grid,
    spacing,
    background,
    contrast,
    text,
    media,
    ctas,
    motion,
    density: { childCount: block.childCount, mediaCount: medias.length },
  };
}

/** Hero: first non-nav scene that dominates the viewport or owns the biggest
 *  heading of the page. Cross-scene, so it runs after assembly. */
function inferHero(scenes: SceneDna[]): void {
  const candidates = scenes.filter((s) => s.type !== "nav" && s.type !== "footer");
  if (candidates.length === 0) return;
  const maxHeading = Math.max(...scenes.map((s) => s.text?.headingSizePx ?? 0));
  const first = candidates[0];
  const dominant = first.bounds.viewportRatio >= 0.6;
  const ownsBiggest = (first.text?.headingSizePx ?? 0) >= maxHeading && maxHeading > 0;
  if (!dominant && !ownsBiggest) return;

  first.type = "hero";
  first.typeConfidence = dominant && ownsBiggest ? 0.9 : 0.75;
  first.typeReason = dominant
    ? `first scene fills ${Math.round(first.bounds.viewportRatio * 100)}% of the viewport`
    : "first scene owns the page's largest heading";

  const behind = first.media.find((m) => m.zone === "behind");
  const side = first.media[0];
  first.hero = {
    headlineText: undefined, // set from heading node text below when present
    headlineSizePx: first.text?.headingSizePx,
    headlineWidthPx: first.text?.maxWidthPx,
    mediaPosition: behind
      ? "behind"
      : side
        ? (side.zone.startsWith("left") ? "left"
          : side.zone.startsWith("right") ? "right"
          : side.zone.endsWith("top") ? "top"
          : side.zone.endsWith("bottom") ? "bottom"
          : "right")
        : "none",
    ctaCount: first.ctas.length,
  };
  first.hero.headlineText = first.heading;
}

/* -------------------------------------------------------------------------- */
/*  Small utils                                                               */
/* -------------------------------------------------------------------------- */

function rgbToHex(css: string): string | null {
  const c = parseColor(css);
  if (!c) return null;
  return "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Convenience for downstream layers: scenes as MeasuredValue-style entries. */
export function sceneOrderMeasured(m: SceneMeasurement): MeasuredValue<string[]> | undefined {
  if (m.scenes.length === 0) return undefined;
  return {
    value: m.scenes.map((s) => s.type),
    confidence: Math.min(0.9, m.scenes.reduce((a, s) => a + s.typeConfidence, 0) / m.scenes.length),
    origin: `measure/scenes.ts#sceneOrderMeasured@${m.viewport}`,
  };
}
