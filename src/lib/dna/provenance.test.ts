import { describe, it, expect } from "vitest";
import {
  sourced,
  rank,
  resolveField,
  refine,
  traceEntry,
  deepFreeze,
  isResolved,
  SOURCE_PRIORITY,
  LOW_CONFIDENCE_MEASURED,
  type Source,
  type Sourced,
} from "./provenance";

const SOURCES: Source[] = ["measured", "user", "inferred", "curated", "preset"];

const c = (source: Source, value: string = source, confidence = 1, origin = `test#${source}`) =>
  sourced(value, source, origin, confidence);

/* -------------------------------------------------------------------------- */
/*  sourced()                                                                 */
/* -------------------------------------------------------------------------- */

describe("sourced", () => {
  it("freezes instances — direct mutation throws (G1 runtime barrier)", () => {
    const s = c("measured");
    expect(() => {
      (s as { value: string }).value = "hacked";
    }).toThrow(TypeError);
  });

  it("rejects invalid confidence and missing origin — no invented metadata", () => {
    expect(() => sourced(1, "measured", "x", 1.2)).toThrow();
    expect(() => sourced(1, "measured", "x", -0.1)).toThrow();
    expect(() => sourced(1, "measured", "x", NaN)).toThrow();
    expect(() => sourced(1, "measured", "")).toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/*  resolveField — G2: exhaustive source-pair precedence                      */
/* -------------------------------------------------------------------------- */

describe("resolveField precedence (G2)", () => {
  it("for every source pair, the higher rank wins regardless of offer order", () => {
    for (const a of SOURCES) {
      for (const b of SOURCES) {
        const ca = c(a);
        const cb = c(b);
        const expected =
          SOURCE_PRIORITY[a] > SOURCE_PRIORITY[b] ? a
          : SOURCE_PRIORITY[b] > SOURCE_PRIORITY[a] ? b
          : undefined; // equal priority → confidence/lexicographic tiebreak

        for (const order of [[ca, cb], [cb, ca]]) {
          const slot = resolveField("f", order)!;
          if (expected) expect(slot.chosen.source).toBe(expected);
          else expect([a, b]).toContain(slot.chosen.source);
        }
      }
    }
  });

  it("offer order never changes the outcome, including rejected contents (determinism)", () => {
    const candidates = [c("preset"), c("measured"), c("curated"), c("inferred")];
    const shuffled = [candidates[2], candidates[0], candidates[3], candidates[1]];
    const s1 = resolveField("f", candidates)!;
    const s2 = resolveField("f", shuffled)!;
    expect(s1.chosen).toEqual(s2.chosen);
    expect(s1.rejected).toEqual(s2.rejected);
  });

  it("charter A2: measured below 0.4 confidence is demoted below curated…", () => {
    const weak = c("measured", "weak-measure", 0.39);
    const cur = c("curated", "curated-value", 1);
    const slot = resolveField("f", [weak, cur])!;
    expect(slot.chosen.source).toBe("curated");
    // …but the demoted measurement is ARCHIVED, never lost (G4)
    expect(slot.rejected).toContainEqual(weak);
    expect(rank(weak)).toBeLessThan(SOURCE_PRIORITY.curated);
  });

  it("boundary: confidence exactly 0.4 is NOT demoted", () => {
    const edge = c("measured", "edge", LOW_CONFIDENCE_MEASURED);
    const slot = resolveField("f", [edge, c("curated")])!;
    expect(slot.chosen.source).toBe("measured");
  });

  it("equal rank → higher confidence wins", () => {
    const lo = sourced("lo", "curated", "a", 0.5);
    const hi = sourced("hi", "curated", "b", 0.9);
    expect(resolveField("f", [lo, hi])!.chosen.value).toBe("hi");
  });

  it("skips undefined candidates; nothing offered → undefined (nothing invented)", () => {
    expect(resolveField("f", [undefined, undefined])).toBeUndefined();
    const slot = resolveField("f", [undefined, c("preset")])!;
    expect(slot.chosen.source).toBe("preset");
    expect(slot.rejected).toHaveLength(0);
  });

  it("conservation invariant (G4): |offered| = 1 chosen + |rejected|", () => {
    const offered = [c("preset"), c("curated"), c("inferred"), c("measured"), c("user")];
    const slot = resolveField("f", offered)!;
    expect(1 + slot.rejected.length).toBe(offered.length);
    const all = [slot.chosen, ...slot.rejected];
    for (const o of offered) expect(all).toContainEqual(o);
  });

  it("slots are frozen and branded", () => {
    const slot = resolveField("f", [c("measured")])!;
    expect(isResolved(slot)).toBe(true);
    expect(() => {
      (slot as unknown as { chosen: unknown }).chosen = c("preset");
    }).toThrow(TypeError);
    expect(() => {
      (slot.rejected as unknown[]).push(c("preset"));
    }).toThrow(TypeError);
  });
});

/* -------------------------------------------------------------------------- */
/*  refine — I1: strict monotone completion                                   */
/* -------------------------------------------------------------------------- */

describe("refine (I1)", () => {
  it("fills an empty slot", () => {
    const slot = refine(undefined, "f", c("curated"));
    expect(slot.chosen.source).toBe("curated");
  });

  it("NEVER substitutes an occupied slot — even a measured candidate lands in rejected", () => {
    const first = refine(undefined, "f", c("preset", "kept"));
    const after = refine(first, "f", c("measured", "late-measure"));
    expect(after.chosen.value).toBe("kept"); // monotonicity beats rank, by design (A1)
    expect(after.rejected).toContainEqual(c("measured", "late-measure"));
  });

  it("is idempotent on the chosen value and loses nothing across repeated calls", () => {
    let slot = refine(undefined, "f", c("measured", "m"));
    slot = refine(slot, "f", c("curated", "c1"));
    slot = refine(slot, "f", c("preset", "p1"));
    expect(slot.chosen.value).toBe("m");
    expect(slot.rejected.map((r) => r.value)).toEqual(["c1", "p1"]);
  });
});

/* -------------------------------------------------------------------------- */
/*  trace                                                                     */
/* -------------------------------------------------------------------------- */

describe("traceEntry", () => {
  it("answers 'why this value?' with provenance and a reason", () => {
    const slot = resolveField("hero.heightVh", [
      sourced(82, "measured", "measure/scenes.ts#hero", 0.9),
      sourced(100, "curated", "reference-db#archform"),
      sourced(85, "preset", "dna.ts#compileHeroDirection"),
    ])!;
    const entry = traceEntry(slot);
    expect(entry.field).toBe("hero.heightVh");
    expect(entry.chosen).toMatchObject({ source: "measured", origin: "measure/scenes.ts#hero", value: "82" });
    expect(entry.rejected).toHaveLength(2);
    expect(entry.reason).toContain("measured");
  });

  it("explains the demotion rule in plain words", () => {
    const slot = resolveField("f", [
      sourced("weak", "measured", "m", 0.2),
      sourced("cur", "curated", "c"),
    ])!;
    expect(traceEntry(slot).reason).toContain("demoted");
  });

  it("truncates huge values in summaries", () => {
    const slot = resolveField("f", [sourced("x".repeat(500), "preset", "p")])!;
    expect(traceEntry(slot).chosen.value.length).toBeLessThanOrEqual(120);
  });
});

/* -------------------------------------------------------------------------- */
/*  deepFreeze                                                                */
/* -------------------------------------------------------------------------- */

describe("deepFreeze (G4 input barrier)", () => {
  it("freezes nested objects and arrays", () => {
    const obj = deepFreeze({ a: { b: [1, { c: 2 }] } });
    expect(() => {
      (obj.a.b[1] as { c: number }).c = 99;
    }).toThrow(TypeError);
    expect(() => {
      (obj.a.b as unknown[]).push(3);
    }).toThrow(TypeError);
  });

  it("skips Buffers/typed arrays (freezing views throws in V8) and survives cycles", () => {
    const buf = Buffer.from("img");
    type Cyc = { buf: Buffer; self?: unknown };
    const cyc: Cyc = { buf };
    cyc.self = cyc;
    expect(() => deepFreeze(cyc)).not.toThrow();
    expect(Object.isFrozen(cyc)).toBe(true);
    expect(Object.isFrozen(buf)).toBe(false);
    buf[0] = 105; // buffers stay writable by design
    expect(buf[0]).toBe(105);
  });
});

/* -------------------------------------------------------------------------- */
/*  Type-level barrier (G1): documented compile-time expectations             */
/* -------------------------------------------------------------------------- */

describe("type barrier (G1)", () => {
  it("a structural fake without the brand symbol is not a Resolved", () => {
    const fake = {
      field: "f",
      chosen: c("preset"),
      rejected: [] as Sourced<string>[],
    };
    expect(isResolved(fake)).toBe(false);
  });
});
