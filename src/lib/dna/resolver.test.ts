import { describe, it, expect } from "vitest";
import { resolveTree, whyValue, type CandidateLayer } from "./resolver";

const preset = (data: object): CandidateLayer & { data: object } => ({
  data,
  source: "preset",
  origin: "test#preset",
});

const layer = (
  data: unknown,
  source: CandidateLayer["source"],
  origin = `test#${source}`,
  confidence?: number
): CandidateLayer => ({ data, source, origin, confidence });

describe("resolveTree", () => {
  it("measured leaves win; untouched leaves keep the preset; provenance is queryable", () => {
    const res = resolveTree(
      preset({ hero: { heightVh: 85, ctaCount: 2 }, motion: { level: 1 } }),
      [layer({ hero: { heightVh: 100 } }, "measured", "measure#hero", 0.9)]
    );

    expect(res.value).toEqual({ hero: { heightVh: 100, ctaCount: 2 }, motion: { level: 1 } });
    expect(whyValue(res, "hero.heightVh")!.chosen).toMatchObject({
      source: "measured",
      origin: "measure#hero",
    });
    expect(whyValue(res, "hero.ctaCount")!.chosen.source).toBe("preset");
  });

  it("curated fills only the holes measured left (the applyMoodboard bug, killed)", () => {
    const res = resolveTree(
      preset({ hero: { style: "split", heightVh: 85, overlay: false } }),
      [
        layer({ hero: { style: "fullbleed", heightVh: 92 } }, "measured"),
        layer({ hero: { style: "monumental", heightVh: 100, overlay: true } }, "curated"),
      ]
    );

    // measured survives curated — whatever the layer order
    expect(res.value).toEqual({ hero: { style: "fullbleed", heightVh: 92, overlay: true } });
    const style = whyValue(res, "hero.style")!;
    expect(style.chosen.source).toBe("measured");
    expect(style.rejected.map((r) => r.source)).toEqual(["curated", "preset"]);
  });

  it("layer order is irrelevant (precedence comes from ranks, not insertion)", () => {
    const m = layer({ a: 1 }, "measured");
    const c = layer({ a: 2, b: 3 }, "curated");
    const r1 = resolveTree(preset({ a: 0, b: 0 }), [m, c]);
    const r2 = resolveTree(preset({ a: 0, b: 0 }), [c, m]);
    expect(r1.value).toEqual(r2.value);
    expect(r1.trace).toEqual(r2.trace);
  });

  it("arrays are atomic leaves — replaced whole, never merged", () => {
    const res = resolveTree(
      preset({ grid: { columns: [6, 6], gaps: [8, 8] } }),
      [layer({ grid: { columns: [3, 9] } }, "measured")]
    );
    expect(res.value).toEqual({ grid: { columns: [3, 9], gaps: [8, 8] } });
  });

  it("undefined leaves in a layer are 'not offered', not 'offered undefined'", () => {
    const res = resolveTree(
      preset({ x: 1 }),
      [layer({ x: undefined }, "measured")]
    );
    expect(res.value).toEqual({ x: 1 });
    expect(whyValue(res, "x")!.chosen.source).toBe("preset");
    expect(whyValue(res, "x")!.rejected).toHaveLength(0);
  });

  it("extra paths absent from the preset are grafted additively", () => {
    const res = resolveTree(
      preset({ a: 1 }),
      [layer({ fonts: { display: "Inter Display" } }, "measured")]
    );
    expect(res.value).toEqual({ a: 1, fonts: { display: "Inter Display" } });
    expect(whyValue(res, "fonts.display")!.chosen.source).toBe("measured");
  });

  it("shape conflicts never reshape the preset — the candidate is archived in the trace", () => {
    const res = resolveTree(
      preset({ a: 1 }),                       // a is a LEAF in the preset
      [layer({ a: { deep: 2 } }, "measured")] // layer says a is an object
    );
    expect(res.value).toEqual({ a: 1 });      // shape authority: preset
    const entry = res.trace.find((t) => t.field === "a.deep")!;
    expect(entry).toBeDefined();
    expect(entry.reason).toContain("NOT grafted");
    expect(res.slots.get("a.deep")!.chosen.value).toBe(2); // recorded, not lost
  });

  it("low-confidence measured demotion flows through the tree (charter A2)", () => {
    const res = resolveTree(
      preset({ color: "#000" }),
      [
        layer({ color: "#123" }, "measured", "measure#weak", 0.2),
        layer({ color: "#abc" }, "curated"),
      ]
    );
    expect(res.value).toEqual({ color: "#abc" });
    expect(res.slots.get("color")!.rejected.map((r) => r.source)).toContain("measured");
  });

  it("trace has one entry per resolved slot, each with a reason", () => {
    const res = resolveTree(
      preset({ a: 1, b: { c: 2 } }),
      [layer({ b: { c: 3 } }, "measured")]
    );
    expect(res.trace).toHaveLength(res.slots.size);
    for (const entry of res.trace) expect(entry.reason.length).toBeGreaterThan(0);
  });

  it("freezes inputs and output (G4 barrier)", () => {
    const presetData = { a: { b: 1 } };
    const layerData = { a: { b: 2 } };
    const res = resolveTree(preset(presetData), [layer(layerData, "measured")]);

    expect(() => { (presetData.a as { b: number }).b = 99; }).toThrow(TypeError);
    expect(() => { (layerData.a as { b: number }).b = 99; }).toThrow(TypeError);
    expect(() => { (res.value as { a: { b: number } }).a.b = 99; }).toThrow(TypeError);
  });

  it("no layers → preset passthrough with full provenance", () => {
    const res = resolveTree(preset({ a: 1, b: { c: [1, 2] } }));
    expect(res.value).toEqual({ a: 1, b: { c: [1, 2] } });
    for (const slot of Array.from(res.slots.values())) {
      expect(slot.chosen.source).toBe("preset");
      expect(slot.rejected).toHaveLength(0);
    }
  });
});
