/**
 * Narrative rhythm — the page's scroll architecture.
 *
 * A premium page is not a stack of equal bands. It has a rhythm: an impactful
 * open, a breath, a dense passage of proof, an emotional pause, a punch of
 * conversion. Two brands with different creative directions should scroll
 * differently — a Luxury Editorial page breathes in long editorial pauses; a
 * Performance page hits in tight staccato; a crescendo builds toward the CTA.
 *
 * This pass turns the Art Direction's `sectionRhythm` (chosen by the Design
 * Intelligence / creative direction) into REAL per-section vertical rhythm by
 * filling each block's SceneSpec `paddingY` (and grid `gapPx`). It is strictly
 * FILL-ONLY (invariant I1): a value measured from the real source, or set by a
 * premium inspiration, is never overwritten — the rhythm only fills the silence
 * where nothing was measured, which is the common case for a redesign.
 */

import type { Block } from "../generation/types";
import type { ArtDirection } from "../generation/art-direction";
import { renderableCategory } from "../generation/structure";

export interface RhythmSources {
  artDirection?: ArtDirection;
}

// Padding is intentionally restrained: rhythm is carried by the VARIATION
// between sections, not by huge absolute values. Oversized padding on a thin
// section reads as an unfinished void, not as luxury.
const PAD_MIN = 48;
const PAD_MAX = 152;

const clampPad = (n: number) => Math.max(PAD_MIN, Math.min(PAD_MAX, Math.round(n)));

/** Base section padding (px) from the whitespace strategy + how airy the brand is. */
function basePad(ad: ArtDirection): number {
  const byWs: Record<ArtDirection["whitespaceStrategy"], number> = {
    "editorial-breathing": 104,
    generous: 92,
    balanced: 80,
    dense: 64,
  };
  let p = byWs[ad.whitespaceStrategy] ?? 84;
  // Airier (higher luxury) brands breathe a little more; capped so it can't void.
  p += Math.round(((ad.luxuryLevel ?? 50) - 50) / 50 * 10);
  // The brand's own visual density (an energy signal from the Brand Personality
  // Engine) tightens or opens the whole page — a fierce, kinetic brand scrolls
  // fast, a serene one breathes — independent of the whitespace enum.
  p += Math.round((50 - (ad.visualDensity ?? 50)) / 50 * 16);
  return p;
}

/**
 * The rhythm curve: a padding multiplier for the middle section at position
 * `p` of `m`. Each named rhythm draws a genuinely different scroll silhouette;
 * amplitudes are compressed so the shape reads without ever emptying a section.
 */
function rhythmMultiplier(rhythm: ArtDirection["sectionRhythm"], p: number, m: number): number {
  const t = m > 1 ? p / (m - 1) : 0;
  switch (rhythm) {
    case "crescendo":
      return 0.86 + t * 0.42; // opens tight, opens up toward the conversion
    case "wave":
      return p % 2 === 0 ? 1.22 : 0.82; // breathe / compress / breathe
    case "staccato":
      return p % 3 === 2 ? 1.28 : 0.8; // clipped, with a punch every third beat
    case "editorial-pause":
      return p % 2 === 0 ? 1.04 : 1.34; // luxury pauses between movements
    case "steady":
    default: {
      // Never perfectly flat — a gentle swell so it still reads as composed.
      const gentle = [1.0, 0.92, 1.08, 0.95, 1.05, 0.93];
      return gentle[p % gentle.length];
    }
  }
}

/**
 * How much content a block actually carries — a thin section (a lone heading, no
 * items, no image) must NOT get luxury padding, or it becomes a void. Rich
 * sections earn their breathing room. Read heuristically from the built props.
 */
function contentWeight(block: Block): number {
  const p = (block.props ?? {}) as Record<string, unknown>;
  const items = Array.isArray(p.items) ? p.items.length : 0;
  const hasImage = typeof p.image === "string" || (Array.isArray(p.images) && p.images.length > 0);
  const hasBody = typeof p.body === "string" && p.body.length > 40;
  if (items >= 3 || (hasImage && (hasBody || items >= 1))) return 1;      // rich
  if (items >= 1 || hasImage || hasBody) return 0.86;                     // normal
  return 0.7;                                                             // thin → stay compact
}

/** Grid gap (px) from how dense the direction wants the composition. */
function gridGap(ad: ArtDirection): number {
  if (ad.whitespaceStrategy === "dense") return 18;
  if (ad.whitespaceStrategy === "editorial-breathing" || ad.luxuryLevel >= 70) return 44;
  if (ad.whitespaceStrategy === "generous") return 36;
  return 28;
}

const GRID_CATEGORIES = new Set(["portfolio", "features", "services", "testimonials"]);

/**
 * Apply the narrative rhythm to a block list. Pure: returns new blocks; never
 * overwrites a measured / premium SceneSpec field (I1). With no Art Direction it
 * returns the input unchanged.
 */
export function applyNarrativeRhythm(blocks: Block[], sources: RhythmSources): Block[] {
  const ad = sources.artDirection;
  if (!ad || blocks.length < 3) return blocks;

  // The middle = everything between the hero (first) and the footer (last).
  const first = 0;
  const last = blocks.length - 1;
  const isFooter = (b: Block) => b.type === "footer";
  const middleIdx = blocks
    .map((_, i) => i)
    .filter((i) => i !== first && !(i === last && isFooter(blocks[last])) && blocks[i].type !== "hero" && blocks[i].type !== "footer");
  const m = middleIdx.length;
  if (m === 0) return blocks;

  const base = basePad(ad);
  const gap = gridGap(ad);

  let changed = false;
  const out = blocks.map((block, i) => {
    const pos = middleIdx.indexOf(i);
    if (pos < 0) return block; // hero / footer / already-excluded → untouched

    const mult = rhythmMultiplier(ad.sectionRhythm, pos, m);
    // Thin sections stay compact so the rhythm never opens into a void.
    const pad = clampPad(base * mult * contentWeight(block));
    // A pause opens a touch more than it closes, for a graceful entrance.
    const topPx = pad;
    const bottomPx = mult >= 1.3 ? clampPad(pad * 0.92) : pad;

    const existing = block.scene;
    // Respect I1: a measured / premium paddingY stays; we only fill silence.
    const paddingMeasured = !!existing?.paddingY;
    const isGrid = GRID_CATEGORIES.has(renderableCategory(block.type));
    const gapMeasured = existing?.gapPx !== undefined;

    if (paddingMeasured && (!isGrid || gapMeasured)) return block;

    changed = true;
    const sceneType: "gallery" | "section" = isGrid ? "gallery" : "section";
    const scene = existing
      ? { ...existing, provenance: { ...existing.provenance } }
      : { path: `rhythm:${block.type}:${pos}`, sceneType, provenance: {} as Record<string, "measured" | "premium" | "default"> };

    if (!paddingMeasured) {
      scene.paddingY = { topPx, bottomPx };
      scene.provenance.paddingY = "default";
    }
    if (isGrid && !gapMeasured) {
      scene.gapPx = gap;
      scene.provenance.gapPx = "default";
    }
    return { ...block, scene };
  });

  return changed ? out : blocks;
}
