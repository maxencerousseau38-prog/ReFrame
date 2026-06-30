/**
 * Composition Selector — main public API.
 *
 * selectComposition(context) picks the best-fitting CompositionEntry for a
 * given SelectionContext from the registered library, enforcing:
 *  1. Category + premium + complexity filters
 *  2. Diversity enforcement via layout-rules
 *  3. Industry / luxury / editorial match scoring
 *  4. Deterministic seeded selection for brand-level variation
 *
 * Never returns null — falls back to the highest-premium entry in the
 * requested category if nothing else matches (graceful degradation).
 */

import type {
  CompositionEntry,
  CompositionCategory,
  SelectionContext,
  SelectedComposition,
  SelectionScoring,
  HistoricalSelection,
} from "./types";
import { MINIMUM_PREMIUM_SCORE } from "./types";
import { getByCategory } from "./composition-registry";
import { scoreComposition } from "./composition-score";
import { applyScoreJitter, seededPick } from "./composition-randomizer";

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

function buildHistoryEntry(entry: CompositionEntry): HistoricalSelection {
  const spec = entry.responsive.desktop;
  return {
    compositionId: entry.id,
    category: entry.category,
    layout: spec.layout,
    columns: spec.columns,
    imageRatio: spec.imageRatio,
    motion: spec.motion,
    cta: spec.cta,
    textPosition: spec.textPosition,
  };
}

/** Returns the highest-premium fallback in the category. */
function fallback(category: CompositionCategory): CompositionEntry | null {
  const pool = getByCategory(category);
  if (pool.length === 0) return null;
  return pool.reduce((best, e) => (e.premium > best.premium ? e : best), pool[0]);
}

/* -------------------------------------------------------------------------- */
/*  Candidate filtering                                                       */
/* -------------------------------------------------------------------------- */

function filterCandidates(
  category: CompositionCategory,
  ctx: SelectionContext,
): CompositionEntry[] {
  const minPremium = ctx.minPremium ?? MINIMUM_PREMIUM_SCORE;
  const maxComplexity = ctx.maxComplexity ?? 5;

  let pool = getByCategory(category).filter(
    (e) => e.premium >= minPremium && e.complexity <= maxComplexity,
  );

  // Family preference filter (soft — only applied if it leaves at least 2 candidates)
  if (ctx.preferFamily) {
    const narrowed = pool.filter((e) => e.family === ctx.preferFamily);
    if (narrowed.length >= 2) pool = narrowed;
  }

  // Dark mode filter: prefer compositions with colorMode "dark" or unset
  if (ctx.isDark) {
    const darkOk = pool.filter(
      (e) =>
        !e.responsive.desktop.colorMode ||
        e.responsive.desktop.colorMode === "dark" ||
        e.responsive.desktop.colorMode === "surface",
    );
    if (darkOk.length >= 1) pool = darkOk;
  }

  return pool;
}

/* -------------------------------------------------------------------------- */
/*  Scoring + ranking                                                         */
/* -------------------------------------------------------------------------- */

interface Ranked {
  entry: CompositionEntry;
  scoring: SelectionScoring;
  adjustedScore: number;
}

function rankCandidates(
  pool: CompositionEntry[],
  ctx: SelectionContext,
): Ranked[] {
  const seed = ctx.seed ?? "default";

  return pool
    .map((entry) => {
      const scoring = scoreComposition(entry, ctx);
      const adjustedScore = applyScoreJitter(scoring.total, seed, entry.id);
      return { entry, scoring, adjustedScore };
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore);
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Select the best composition for the given context.
 *
 * The top-3 scoring candidates are eligible; the final choice among them is
 * seeded-random so brands with identical profiles get different layouts.
 */
export function selectComposition(ctx: SelectionContext): SelectedComposition {
  const candidates = filterCandidates(ctx.category, ctx);

  if (candidates.length === 0) {
    // Nothing in this category — return the fallback.
    const fb = fallback(ctx.category);
    if (!fb) {
      throw new Error(
        `No compositions registered for category "${ctx.category}". ` +
          "Import the category data file before calling selectComposition().",
      );
    }
    const fallbackScoring = scoreComposition(fb, ctx);
    return {
      composition: fb,
      score: fallbackScoring.total,
      scoring: fallbackScoring,
      historyEntry: buildHistoryEntry(fb),
    };
  }

  const ranked = rankCandidates(candidates, ctx);

  // Take top-3 and let seededPick choose among them for brand variation.
  const TOP_N = Math.min(3, ranked.length);
  const topGroup = ranked.slice(0, TOP_N);

  const seed = ctx.seed ?? "default";
  const picked = seededPick(topGroup, seed, ctx.history?.length ?? 0);
  const chosen = picked ?? topGroup[0]; // seededPick is non-null here since topGroup.length > 0

  return {
    composition: chosen.entry,
    score: chosen.adjustedScore,
    scoring: chosen.scoring,
    historyEntry: buildHistoryEntry(chosen.entry),
  };
}

/**
 * Select N compositions from a category, enforcing diversity across the set.
 * Each selection adds its result to the local history before the next pick.
 *
 * Useful for building a full site page section-by-section.
 */
export function selectMany(
  ctx: SelectionContext,
  count: number,
): SelectedComposition[] {
  const results: SelectedComposition[] = [];
  const runningHistory: HistoricalSelection[] = [...(ctx.history ?? [])];

  for (let i = 0; i < count; i++) {
    const selection = selectComposition({
      ...ctx,
      history: runningHistory,
      seed: ctx.seed ? `${ctx.seed}:${i}` : String(i),
    });
    results.push(selection);
    runningHistory.push(selection.historyEntry);
  }

  return results;
}
