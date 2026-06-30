/**
 * Composition Randomizer — deterministic seeded selection.
 *
 * Uses FNV-1a (32-bit) hashing so that the same seed + same candidate set
 * always produces the same result. No Math.random(), no Date.now().
 */

import type { CompositionEntry } from "./types";

/* -------------------------------------------------------------------------- */
/*  FNV-1a 32-bit hash                                                        */
/* -------------------------------------------------------------------------- */

const FNV_PRIME = 16777619;
const FNV_OFFSET = 2166136261;
const UINT32 = 0xffffffff;

export function fnv1a(str: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (Math.imul(hash, FNV_PRIME) >>> 0) & UINT32;
  }
  return hash >>> 0;
}

/**
 * Derive a pseudo-random float [0, 1) from a seed + an integer counter.
 * Deterministic — same inputs → same output.
 */
export function seededFloat(seed: string, counter: number): number {
  const hash = fnv1a(`${seed}:${counter}`);
  return hash / (UINT32 + 1);
}

/* -------------------------------------------------------------------------- */
/*  Seeded pick                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Pick one element from `candidates` deterministically using `seed`.
 *
 * When `preferredIndex` is provided and in range, biases toward that index
 * (probability 0.6 for the preferred, uniform otherwise).
 *
 * Returns null if candidates is empty.
 */
export function seededPick<T>(
  candidates: T[],
  seed: string,
  counter = 0,
  preferredIndex?: number,
): T | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const rng = seededFloat(seed, counter);

  // Bias toward a preferred index if given.
  if (
    preferredIndex !== undefined &&
    preferredIndex >= 0 &&
    preferredIndex < candidates.length
  ) {
    const BIAS = 0.6;
    if (rng < BIAS) return candidates[preferredIndex];
    // Remap remainder uniformly over non-preferred items.
    const remaining = candidates.filter((_, i) => i !== preferredIndex);
    const idx = Math.floor(((rng - BIAS) / (1 - BIAS)) * remaining.length);
    return remaining[Math.min(idx, remaining.length - 1)];
  }

  const idx = Math.floor(rng * candidates.length);
  return candidates[Math.min(idx, candidates.length - 1)];
}

/* -------------------------------------------------------------------------- */
/*  Seeded sort (Fisher-Yates with seeded rng)                               */
/* -------------------------------------------------------------------------- */

/**
 * Returns a deterministically shuffled copy of the array.
 */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const rng = seededFloat(seed, i);
    const j = Math.floor(rng * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/*  Jitter for brand-level variation                                          */
/* -------------------------------------------------------------------------- */

/**
 * Adds a small deterministic jitter to a score so two brands with identical
 * SelectionContext produce different results (within ±5 points).
 *
 * The jitter is based on brand seed + composition ID, ensuring that the same
 * brand always gets the same jitter for the same composition.
 */
export function applyScoreJitter(
  score: number,
  seed: string,
  compositionId: string,
): number {
  const jitter = (seededFloat(`${seed}:jitter:${compositionId}`, 0) - 0.5) * 10;
  return Math.round(score + jitter);
}
