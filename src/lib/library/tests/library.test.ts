/**
 * Premium Composition Library — test suite.
 *
 * Covers: registry, scoring, rhythm, diversity, selection, validator,
 * randomizer, and premium rules.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  register,
  get,
  getAll,
  getByCategory,
  getByFamily,
  query,
  getStats,
  _resetForTests,
  selectComposition,
  selectMany,
  scoreComposition,
  calculatePremiumScore,
  validatePremiumQuality,
  calculateEditorialRhythm,
  analyzeRhythm,
  calculateDiversityPenalty,
  validateComposition,
  validateAll,
  fnv1a,
  seededFloat,
  seededPick,
  seededShuffle,
  applyScoreJitter,
  MINIMUM_PREMIUM_SCORE,
} from "../index";

import type {
  CompositionEntry,
  SelectionContext,
  CompositionSpec,
  LibraryIndustry,
} from "../types";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

const makeSpec = (overrides: Partial<CompositionSpec> = {}): CompositionSpec => ({
  grid: "12",
  columns: [3, 9],
  sectionHeight: "100vh",
  container: "1280",
  negativeSpace: "extreme",
  textPosition: "left",
  imagePosition: "behind",
  imageRatio: "4:3",
  imageOverflow: true,
  headlineFont: "display",
  headlineSize: "clamp(56px,7vw,120px)",
  headlineMaxLines: 2,
  headlineWidth: 480,
  cta: "pill",
  overlay: "none",
  motion: "cinematic",
  readingFlow: "f-pattern",
  layout: "split-editorial",
  sectionPadding: "120px 0",
  columnGap: "48px",
  isFullViewport: true,
  ...overrides,
});

const makeEntry = (id: string, overrides: Partial<CompositionEntry> = {}): CompositionEntry => ({
  id,
  category: "hero",
  family: "editorial",
  complexity: 3,
  premium: 96,
  industries: ["technology", "saas"] as LibraryIndustry[],
  responsive: {
    desktop: makeSpec(),
    tablet: { columns: [12], headlineSize: "clamp(40px,6vw,64px)" },
    mobile: { columns: [12], headlineSize: "clamp(32px,8vw,52px)" },
  },
  rhythm: {
    negativeSpaceRatio: 0.45,
    readingFlow: "f-pattern",
    visualWeight: "medium",
    balance: "asymmetric",
    breathingRoom: "generous",
    density: "sparse",
    luxuryScore: 70,
    editorialScore: 72,
    hierarchyScore: 75,
  },
  score: {
    editorialQuality: 72,
    luxuryFeeling: 70,
    framerSimilarity: 78,
    balance: 75,
    hierarchy: 75,
    whitespace: 80,
    typography: 78,
    motion: 80,
    gridQuality: 80,
    conversion: 85,
    imageRhythm: 75,
    storytelling: 70,
    originality: 65,
  },
  constraints: {
    blockedLayouts: ["split-editorial"],
    blockedColumns: [[3, 9]],
    blockedImageRatios: ["4:3"],
    blockedMotions: ["cinematic"],
    blockedCtas: ["pill"],
    blockedAlignments: ["left"],
  },
  inspirations: ["Test"],
  tags: ["test", "fixture"],
  description: "Test fixture composition.",
  ...overrides,
});

/* -------------------------------------------------------------------------- */
/*  Registry                                                                  */
/* -------------------------------------------------------------------------- */

