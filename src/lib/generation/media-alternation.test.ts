import { describe, it, expect } from "vitest";
import { alternateMediaSides } from "@/lib/generation/engine";
import type { Block } from "@/lib/generation/types";

/**
 * CD #3: the two-column split sections zig-zag down the page — consecutive splits
 * land on opposite sides — so a page never reads as the same text-left/image-right
 * split repeated. A split hero seeds the anchor; the About that follows opposes it.
 */
const mk = (variant: string): Block => ({ id: variant, type: "about", variant, props: {} } as any);
const flipped = (b: Block) => !!(b.props as any)._mediaFlip;

describe("alternateMediaSides", () => {
  it("flips the 2nd split so two same-natural-side splits end up opposite", () => {
    const bs = [mk("AboutAtelier"), mk("ServicesAtelier")]; // left, left
    alternateMediaSides(bs);
    expect(flipped(bs[0])).toBe(false);
    expect(flipped(bs[1])).toBe(true);
  });
  it("does NOT flip when the natural sides already alternate", () => {
    const bs = [mk("AboutAtelier"), mk("StatementEditorial")]; // left, right
    alternateMediaSides(bs);
    expect(flipped(bs[0])).toBe(false);
    expect(flipped(bs[1])).toBe(false);
  });
  it("keeps zig-zagging across three splits", () => {
    const bs = [mk("StatementEditorial"), mk("ServicesAtelier"), mk("AboutSplit")]; // right, left, left
    alternateMediaSides(bs);
    expect(flipped(bs[0])).toBe(false);
    expect(flipped(bs[1])).toBe(false);
    expect(flipped(bs[2])).toBe(true);
  });
  it("a split hero seeds the alternation so the About opposes it", () => {
    const bs = [mk("HeroCollage"), mk("StatementEditorial")]; // right, right → About flips left
    alternateMediaSides(bs);
    expect(flipped(bs[0])).toBe(false); // the hero is never flipped
    expect(flipped(bs[1])).toBe(true);
  });
  it("ignores non-split sections (full-bleed hero, features, footer)", () => {
    const bs = [mk("HeroImageFull"), mk("FeaturesCards"), mk("Footer1")];
    alternateMediaSides(bs);
    for (const b of bs) expect((b.props as any)._mediaFlip).toBeUndefined();
  });
});
