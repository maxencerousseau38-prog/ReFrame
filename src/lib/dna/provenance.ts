/**
 * V2 RESOLVE — provenance primitives (invariant I1: strict monotonicity).
 *
 * The whole V2 pipeline shares ONE writing discipline:
 *   - every value is a frozen Sourced<T> carrying source/origin/confidence;
 *   - a resolved slot is NEVER rewritten, by anyone — later candidates land
 *     in `rejected`, so nothing collected is ever lost (charter G1/G4);
 *   - candidate ordering is decided HERE (rank), never by the caller, so a
 *     less-reliable value can never occupy a slot ahead of a more-reliable
 *     one (G2); a slot holds exactly one chosen source (G3).
 *
 * Late precision is expressed as a NEW more-specific field
 * (heightRange → heightPx), never as a rewrite (charter principle #9 / A1).
 *
 * Registre: docs/ARCHITECTURE_DECISIONS.md (A1–A3).
 */

/* -------------------------------------------------------------------------- */
/*  Sourced<T>                                                                */
/* -------------------------------------------------------------------------- */

export type Source = "measured" | "user" | "inferred" | "curated" | "preset";

export const SOURCE_PRIORITY: Record<Source, number> = {
  measured: 5,
  user: 5, // explicit client choice (post-generation edits)
  inferred: 3,
  curated: 2,
  preset: 1,
};

/** Charter A2: a measured value below this confidence is demoted below curated. */
export const LOW_CONFIDENCE_MEASURED = 0.4;
const DEMOTED_MEASURED_RANK = 1.5; // below curated (2), above preset (1)

export interface Sourced<T> {
  readonly value: T;
  readonly source: Source;
  /** Producer, file-precise: "measure/tokens.ts#extractPalette". */
  readonly origin: string;
  /** 0–1. Metadata about the measurement method, never site data. */
  readonly confidence: number;
}

/** The only constructor: validates and freezes. */
export function sourced<T>(
  value: T,
  source: Source,
  origin: string,
  confidence = 1
): Sourced<T> {
  if (!origin) throw new Error("Sourced: origin is required (traceability).");
  if (!(confidence >= 0 && confidence <= 1)) {
    throw new Error(`Sourced: confidence must be in [0,1], got ${confidence}.`);
  }
  return Object.freeze({ value, source, origin, confidence });
}

/** Effective rank — encodes the charter demotion rule (A2). */
export function rank(c: Sourced<unknown>): number {
  if (c.source === "measured" && c.confidence < LOW_CONFIDENCE_MEASURED) {
    return DEMOTED_MEASURED_RANK;
  }
  return SOURCE_PRIORITY[c.source];
}

/**
 * Total order over candidates: rank desc, confidence desc, then stable
 * lexicographic tiebreaks — the outcome does NOT depend on offer order (G2).
 */
export function compareCandidates(a: Sourced<unknown>, b: Sourced<unknown>): number {
  const dr = rank(b) - rank(a);
  if (dr !== 0) return dr;
  const dc = b.confidence - a.confidence;
  if (dc !== 0) return dc;
  if (a.source !== b.source) return a.source < b.source ? -1 : 1;
  if (a.origin !== b.origin) return a.origin < b.origin ? -1 : 1;
  return 0;
}

/* -------------------------------------------------------------------------- */
/*  Resolved<T> — a filled slot                                               */
/* -------------------------------------------------------------------------- */

/** Not exported: external code cannot forge a Resolved (G1, type barrier). */
const RESOLVED_BRAND: unique symbol = Symbol("rf.resolved");

export interface Resolved<T> {
  readonly [RESOLVED_BRAND]: true;
  readonly field: string;
  readonly chosen: Sourced<T>;
  /** Every non-chosen candidate ever offered — nothing is dropped (G4). */
  readonly rejected: readonly Sourced<T>[];
}

function makeResolved<T>(
  field: string,
  chosen: Sourced<T>,
  rejected: readonly Sourced<T>[]
): Resolved<T> {
  return Object.freeze({
    [RESOLVED_BRAND]: true as const,
    field,
    chosen,
    rejected: Object.freeze([...rejected]),
  });
}

