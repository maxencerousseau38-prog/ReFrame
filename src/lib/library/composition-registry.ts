/**
 * Composition Registry — O(1) lookup, O(n) filtered queries.
 *
 * Compositions are registered at module load time by each category file.
 * The registry never stores markup — only CompositionEntry data objects.
 */

import type {
  CompositionEntry,
  CompositionCategory,
  CompositionFamily,
  RegistryStats,
} from "./types";

// Re-export the constant so callers can use the registry module as their
// single import point for the minimum-score gate.
export { MINIMUM_PREMIUM_SCORE } from "./types";

/* -------------------------------------------------------------------------- */
/*  Internal store                                                             */
/* -------------------------------------------------------------------------- */

const _byId = new Map<string, CompositionEntry>();
const _byCategory = new Map<CompositionCategory, CompositionEntry[]>();
const _byFamily = new Map<string, CompositionEntry[]>();

/* -------------------------------------------------------------------------- */
/*  Registration                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Register one or more compositions.
 * Called by each category index file at module load time.
 *
 * Duplicate IDs are silently overwritten (last-wins) — intentional, so
 * hot-reload works without a reset call.
 */
export function register(...entries: CompositionEntry[]): void {
  for (const entry of entries) {
    _byId.set(entry.id, entry);

    // category index
    if (!_byCategory.has(entry.category)) {
      _byCategory.set(entry.category, []);
    }
    const catList = _byCategory.get(entry.category)!;
    const ci = catList.findIndex((e) => e.id === entry.id);
    if (ci >= 0) catList[ci] = entry; else catList.push(entry);

    // family index
    const fKey = String(entry.family);
    if (!_byFamily.has(fKey)) _byFamily.set(fKey, []);
    const famList = _byFamily.get(fKey)!;
    const fi = famList.findIndex((e) => e.id === entry.id);
    if (fi >= 0) famList[fi] = entry; else famList.push(entry);
  }
}

/* -------------------------------------------------------------------------- */
/*  Lookups                                                                    */
/* -------------------------------------------------------------------------- */

/** Retrieve a single composition by ID. */
export function get(id: string): CompositionEntry | undefined {
  return _byId.get(id);
}

/** Retrieve all registered compositions. */
export function getAll(): CompositionEntry[] {
  return Array.from(_byId.values());
}

/** Retrieve all compositions in a category. */
export function getByCategory(category: CompositionCategory): CompositionEntry[] {
  return _byCategory.get(category) ?? [];
}

/** Retrieve all compositions in a family. */
export function getByFamily(family: CompositionFamily | string): CompositionEntry[] {
  return _byFamily.get(String(family)) ?? [];
}

/**
 * Filtered query. All filters are AND-combined.
 */
export function query(opts: {
  category?: CompositionCategory;
  family?: CompositionFamily | string;
  minPremium?: number;
  maxComplexity?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}): CompositionEntry[] {
  let pool: CompositionEntry[];

  // Start from the smallest index when possible.
  if (opts.category && opts.family) {
    // Intersection via the smaller set.
    const catSet = new Set((_byCategory.get(opts.category) ?? []).map((e) => e.id));
    pool = (_byFamily.get(String(opts.family)) ?? []).filter((e) => catSet.has(e.id));
  } else if (opts.category) {
    pool = _byCategory.get(opts.category) ?? [];
  } else if (opts.family) {
    pool = _byFamily.get(String(opts.family)) ?? [];
  } else {
    pool = Array.from(_byId.values());
  }

  if (opts.minPremium !== undefined) {
    const min = opts.minPremium;
    pool = pool.filter((e) => e.premium >= min);
  }
  if (opts.maxComplexity !== undefined) {
    const max = opts.maxComplexity;
    pool = pool.filter((e) => e.complexity <= max);
  }
  if (opts.tags && opts.tags.length > 0) {
    const tagSet = new Set(opts.tags);
    pool = pool.filter((e) => e.tags.some((t) => tagSet.has(t)));
  }

  return pool;
}

/* -------------------------------------------------------------------------- */
/*  Stats                                                                      */
/* -------------------------------------------------------------------------- */

import { MINIMUM_PREMIUM_SCORE as MIN_SCORE } from "./types"; // runtime value (not just type)

export function getStats(): RegistryStats {
  const all = Array.from(_byId.values());
  const byCategory: Partial<Record<CompositionCategory, number>> = {};
  const byFamily: Partial<Record<string, number>> = {};

  Array.from(_byCategory.entries()).forEach(([cat, list]) => {
    byCategory[cat] = list.length;
  });
  Array.from(_byFamily.entries()).forEach(([fam, list]) => {
    byFamily[fam] = list.length;
  });

  const premiums = all.map((e) => e.premium);
  const avg = premiums.length
    ? premiums.reduce((a, b) => a + b, 0) / premiums.length
    : 0;

  return {
    total: all.length,
    byCategory,
    byFamily,
    averagePremium: Math.round(avg * 10) / 10,
    minPremium: premiums.length ? Math.min(...premiums) : 0,
    premiumCount: all.filter((e) => e.premium >= MIN_SCORE).length,
  };
}

/* -------------------------------------------------------------------------- */
/*  Reset (test-only)                                                         */
/* -------------------------------------------------------------------------- */

/** Clear all registered compositions. For use in unit tests only. */
export function _resetForTests(): void {
  _byId.clear();
  _byCategory.clear();
  _byFamily.clear();
}
