/**
 * Composition Engine — scene specs (V2 Chantier 7a).
 *
 * The single place where measured scene geometry (SceneDNA, C6) is resolved
 * into flat, renderable composition decisions and attached to the generated
 * blocks. The renderer stays a pure executor: `SceneShell` publishes these
 * decisions as `--rf-scene-*` CSS variables and the skins migrate to
 * `var(--rf-scene-*, <V5 fallback>)` family by family (C7b/C7c) — exactly the
 * A1-A3 pattern.
 *
 * Resolution is fill-only (I1): measured > premium > skin default. In C7a only
 * the measured layer exists; premium composition fields arrive with C7d and
 * slot in WITHOUT overwriting anything measured. No-fabrication: a value
 * outside its sane bounds is NOT clamped into plausibility — the field is
 * simply not offered and the skin keeps its V5 default.
 *
 * Transparency contract: no `measuredScenes` → blocks are returned as-is
 * (same references) → SceneShell renders the exact V5 wrapper.
 */

import type { Block } from "@/lib/generation/types";
import type { DesignDNA } from "@/lib/generation/dna";
import { renderableCategory } from "@/lib/generation/structure";
import type { SceneDna, SceneMeasurement, SceneType } from "@/lib/measure/scenes";
import { resolveField, sourced, traceEntry, type PipelineTrace, type Source } from "@/lib/dna/provenance";

/** Where a resolved scene field came from (per-field provenance/trace). */
export type SceneFieldSource = "measured" | "premium" | "default";

/**
 * A resolved, flat, renderable composition decision set for one block.
 * Every optional field is either a usable value or absent — never a guess.
 * Required fields are always present (`assertRenderable`).
 */
export interface SceneSpec {
  /** Join key back to the measured scene (F3 contract) — for tracing. */
  path: string;
  /** Semantic type of the matched scene (post confidence gating). */
  sceneType: SceneType;
  /** Hero occupation: measured height as vh of the capture viewport. */
  minHeightVh?: number;
  /** Measured position of the hero's media relative to its content. */
  heroMediaPosition?: "behind" | "left" | "right" | "top" | "bottom";
  /** Measured vertical rhythm of the scene (overrides --rf-space-section). */
  paddingY?: { topPx: number; bottomPx: number };
  /** Measured scene background color (CSS color string). */
  background?: string;
  /** Measured background/ink pair with its contrast ratio. */
  contrastPair?: { background: string; ink: string; ratio: number };
  /** Measured column count (2..4 — beyond that grids are noise, not offered). */
  cols?: number;
  /** Simplified 2-column fr ratio, e.g. "1.4fr 1fr" (ratio ∈ [0.5, 2]). */
  colsRatio?: string;
  /** Measured grid gap in px. */
  gapPx?: number;
  /** Dominant media zone: 3×3 grid ("left-top".."right-bottom") or "behind". */
  mediaZone?: string;
  /** True when the media sits in the LEFT column (reversed from the default
   *  text-left / media-right composition) — feeds per-scene alternation. */
  alternate?: boolean;
  /** Per-field source, keyed by SceneSpec field name (the scene-level trace). */
  provenance: Partial<Record<string, SceneFieldSource>>;
}

/** Below this type confidence a scene is demoted to a generic "section" (A2). */
export const MIN_SCENE_TYPE_CONFIDENCE = 0.4;

/* Sane-bounds gates: outside → the field is not offered (I1, no fabrication). */
const HERO_VIEWPORT_RATIO_RANGE = [0.35, 1.4] as const;
const PADDING_RANGE_PX = [0, 400] as const;
const GAP_RANGE_PX = [0, 160] as const;
const COLS_RANGE = [2, 4] as const;
const COLS_RATIO_RANGE = [0.5, 2] as const;

const inRange = (v: number, [lo, hi]: readonly [number, number]): boolean =>
  Number.isFinite(v) && v >= lo && v <= hi;