export function isResolved(v: unknown): v is Resolved<unknown> {
  return typeof v === "object" && v !== null && (v as Record<symbol, unknown>)[RESOLVED_BRAND] === true;
}

/**
 * Resolve a field from a set of candidates. Sorting is internal — callers
 * cannot influence precedence. Returns undefined when nothing is offered
 * (the caller decides whether the field is mandatory; nothing is invented).
 */
export function resolveField<T>(
  field: string,
  candidates: ReadonlyArray<Sourced<T> | undefined>
): Resolved<T> | undefined {
  const offered = candidates.filter((c): c is Sourced<T> => c !== undefined);
  if (offered.length === 0) return undefined;
  const ordered = [...offered].sort(compareCandidates);
  return makeResolved(field, ordered[0], ordered.slice(1));
}

/**
 * Monotone completion (I1): fills an EMPTY slot; on an occupied slot the
 * chosen value is untouched and the candidate is archived in `rejected`.
 * Never a substitution, whatever the ranks.
 */
export function refine<T>(
  slot: Resolved<T> | undefined,
  field: string,
  candidate: Sourced<T>
): Resolved<T> {
  if (slot === undefined) return makeResolved(field, candidate, []);
  return makeResolved(slot.field, slot.chosen, [...slot.rejected, candidate]);
}

/* -------------------------------------------------------------------------- */
/*  Trace                                                                     */
/* -------------------------------------------------------------------------- */

export interface CandidateSummary {
  source: Source;
  origin: string;
  confidence: number;
  /** JSON preview, truncated — enough to answer "why this value?". */
  value: string;
}

export interface ResolutionLogEntry {
  field: string;
  chosen: CandidateSummary;
  rejected: CandidateSummary[];
  reason: string;
}

export type PipelineTrace = ResolutionLogEntry[];

function summarize(c: Sourced<unknown>): CandidateSummary {
  let value: string;
  try {
    value = JSON.stringify(c.value) ?? "undefined";
  } catch {
    value = String(c.value);
  }
  if (value.length > 120) value = value.slice(0, 117) + "…";
  return { source: c.source, origin: c.origin, confidence: c.confidence, value };
}

function explain(slot: Resolved<unknown>): string {
  const c = slot.chosen;
  if (slot.rejected.length === 0) return `only candidate (${c.source})`;
  const runnerUp = slot.rejected[0];
  if (runnerUp.source === "measured" && rank(runnerUp) === DEMOTED_MEASURED_RANK) {
    return `measured demoted (confidence ${runnerUp.confidence} < ${LOW_CONFIDENCE_MEASURED}); ${c.source} chosen`;
  }
  if (rank(c) > rank(runnerUp)) {
    return `${c.source} outranks ${runnerUp.source} (${rank(c)}>${rank(runnerUp)})`;
  }
  return `${c.source} wins on confidence (${c.confidence} ≥ ${runnerUp.confidence})`;
}

export function traceEntry(slot: Resolved<unknown>): ResolutionLogEntry {
  return {
    field: slot.field,
    chosen: summarize(slot.chosen),
    rejected: slot.rejected.map(summarize),
    reason: explain(slot),
  };
}

/* -------------------------------------------------------------------------- */
/*  Deep freeze (resolver inputs — G4: upstream data cannot be mutated away)  */
/* -------------------------------------------------------------------------- */

/** Freezes plain objects/arrays recursively. Skips typed arrays/Buffers
 *  (freezing views with elements throws) and already-frozen nodes. */
export function deepFreeze<T>(root: T): T {
  const seen = new WeakSet<object>();
  const walk = (node: unknown): void => {
    if (node === null || typeof node !== "object") return;
    if (ArrayBuffer.isView(node)) return;
    const obj = node as object;
    if (seen.has(obj) || Object.isFrozen(obj)) return;
    seen.add(obj);
    Object.freeze(obj);
    for (const value of Object.values(obj)) walk(value);
  };
  walk(root);
  return root;
}
