/**
 * V2 RESOLVE — tree resolver: the pipeline's ONE merge point.
 *
 * Takes a complete preset tree (the shape authority — DesignDNA is always
 * fully populated) plus any number of partial candidate layers (measured /
 * inferred / curated), and resolves every leaf through provenance ranking
 * (dna/provenance.ts). Layer list order is irrelevant: precedence comes from
 * source ranks only (G2). Every non-chosen candidate is archived in its slot
 * and surfaced in the trace (G4).
 *
 * Leaves are primitives and arrays (arrays are atomic values — a measured
 * [3,9] column split replaces the whole preset array, never merges with it).
 *
 * Extra paths (present in a layer but absent from the preset) are additive:
 * they resolve among layers and are grafted into the output when they do not
 * conflict with the preset shape; on conflict the candidates stay archived in
 * the slots/trace (recorded, not lost — never silently reshaping the preset).
 */

import {
  sourced,
  resolveField,
  traceEntry,
  deepFreeze,
  type PipelineTrace,
  type Resolved,
  type Source,
  type Sourced,
} from "./provenance";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface CandidateLayer {
  /** Deep-partial tree of plain values. `undefined` leaves are "not offered". */
  data: unknown;
  source: Source;
  /** Producer, file-precise — copied onto every leaf candidate. */
  origin: string;
  /** Uniform layer confidence (per-field confidence arrives with SourceDNA, C4+). */
  confidence?: number;
}

export interface TreeResolution<T> {
  /** The resolved tree, deep-frozen. */
  value: T;
  /** One slot per resolved path — full provenance, queryable. */
  slots: ReadonlyMap<string, Resolved<unknown>>;
  trace: PipelineTrace;
}

/* -------------------------------------------------------------------------- */
/*  Tree helpers                                                              */
/* -------------------------------------------------------------------------- */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    Object.getPrototypeOf(v) !== null &&
    Object.getPrototypeOf(Object.getPrototypeOf(v)) === null
  );
}

/** Collect every leaf path of a tree ("a.b.c"). Arrays are leaves. */
function leafPaths(node: unknown, prefix: string, out: Set<string>): void {
  if (isPlainObject(node)) {
    const keys = Object.keys(node);
    if (keys.length === 0) return; // empty object contributes nothing
    for (const k of keys) leafPaths(node[k], prefix ? `${prefix}.${k}` : k, out);
    return;
  }
  if (node !== undefined && prefix) out.add(prefix);
}

function getAt(node: unknown, path: string): unknown {
  let cur = node;
  for (const seg of path.split(".")) {
    if (!isPlainObject(cur)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

/** True when `path` traverses a non-object value inside `tree` (shape conflict). */
function conflictsWithShape(tree: unknown, path: string): boolean {
  const segs = path.split(".");
  let cur = tree;
  for (let i = 0; i < segs.length - 1; i++) {
    if (!isPlainObject(cur)) return true;
    if (!(segs[i] in cur)) return false; // free branch — no conflict
    cur = cur[segs[i]];
  }
  return !isPlainObject(cur);
}

function setAt(root: Record<string, unknown>, path: string, value: unknown): void {
  const segs = path.split(".");
  let cur = root;
  for (let i = 0; i < segs.length - 1; i++) {
    const seg = segs[i];
    if (!isPlainObject(cur[seg])) cur[seg] = {};
    cur = cur[seg] as Record<string, unknown>;
  }
  cur[segs[segs.length - 1]] = value;
}

/* -------------------------------------------------------------------------- */
/*  resolveTree                                                               */
/* -------------------------------------------------------------------------- */

export function resolveTree<T extends object>(
  preset: CandidateLayer & { data: T },
  layers: CandidateLayer[] = []
): TreeResolution<T> {
  // G4: inputs are frozen — upstream data cannot be mutated away afterwards.
  deepFreeze(preset.data);
  for (const layer of layers) deepFreeze(layer.data);

  const allLayers: CandidateLayer[] = [preset, ...layers];

  // Path universe: preset shape + additive extras from every layer.
  const presetPaths = new Set<string>();
  leafPaths(preset.data, "", presetPaths);
  const allPaths = new Set<string>(presetPaths);
  for (const layer of layers) leafPaths(layer.data, "", allPaths);

  const slots = new Map<string, Resolved<unknown>>();
  const trace: PipelineTrace = [];
  const out: Record<string, unknown> = {};

  // Deterministic iteration order (paths sorted) — output identity does not
  // depend on layer insertion patterns.
  for (const path of Array.from(allPaths).sort()) {
    const candidates: Array<Sourced<unknown> | undefined> = allLayers.map((layer) => {
      const v = getAt(layer.data, path);
      // A plain object at a leaf path is NOT a candidate for that leaf — its
      // own sub-leaves compete at their deeper paths. Offering it here would
      // let a subtree clobber a preset leaf (I1 violation caught by tests).
      return v === undefined || isPlainObject(v)
        ? undefined
        : sourced(v, layer.source, layer.origin, layer.confidence ?? 1);
    });

    const slot = resolveField(path, candidates);
    if (!slot) continue; // nothing offered anywhere — nothing invented
    slots.set(path, slot);

    const entry = traceEntry(slot);
    if (!presetPaths.has(path) && conflictsWithShape(preset.data, path)) {
      // Extra path colliding with the preset shape: archived, never grafted.
      trace.push({ ...entry, reason: `${entry.reason}; NOT grafted (conflicts with preset shape)` });
      continue;
    }
    trace.push(entry);
    setAt(out, path, slot.chosen.value);
  }

  return {
    value: deepFreeze(out) as T,
    slots,
    trace,
  };
}

/** Convenience: the provenance of one field, or undefined. */
export function whyValue(
  res: TreeResolution<object>,
  path: string
): Resolved<unknown> | undefined {
  return res.slots.get(path);
}