/* -------------------------------------------------------------------------- */
/*  Scene → spec (pure field extraction, measured layer)                      */
/* -------------------------------------------------------------------------- */

/** Effective semantic type after confidence gating (A2 per-field spirit). */
function effectiveType(scene: SceneDna): SceneType {
  return scene.typeConfidence >= MIN_SCENE_TYPE_CONFIDENCE ? scene.type : "section";
}

/** Parse computed `grid-template-columns` tracks ("613.3px 490.7px") to px. */
function parseTracksPx(templateColumns: string): number[] | undefined {
  const tracks = templateColumns.trim().split(/\s+/);
  const px: number[] = [];
  for (const t of tracks) {
    const m = t.match(/^(\d+(?:\.\d+)?)px$/);
    if (!m) return undefined; // subgrid/auto/minmax → not simplifiable, not offered
    px.push(parseFloat(m[1]));
  }
  return px.length >= 2 ? px : undefined;
}

/** Simplify a measured 2-track grid into a bounded fr ratio ("1.4fr 1fr"). */
function simplifyColsRatio(templateColumns: string): string | undefined {
  const tracks = parseTracksPx(templateColumns);
  if (!tracks || tracks.length !== 2 || tracks[1] <= 0) return undefined;
  const ratio = tracks[0] / tracks[1];
  if (!inRange(ratio, COLS_RATIO_RANGE)) return undefined;
  const r = Math.round(ratio * 100) / 100;
  return r === 1 ? "1fr 1fr" : `${r}fr 1fr`;
}

/** Dominant media zone: "behind" wins, otherwise majority vote (tie → first). */
function dominantMediaZone(scene: SceneDna): string | undefined {
  if (scene.media.length === 0) return undefined;
  if (scene.media.some((m) => m.zone === "behind")) return "behind";
  const counts = new Map<string, number>();
  for (const m of scene.media) counts.set(m.zone, (counts.get(m.zone) ?? 0) + 1);
  let best = scene.media[0].zone;
  counts.forEach((n, zone) => {
    if (n > (counts.get(best) ?? 0)) best = zone;
  });
  return best;
}

/**
 * Build the measured layer of a SceneSpec from one measured scene.
 * Pure; returns undefined when the scene offers no usable decision at all.
 */
export function sceneSpecFrom(scene: SceneDna): SceneSpec | undefined {
  const type = effectiveType(scene);
  const spec: SceneSpec = { path: scene.path, sceneType: type, provenance: {} };
  const offer = <K extends keyof SceneSpec>(key: K, value: SceneSpec[K]): void => {
    spec[key] = value;
    spec.provenance[key as string] = "measured";
  };

  if (type === "hero" && inRange(scene.bounds.viewportRatio, HERO_VIEWPORT_RATIO_RANGE)) {
    offer("minHeightVh", Math.round(scene.bounds.viewportRatio * 100));
  }
  const mediaPos = scene.hero?.mediaPosition;
  if (type === "hero" && mediaPos && mediaPos !== "none") {
    offer("heroMediaPosition", mediaPos);
  }

  const { paddingTopPx: pt, paddingBottomPx: pb } = scene.spacing ?? {};
  if (pt !== undefined && pb !== undefined && inRange(pt, PADDING_RANGE_PX) && inRange(pb, PADDING_RANGE_PX)) {
    offer("paddingY", { topPx: Math.round(pt), bottomPx: Math.round(pb) });
  }

  if (scene.background.kind === "color" && scene.background.color) {
    offer("background", scene.background.color);
  }
  if (scene.contrast) {
    offer("contrastPair", { ...scene.contrast });
  }

  const cols = scene.grid?.columnCount;
  if (cols !== undefined && inRange(cols, COLS_RANGE)) offer("cols", cols);
  if (scene.grid?.templateColumns) {
    const ratio = simplifyColsRatio(scene.grid.templateColumns);
    if (ratio) offer("colsRatio", ratio);
  }
  const gap = scene.grid?.gapPx;
  if (gap !== undefined && inRange(gap, GAP_RANGE_PX)) offer("gapPx", Math.round(gap));

  const zone = dominantMediaZone(scene);
  if (zone) {
    offer("mediaZone", zone);
    if (zone !== "behind") offer("alternate", zone.startsWith("left"));
  }

  return Object.keys(spec.provenance).length > 0 ? spec : undefined;
}

