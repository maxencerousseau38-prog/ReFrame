import { describe, it, expect } from "vitest";
import { qualityReport, weakestCategories } from "./quality";
import type { SiteSchema } from "./types";

const mk = (blocks: { type: string; props?: Record<string, unknown> }[], theme: Record<string, unknown> = { accent: "#5e6ad2", font: "geist" }) =>
  ({ blocks, theme } as unknown as SiteSchema);

describe("qualityReport (premium floor, made objective)", () => {
  it("scores a complete premium site high with no issues", () => {
    const r = qualityReport(
      mk([
        { type: "hero", props: { image: "https://x/h.jpg", primaryCta: "Book a table" } },
        { type: "features", props: {} },
        { type: "testimonials", props: {} },
        { type: "cta", props: {} },
        { type: "contact", props: {} },
        { type: "footer", props: {} },
      ])
    );
    expect(r.overall).toBeGreaterThanOrEqual(95);
    expect(r.issues).toHaveLength(0);
    expect(r.categories.conversion).toBe(100);
  });

  it("flags concrete gaps on a sparse rebuild and lowers the score", () => {
    const r = qualityReport(mk([{ type: "hero", props: {} }, { type: "footer", props: {} }]));
    expect(r.overall).toBeLessThan(85);
    expect(r.issues).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Hero has no image/),
        expect.stringMatching(/no primary call-to-action/i),
        expect.stringMatching(/No closing call-to-action/),
        expect.stringMatching(/No contact section/),
        expect.stringMatching(/No social proof/),
      ])
    );
    // images & conversion are the genuinely weak axes here
    expect(weakestCategories(r, 2)).toEqual(expect.arrayContaining(["conversion"]));
  });

  it("penalises a missing hero hard (hierarchy)", () => {
    const r = qualityReport(mk([{ type: "features", props: {} }, { type: "footer", props: {} }]));
    expect(r.categories.hierarchy).toBeLessThan(60);
    expect(r.issues).toEqual(expect.arrayContaining([expect.stringMatching(/No hero/)]));
  });
});