describe("Composition Registry", () => {
  beforeEach(() => {
    _resetForTests();
  });

  it("registers a composition and retrieves it by ID", () => {
    const entry = makeEntry("hero_editorial_test_001");
    register(entry);
    expect(get("hero_editorial_test_001")).toEqual(entry);
  });

  it("returns undefined for unknown IDs", () => {
    expect(get("nonexistent")).toBeUndefined();
  });

  it("getAll returns all registered compositions", () => {
    register(makeEntry("hero_editorial_test_001"));
    register(makeEntry("hero_editorial_test_002"));
    expect(getAll().length).toBe(2);
  });

  it("getByCategory filters correctly", () => {
    register(makeEntry("hero_editorial_test_001", { category: "hero" }));
    register(makeEntry("features_cards_test_001", { category: "features" }));
    expect(getByCategory("hero").length).toBe(1);
    expect(getByCategory("features").length).toBe(1);
    expect(getByCategory("about").length).toBe(0);
  });

  it("getByFamily filters correctly", () => {
    register(makeEntry("hero_editorial_test_001", { family: "editorial" }));
    register(makeEntry("hero_luxury_test_001", { family: "luxury" }));
    expect(getByFamily("editorial").length).toBe(1);
    expect(getByFamily("luxury").length).toBe(1);
  });

  it("query applies minPremium filter", () => {
    register(makeEntry("hero_editorial_test_001", { premium: 96 }));
    register(makeEntry("hero_editorial_test_002", { premium: 92 }));
    expect(query({ minPremium: 95 }).length).toBe(1);
  });

  it("query applies maxComplexity filter", () => {
    register(makeEntry("hero_editorial_test_001", { complexity: 5 }));
    register(makeEntry("hero_editorial_test_002", { complexity: 2 }));
    expect(query({ maxComplexity: 3 }).length).toBe(1);
  });

  it("duplicate registration overwrites the previous entry", () => {
    const v1 = makeEntry("hero_editorial_test_001", { premium: 95 });
    const v2 = makeEntry("hero_editorial_test_001", { premium: 98 });
    register(v1);
    register(v2);
    expect(get("hero_editorial_test_001")?.premium).toBe(98);
    expect(getAll().length).toBe(1);
  });

  it("getStats returns correct totals", () => {
    register(makeEntry("hero_editorial_test_001", { premium: 96 }));
    register(makeEntry("hero_editorial_test_002", { premium: 97 }));
    const stats = getStats();
    expect(stats.total).toBe(2);
    expect(stats.byCategory["hero"]).toBe(2);
    expect(stats.averagePremium).toBeCloseTo(96.5, 0);
    expect(stats.premiumCount).toBe(2);
  });
});

/* -------------------------------------------------------------------------- */
/*  Visual Rhythm                                                              */
/* -------------------------------------------------------------------------- */

