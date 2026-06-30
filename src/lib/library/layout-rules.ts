/**
 * Layout Rules — diversity enforcement engine.
 *
 * Seven rules prevent visually monotonous sequences of sections.
 * Each rule checks a candidate composition against the selection history
 * and returns a penalty (0 = clean, 1 = blocked).
 *
 * calculateDiversityPenalty() aggregates them into one composite penalty.
 */

import type {
  CompositionEntry,
  HistoricalSelection,
  LayoutRule,
  DiversityPenalty,
  ColumnDistribution,
  ImageRatio,
  MotionType,
  CtaVariant,
  TextPosition,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Returns the N most-recent items from history (or all if fewer). */
function last(history: HistoricalSelection[], n: number): HistoricalSelection[] {
  return history.slice(-n);
}

/**
 * Checks whether two ColumnDistributions are "effectively the same"
 * (same sorted signature).
 */
function colsMatch(a: ColumnDistribution, b: ColumnDistribution): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

/* -------------------------------------------------------------------------- */
/*  Rule 1 — no-same-layout                                                   */
/* -------------------------------------------------------------------------- */

const noSameLayout: LayoutRule = {
  name: "no-same-layout",
  description: "The same named layout should not appear in two consecutive sections.",
  check(candidate, history) {
    const prev = last(history, 1);
    if (prev.length === 0) return { penalty: 0, reasons: [] };
    const prevLayout = prev[0].layout;
    if (prevLayout === candidate.responsive.desktop.layout) {
      return {
        penalty: 0.9,
        reasons: [`Layout "${prevLayout}" already used in the previous section.`],
      };
    }
    // Soft penalty: same layout in the last 2 sections
    const recent = last(history, 2);
    if (recent.some((h) => h.layout === candidate.responsive.desktop.layout)) {
      return {
        penalty: 0.3,
        reasons: [`Layout "${candidate.responsive.desktop.layout}" was used recently.`],
      };
    }
    return { penalty: 0, reasons: [] };
  },
};

/* -------------------------------------------------------------------------- */
/*  Rule 2 — no-same-grid                                                     */
/* -------------------------------------------------------------------------- */

const noSameGrid: LayoutRule = {
  name: "no-same-grid",
  description: "Identical column distributions should not appear consecutively.",
  check(candidate, history) {
    const candidateCols = candidate.responsive.desktop.columns;
    const prev = last(history, 1);
    if (prev.length === 0) return { penalty: 0, reasons: [] };

    if (colsMatch(prev[0].columns, candidateCols)) {
      return {
        penalty: 0.7,
        reasons: [
          `Column distribution [${candidateCols.join(",")}] identical to previous section.`,
        ],
      };
    }
    return { penalty: 0, reasons: [] };
  },
};

/* -------------------------------------------------------------------------- */
/*  Rule 3 — no-same-alignment                                                */
/* -------------------------------------------------------------------------- */

const noSameAlignment: LayoutRule = {
  name: "no-same-alignment",
  description: "Avoid three or more consecutive sections with the same text alignment.",
  check(candidate, history) {
    const alignment = candidate.responsive.desktop.textPosition;
    const recent = last(history, 2);
    if (recent.length < 2) return { penalty: 0, reasons: [] };

    if (recent.every((h) => h.textPosition === alignment)) {
      return {
        penalty: 0.5,
        reasons: [
          `Text alignment "${alignment}" has appeared in the last 2 sections already.`,
        ],
      };
    }
    return { penalty: 0, reasons: [] };
  },
};

/* -------------------------------------------------------------------------- */
/*  Rule 4 — no-same-imageRatio                                               */
/* -------------------------------------------------------------------------- */

const noSameImageRatio: LayoutRule = {
  name: "no-same-imageRatio",
  description: "Identical image aspect ratios in consecutive sections feel repetitive.",
  check(candidate, history) {
    const ratio = candidate.responsive.desktop.imageRatio;
    if (!ratio) return { penalty: 0, reasons: [] };
    const prev = last(history, 1);
    if (prev.length === 0) return { penalty: 0, reasons: [] };

    if (prev[0].imageRatio === ratio) {
      return {
        penalty: 0.4,
        reasons: [`Image ratio "${ratio}" repeated from previous section.`],
      };
    }
    return { penalty: 0, reasons: [] };
  },
};

/* -------------------------------------------------------------------------- */
/*  Rule 5 — no-same-motion                                                   */
/* -------------------------------------------------------------------------- */

const noSameMotion: LayoutRule = {
  name: "no-same-motion",
  description: "The same motion type in three or more consecutive sections dulls the experience.",
  check(candidate, history) {
    const motion = candidate.responsive.desktop.motion;
    if (motion === "none") return { penalty: 0, reasons: [] };
    const recent = last(history, 2);

    const count = recent.filter((h) => h.motion === motion).length;
    if (count >= 2) {
      return {
        penalty: 0.5,
        reasons: [`Motion "${motion}" has been used ${count} times recently.`],
      };
    }
    if (count === 1 && recent.length > 0 && recent[recent.length - 1].motion === motion) {
      return {
        penalty: 0.2,
        reasons: [`Motion "${motion}" in the immediately preceding section.`],
      };
    }
    return { penalty: 0, reasons: [] };
  },
};

/* -------------------------------------------------------------------------- */
/*  Rule 6 — no-same-cta                                                      */
/* -------------------------------------------------------------------------- */

const noSameCta: LayoutRule = {
  name: "no-same-cta",
  description: "The same CTA style in three or more sections creates visual monotony.",
  check(candidate, history) {
    const cta = candidate.responsive.desktop.cta;
    const recent = last(history, 3);
    const count = recent.filter((h) => h.cta === cta).length;

    if (count >= 2) {
      return {
        penalty: 0.35,
        reasons: [`CTA style "${cta}" has appeared ${count} times in recent sections.`],
      };
    }
    return { penalty: 0, reasons: [] };
  },
};

/* -------------------------------------------------------------------------- */
/*  Rule 7 — explicit diversity constraints                                   */
/* -------------------------------------------------------------------------- */

const explicitConstraints: LayoutRule = {
  name: "explicit-constraints",
  description: "Respect the DiversityConstraints declared on the preceding composition.",
  check(candidate, history) {
    // We need access to the full previous CompositionEntry to read its
    // .constraints. The history only stores HistoricalSelection (no ref to
    // the entry). We therefore cannot check this rule at the LayoutRule level.
    // Instead, calculateDiversityPenalty() handles it separately.
    return { penalty: 0, reasons: [] };
  },
};

/* -------------------------------------------------------------------------- */
/*  Rule set                                                                   */
/* -------------------------------------------------------------------------- */

export const LAYOUT_RULES: LayoutRule[] = [
  noSameLayout,
  noSameGrid,
  noSameAlignment,
  noSameImageRatio,
  noSameMotion,
  noSameCta,
  explicitConstraints,
];

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Compute the composite diversity penalty for placing `candidate` after the
 * given history.
 *
 * Optionally pass the previous CompositionEntry so that its explicit
 * `constraints` can be honored.
 */
export function calculateDiversityPenalty(
  candidate: CompositionEntry,
  history: HistoricalSelection[],
  previousEntry?: CompositionEntry,
): DiversityPenalty {
  const reasons: string[] = [];
  let penalty = 0;

  // Run all rules.
  for (const rule of LAYOUT_RULES) {
    const result = rule.check(candidate, history);
    if (result.penalty > 0) {
      penalty = Math.max(penalty, result.penalty);
      reasons.push(...result.reasons);
    }
  }

  // Explicit constraints from the previous composition.
  if (previousEntry) {
    const c = previousEntry.constraints;
    const spec = candidate.responsive.desktop;

    if (c.blockedLayouts.includes(spec.layout)) {
      penalty = Math.max(penalty, 0.95);
      reasons.push(`Layout "${spec.layout}" explicitly blocked by previous composition.`);
    }
    if (c.blockedColumns.some((bl) => colsMatch(bl, spec.columns))) {
      penalty = Math.max(penalty, 0.7);
      reasons.push(`Column distribution explicitly blocked by previous composition.`);
    }
    if (spec.imageRatio && c.blockedImageRatios.includes(spec.imageRatio)) {
      penalty = Math.max(penalty, 0.5);
      reasons.push(`Image ratio "${spec.imageRatio}" explicitly blocked by previous composition.`);
    }
    if (c.blockedMotions.includes(spec.motion)) {
      penalty = Math.max(penalty, 0.5);
      reasons.push(`Motion "${spec.motion}" explicitly blocked by previous composition.`);
    }
    if (c.blockedCtas.includes(spec.cta)) {
      penalty = Math.max(penalty, 0.4);
      reasons.push(`CTA "${spec.cta}" explicitly blocked by previous composition.`);
    }
    if (c.blockedAlignments.includes(spec.textPosition)) {
      penalty = Math.max(penalty, 0.4);
      reasons.push(
        `Text alignment "${spec.textPosition}" explicitly blocked by previous composition.`,
      );
    }
  }

  return { penalty: Math.min(penalty, 1), reasons };
}