/** A spec is renderable iff its required fields are usable (no undefined). */
export function assertRenderable(spec: SceneSpec): boolean {
  return (
    typeof spec.path === "string" && spec.path.length > 0 &&
    typeof spec.sceneType === "string" &&
    !!spec.provenance && Object.keys(spec.provenance).length > 0
  );
}

/* -------------------------------------------------------------------------- */
/*  Matching scene ↔ block (B4)                                               */
/* -------------------------------------------------------------------------- */

/** Blocks whose renderable category is a visual grid (gallery family). */
const isGalleryBlock = (b: Block): boolean => renderableCategory(b.type) === "portfolio";

/**
 * Match measured scenes to generated blocks. Pure and conservative:
 * hero/footer by type (first/last of their kind), gallery scenes to
 * gallery-family blocks by rank, remaining "section" scenes to remaining
 * section blocks by rank. Nav scenes have no block (SiteNav is separate).
 * Anything unmatched is dropped — an unmatched block keeps no `scene` and the
 * SceneShell stays transparent for it.
 */
export function matchScenesToBlocks(scenes: SceneDna[], blocks: Block[]): Map<string, SceneDna> {
  const matched = new Map<string, SceneDna>();
  const ordered = [...scenes].sort((a, b) => a.order - b.order);
  const byType = (t: SceneType) => ordered.filter((s) => effectiveType(s) === t);

  const heroScene = byType("hero")[0];
  const heroBlock = blocks.find((b) => b.type === "hero");
  if (heroScene && heroBlock) matched.set(heroBlock.id, heroScene);

  const footerScenes = byType("footer");
  const footerScene = footerScenes[footerScenes.length - 1];
  const footerBlock = [...blocks].reverse().find((b) => b.type === "footer");
  if (footerScene && footerBlock) matched.set(footerBlock.id, footerScene);

  const galleryScenes = byType("gallery");
  const galleryBlocks = blocks.filter((b) => !matched.has(b.id) && b.type !== "hero" && b.type !== "footer" && isGalleryBlock(b));
  for (let i = 0; i < Math.min(galleryScenes.length, galleryBlocks.length); i++) {
    matched.set(galleryBlocks[i].id, galleryScenes[i]);
  }

  const sectionScenes = byType("section");
  const sectionBlocks = blocks.filter(
    (b) => !matched.has(b.id) && b.type !== "hero" && b.type !== "footer" && !isGalleryBlock(b),
  );
  for (let i = 0; i < Math.min(sectionScenes.length, sectionBlocks.length); i++) {
    matched.set(sectionBlocks[i].id, sectionScenes[i]);
  }

  return matched;
}

/* -------------------------------------------------------------------------- */
/*  Entry point (B3) — called by composer.ts#compose                          */
/* -------------------------------------------------------------------------- */

/**
 * Named decision sources for the Composition Engine, merged fill-only in
 * declaration order (measured > dna/premium). The engine never knows an
 * origin beyond the provenance label — future understanding layers (D6:
 * BusinessDNA, IntentDNA, BrandDNA, ContentDNA…) join as new named sources
 * here, each filling only the holes the higher-ranked sources left.
 */
export interface SceneSpecSources {
  /** Per-scene measured truth (C6). Highest rank, never overwritten (I1). */
  measured?: SceneMeasurement;
  /** Resolved DesignDNA. Its `composition` field is only present when a real
   *  signal produced it (premium inspiration gated by similarity ≥ 0.6) —
   *  presets alone never drive scene composition. */
  dna?: DesignDNA;
}