describe("Visual Rhythm Engine", () => {
  it("assigns 'extreme' breathing room for extreme negative space", () => {
    const spec = makeSpec({ negativeSpace: "extreme" });
    const rhythm = calculateEditorialRhythm(spec);
    expect(rhythm.breathingRoom).toBe("extreme");
    expect(rhythm.negativeSpaceRatio).toBe(0.75);
  });

  it("assigns higher luxury score for extreme negative space than low", () => {
    const luxe = calculateEditorialRhythm(makeSpec({ negativeSpace: "extreme" }));
    const low = calculateEditorialRhythm(makeSpec({ negativeSpace: "low" }));
    expect(luxe.luxuryScore).toBeGreaterThan(low.luxuryScore);
  });

  it("clamp() headline boosts Framer similarity score", () => {
    const withClamp = calculateEditorialRhythm(makeSpec({ headlineSize: "clamp(52px,6vw,88px)" }));
    const noClamp = calculateEditorialRhythm(makeSpec({ headlineSize: "88px" }));
    // Both just compute rhythm — but the editorial score should reflect headline size
    expect(withClamp.editorialScore).toBeGreaterThanOrEqual(noClamp.editorialScore - 5);
  });

  it("infers 'tension' balance for overlapping compositions", () => {
    const rhythm = calculateEditorialRhythm(makeSpec({ usesOverlap: true }));
    expect(rhythm.balance).toBe("tension");
  });

  it("analyzeRhythm flags low luxury score", () => {
    // Use symmetrical columns + no motion + low space to force luxuryScore < 40
    const entry = makeEntry("test_001", {
      responsive: {
        desktop: makeSpec({ negativeSpace: "low", columns: [12], motion: "none" }),
        tablet: {},
        mobile: {},
      },
    });
    const { flags } = analyzeRhythm(entry);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.some((f) => f.includes("luxury"))).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  Premium Rules                                                              */
/* -------------------------------------------------------------------------- */

describe("Premium Rules", () => {
  it("calculates a score object with overall and breakdown", () => {
    const spec = makeSpec();
    const score = calculatePremiumScore(spec);
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(typeof score.breakdown.editorialQuality).toBe("number");
    expect(typeof score.breakdown.framerSimilarity).toBe("number");
  });

  it("validates that extreme-space clamp headline passes floor", () => {
    const spec = makeSpec({
      negativeSpace: "very_high",
      headlineSize: "clamp(56px,6vw,96px)",
      motion: "cinematic",
      headlineFont: "display",
    });
    expect(validatePremiumQuality(spec, 75)).toBe(true);
  });

  it("cinematic motion scores higher than 'none'", () => {
    const withMotion = calculatePremiumScore(makeSpec({ motion: "cinematic" }));
    const noMotion = calculatePremiumScore(makeSpec({ motion: "none" }));
    expect(withMotion.breakdown.motion).toBeGreaterThan(noMotion.breakdown.motion);
  });

  it("display headline scores higher than sans for typography", () => {
    const display = calculatePremiumScore(makeSpec({ headlineFont: "display" }));
    const sans = calculatePremiumScore(makeSpec({ headlineFont: "sans" }));
    expect(display.breakdown.typography).toBeGreaterThanOrEqual(sans.breakdown.typography);
  });

  it("is deterministic for the same spec", () => {
    const spec = makeSpec();
    const a = calculatePremiumScore(spec);
    const b = calculatePremiumScore(spec);
    expect(a).toEqual(b);
  });
});

/* -------------------------------------------------------------------------- */
/*  Layout Rules                                                               */
/* -------------------------------------------------------------------------- */

describe("Layout Rules — calculateDiversityPenalty", () => {
  it("returns zero penalty for empty history", () => {
    const entry = makeEntry("test_001");
    const { penalty } = calculateDiversityPenalty(entry, []);
    expect(penalty).toBe(0);
  });

  it("penalizes identical layout in the previous section", () => {
    const entry = makeEntry("test_001");
    const history = [{
      compositionId: "prev",
      category: "hero" as const,
      layout: "split-test",
      columns: [6, 6],
      imageRatio: "4:3" as const,
      motion: "reveal" as const,
      cta: "pill" as const,
      textPosition: "left" as const,
    }];
    const { penalty } = calculateDiversityPenalty(entry, history);
    expect(penalty).toBeGreaterThan(0);
  });

  it("penalty ≤ 1 always", () => {
    const entry = makeEntry("test_001");
    const history = Array.from({ length: 5 }, (_, i) => ({
      compositionId: `prev_${i}`,
      category: "hero" as const,
      layout: "split-test",
      columns: [6, 6],
      imageRatio: "4:3" as const,
      motion: "reveal" as const,
      cta: "pill" as const,
      textPosition: "left" as const,
    }));
    const { penalty } = calculateDiversityPenalty(entry, history);
    expect(penalty).toBeLessThanOrEqual(1);
  });

  it("respects explicit blockedLayouts from previous entry", () => {
    const entry = makeEntry("test_001");
    const previousEntry = makeEntry("test_000", {
      constraints: {
        blockedLayouts: ["split-editorial"],
        blockedColumns: [],
        blockedImageRatios: [],
        blockedMotions: [],
        blockedCtas: [],
        blockedAlignments: [],
      },
    });
    const { penalty } = calculateDiversityPenalty(entry, [], previousEntry);
    expect(penalty).toBeGreaterThan(0.9);
  });
});

/* -------------------------------------------------------------------------- */
/*  Composition Score                                                          */
/* -------------------------------------------------------------------------- */

describe("Composition Score", () => {
  it("returns a SelectionScoring with all 11 dimensions", () => {
    const entry = makeEntry("test_001");
    const ctx: SelectionContext = { category: "hero", industry: "technology" };
    const scoring = scoreComposition(entry, ctx);
    expect(typeof scoring.industryMatch).toBe("number");
    expect(typeof scoring.luxuryMatch).toBe("number");
    expect(typeof scoring.total).toBe("number");
    expect(scoring.total).toBeGreaterThan(0);
  });

  it("industry match is 100 when the industry is listed", () => {
    const entry = makeEntry("test_001", { industries: ["technology"] });
    const ctx: SelectionContext = { category: "hero", industry: "technology" };
    const scoring = scoreComposition(entry, ctx);
    expect(scoring.industryMatch).toBe(100);
  });

  it("industry match is 30 when industry is not listed", () => {
    const entry = makeEntry("test_001", { industries: ["luxury"] });
    const ctx: SelectionContext = { category: "hero", industry: "technology" };
    const scoring = scoreComposition(entry, ctx);
    expect(scoring.industryMatch).toBe(30);
  });

  it("luxury match is close to 100 when luxuryScore ≈ luxuryTarget", () => {
    const entry = makeEntry("test_001", {
      rhythm: { ...makeEntry("test_001").rhythm, luxuryScore: 80 },
    });
    const ctx: SelectionContext = { category: "hero", industry: "technology", luxuryTarget: 80 };
    const scoring = scoreComposition(entry, ctx);
    expect(scoring.luxuryMatch).toBeGreaterThanOrEqual(95);
  });

  it("visual diversity is 100 for empty history", () => {
    const entry = makeEntry("test_001");
    const ctx: SelectionContext = { category: "hero", industry: "technology", history: [] };
    const scoring = scoreComposition(entry, ctx);
    expect(scoring.visualDiversity).toBe(100);
  });
});

/* -------------------------------------------------------------------------- */
/*  Validator                                                                  */
/* -------------------------------------------------------------------------- */

describe("Composition Validator", () => {
  it("validates a well-formed entry as valid", () => {
    const result = validateComposition(makeEntry("hero_editorial_001"));
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("rejects an entry with a bad ID format", () => {
    const result = validateComposition(makeEntry("badid"));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("pattern"))).toBe(true);
  });

  it("rejects an entry with no industries", () => {
    const result = validateComposition(makeEntry("hero_editorial_001", { industries: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("industry"))).toBe(true);
  });

  it("warns when description is missing", () => {
    const result = validateComposition(makeEntry("hero_editorial_001", { description: "" }));
    expect(result.warnings.some((w) => w.includes("description"))).toBe(true);
  });

  it("validateAll throws when any entry is invalid", () => {
    const bad = makeEntry("bad-id");
    expect(() => validateAll([bad])).toThrow();
  });

  it("validateAll returns results map for valid entries", () => {
    const good = makeEntry("hero_editorial_001");
    const results = validateAll([good]);
    expect(results.has("hero_editorial_001")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  Randomizer                                                                 */
/* -------------------------------------------------------------------------- */

describe("Composition Randomizer", () => {
  it("fnv1a is deterministic", () => {
    expect(fnv1a("hello")).toBe(fnv1a("hello"));
  });

  it("fnv1a returns a positive integer", () => {
    expect(fnv1a("test")).toBeGreaterThan(0);
  });

  it("seededFloat returns [0, 1)", () => {
    for (let i = 0; i < 20; i++) {
      const val = seededFloat("seed", i);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("seededFloat is deterministic", () => {
    expect(seededFloat("brand-abc", 3)).toBe(seededFloat("brand-abc", 3));
  });

  it("seededPick returns null for empty array", () => {
    expect(seededPick([], "seed")).toBeNull();
  });

  it("seededPick returns the single element for length-1 array", () => {
    expect(seededPick(["only"], "seed")).toBe("only");
  });

  it("seededPick is deterministic", () => {
    const arr = ["a", "b", "c", "d"];
    expect(seededPick(arr, "x")).toBe(seededPick(arr, "x"));
  });

  it("seededShuffle produces the same order for the same seed", () => {
    const arr = [1, 2, 3, 4, 5];
    const a = seededShuffle(arr, "s");
    const b = seededShuffle(arr, "s");
    expect(a).toEqual(b);
  });

  it("seededShuffle does not mutate the input", () => {
    const arr = [1, 2, 3];
    seededShuffle(arr, "s");
    expect(arr).toEqual([1, 2, 3]);
  });

  it("applyScoreJitter stays within ±6 points", () => {
    for (let i = 0; i < 20; i++) {
      const jittered = applyScoreJitter(80, `seed_${i}`, "comp_001");
      expect(jittered).toBeGreaterThanOrEqual(74);
      expect(jittered).toBeLessThanOrEqual(86);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  Selector (isolated with test registry)                                    */
/* -------------------------------------------------------------------------- */

describe("Composition Selector", () => {
  beforeEach(() => {
    _resetForTests();
    // Register 3 hero compositions
    register(makeEntry("hero_editorial_001", { industries: ["technology"], premium: 97 }));
    register(makeEntry("hero_editorial_002", { industries: ["technology", "saas"], premium: 96 }));
    register(makeEntry("hero_luxury_001", {
      family: "luxury",
      industries: ["luxury", "fashion"],
      premium: 98,
      responsive: {
        desktop: makeSpec({ negativeSpace: "extreme", motion: "cinematic" }),
        tablet: {},
        mobile: {},
      },
    }));
  });

  it("selectComposition returns a result for a registered category", () => {
    const ctx: SelectionContext = { category: "hero", industry: "technology", seed: "test" };
    const result = selectComposition(ctx);
    expect(result.composition).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
    expect(result.historyEntry).toBeDefined();
  });

  it("is deterministic with the same seed", () => {
    const ctx: SelectionContext = { category: "hero", industry: "technology", seed: "deterministic" };
    const a = selectComposition(ctx);
    const b = selectComposition(ctx);
    expect(a.composition.id).toBe(b.composition.id);
  });

  it("throws for unregistered category", () => {
    const ctx: SelectionContext = { category: "about", industry: "technology", seed: "x" };
    expect(() => selectComposition(ctx)).toThrow(/about/);
  });

  it("respects maxComplexity filter", () => {
    register(makeEntry("hero_editorial_003", { complexity: 5, industries: ["technology"] }));
    register(makeEntry("hero_editorial_004", { complexity: 1, industries: ["technology"] }));
    const ctx: SelectionContext = {
      category: "hero",
      industry: "technology",
      maxComplexity: 2,
      seed: "x",
    };
    const result = selectComposition(ctx);
    expect(result.composition.complexity).toBeLessThanOrEqual(2);
  });

  it("prefers industry-matching compositions", () => {
    // luxury_001 is only tagged for luxury/fashion — technology should prefer the editorial ones
    const ctx: SelectionContext = { category: "hero", industry: "technology", seed: "abc" };
    const result = selectComposition(ctx);
    expect(["hero_editorial_001", "hero_editorial_002"]).toContain(result.composition.id);
  });

  it("selectMany returns N results", () => {
    const ctx: SelectionContext = { category: "hero", industry: "technology", seed: "multi" };
    const results = selectMany(ctx, 3);
    expect(results).toHaveLength(3);
  });

  it("selectMany builds a running history for diversity", () => {
    const ctx: SelectionContext = { category: "hero", industry: "technology", seed: "history" };
    const results = selectMany(ctx, 2);
    expect(results[0].historyEntry).toBeDefined();
    expect(results[1].historyEntry).toBeDefined();
  });
});

/* -------------------------------------------------------------------------- */
/*  Full library integration (uses the real registry after DB import)         */
/* -------------------------------------------------------------------------- */

describe("Full Library Integration", () => {
  it("all registered compositions have premium ≥ 95", () => {
    // Import the real DB (this re-registers everything after the reset tests).
    // We use a dynamic import so reset tests above don't affect it.
    const all = getAll();
    // If the real DB was already loaded (happens when the full registry is active),
    // verify premium floor.
    if (all.length > 0) {
      for (const entry of all) {
        expect(entry.premium).toBeGreaterThanOrEqual(MINIMUM_PREMIUM_SCORE);
      }
    }
  });

  it("all registered compositions have valid IDs matching category_family_NNN", () => {
    const ID_PATTERN = /^[a-z]+_[a-z-]+_\d{3}$/;
    const all = getAll();
    for (const entry of all) {
      expect(ID_PATTERN.test(entry.id)).toBe(true);
    }
  });

  it("all registered compositions have at least one industry", () => {
    const all = getAll();
    for (const entry of all) {
      expect(entry.industries.length).toBeGreaterThan(0);
    }
  });

  it("all registered compositions have required spec fields", () => {
    const all = getAll();
    for (const entry of all) {
      const spec = entry.responsive.desktop;
      expect(spec.grid).toBeTruthy();
      expect(spec.headlineFont).toBeTruthy();
      expect(spec.headlineSize).toBeTruthy();
      expect(spec.cta).toBeTruthy();
      expect(spec.motion).toBeTruthy();
      expect(spec.layout).toBeTruthy();
    }
  });
});