/** DesignDNA imagePosition → measured-media vocabulary ("none" offers nothing). */
const PREMIUM_MEDIA_POSITION: Partial<Record<string, NonNullable<SceneSpec["heroMediaPosition"]>>> = {
  behind: "behind",
  left: "left",
  right: "right",
  below: "bottom",
};

/** Fill the holes of a hero spec from the premium composition direction. */
function fillHeroFromDna(spec: SceneSpec, dna: DesignDNA): void {
  const occ = dna.composition?.heroViewportOccupation;
  if (spec.minHeightVh === undefined && occ !== undefined && inRange(occ / 100, HERO_VIEWPORT_RATIO_RANGE)) {
    spec.minHeightVh = Math.round(occ);
    spec.provenance.minHeightVh = "premium";
  }
  const mapped = PREMIUM_MEDIA_POSITION[dna.heroDirection.imagePosition];
  if (spec.heroMediaPosition === undefined && mapped) {
    spec.heroMediaPosition = mapped;
    spec.provenance.heroMediaPosition = "premium";
  }
}

/**
 * Attach a resolved SceneSpec to every block with a usable decision:
 * measured scene first (I1), then premium composition for the hero when a
 * genuine inspiration signal exists (`dna.composition` — see gate above).
 * Pure: never mutates the input; with no usable source it returns the input
 * array UNCHANGED (same references) so the V5 path stays byte-identical.
 */
export function compileSceneSpecs(blocks: Block[], sources: SceneSpecSources): Block[] {
  const { measured, dna } = sources;
  const matched = measured && measured.scenes.length > 0
    ? matchScenesToBlocks(measured.scenes, blocks)
    : new Map<string, SceneDna>();
  // Premium gate: composition present ⇔ a real signal (inspiration ≥ 0.6).
  const premiumHero = dna?.composition ? dna : undefined;
  if (matched.size === 0 && !premiumHero) return blocks;

  let changed = false;
  const out = blocks.map((block) => {
    const scene = matched.get(block.id);
    let spec = scene ? sceneSpecFrom(scene) : undefined;
    if (block.type === "hero" && premiumHero) {
      // Deterministic synthetic join key (block ids are random — traces must
      // stay byte-stable across identical runs).
      spec ??= { path: `premium:${block.type}`, sceneType: "hero", provenance: {} };
      fillHeroFromDna(spec, premiumHero);
    }
    if (!spec || !assertRenderable(spec)) return block;
    changed = true;
    return { ...block, scene: spec };
  });
  return changed ? out : blocks;
}

/* -------------------------------------------------------------------------- */
/*  Trace — scene decisions land in the PipelineTrace like every other one    */
/* -------------------------------------------------------------------------- */

const TRACE_SOURCE: Record<SceneFieldSource, Source> = {
  measured: "measured",
  premium: "curated",
  default: "preset",
};

/**
 * Mirror each resolved scene decision into PipelineTrace entries
 * (`scene.<blockType>.<field>`), so "why this hero height?" is answerable
 * from the same trace as every DNA/content decision.
 */
export function sceneTraceEntries(blocks: Block[]): PipelineTrace {
  const trace: PipelineTrace = [];
  for (const block of blocks) {
    const spec = block.scene;
    if (!spec) continue;
    for (const [field, src] of Object.entries(spec.provenance)) {
      if (!src) continue;
      const raw = spec[field as keyof SceneSpec];
      const value = typeof raw === "object" && raw !== null ? { ...(raw as object) } : raw;
      const resolved = resolveField(`scene.${block.type}.${field}`, [
        sourced(value, TRACE_SOURCE[src], `compose/scene-spec.ts (${spec.path})`),
      ]);
      if (resolved) trace.push(traceEntry(resolved));
    }
  }
  return trace;
}
