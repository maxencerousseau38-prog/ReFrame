/**
 * Composition Validator — guards library integrity.
 *
 * Validates a CompositionEntry against:
 * - ID convention (category_family_NNN)
 * - Premium score floor (≥ 95)
 * - Required fields
 * - Responsive spec completeness
 * - Diversity constraints non-empty
 * - At least one industry tagged
 */

import type {
  CompositionEntry,
  CompositionValidationResult,
} from "./types";
import { MINIMUM_PREMIUM_SCORE, COMPOSITION_CATEGORIES } from "./types";
import { calculatePremiumScore } from "./premium-rules";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const ID_PATTERN = /^[a-z]+_[a-z-]+_\d{3}$/;

function isNonEmpty(arr: unknown[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/* -------------------------------------------------------------------------- */
/*  Spec validator                                                             */
/* -------------------------------------------------------------------------- */

function validateSpec(
  spec: CompositionEntry["responsive"]["desktop"],
  prefix: string,
  errors: string[],
): void {
  if (!spec.grid) errors.push(`${prefix}: missing grid`);
  if (!spec.sectionHeight) errors.push(`${prefix}: missing sectionHeight`);
  if (!spec.container) errors.push(`${prefix}: missing container`);
  if (!spec.negativeSpace) errors.push(`${prefix}: missing negativeSpace`);
  if (!spec.textPosition) errors.push(`${prefix}: missing textPosition`);
  if (!spec.imagePosition) errors.push(`${prefix}: missing imagePosition`);
  if (!spec.headlineFont) errors.push(`${prefix}: missing headlineFont`);
  if (!spec.headlineSize) errors.push(`${prefix}: missing headlineSize`);
  if (!spec.cta) errors.push(`${prefix}: missing cta`);
  if (!spec.overlay) errors.push(`${prefix}: missing overlay`);
  if (!spec.motion) errors.push(`${prefix}: missing motion`);
  if (!spec.readingFlow) errors.push(`${prefix}: missing readingFlow`);
  if (!spec.layout) errors.push(`${prefix}: missing layout`);
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function validateComposition(entry: CompositionEntry): CompositionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ID convention
  if (!ID_PATTERN.test(entry.id)) {
    errors.push(
      `ID "${entry.id}" does not match pattern "category_family_NNN" (e.g. hero_editorial_001).`,
    );
  }

  // Category
  if (!COMPOSITION_CATEGORIES.includes(entry.category)) {
    errors.push(`Unknown category "${entry.category}".`);
  }

  // Family non-empty
  if (!entry.family) {
    errors.push("Missing family.");
  }

  // Complexity
  if (![1, 2, 3, 4, 5].includes(entry.complexity)) {
    errors.push(`Complexity must be 1–5, got ${entry.complexity}.`);
  }

  // Industries
  if (!isNonEmpty(entry.industries)) {
    errors.push("At least one industry must be specified.");
  }

  // Responsive spec
  if (!entry.responsive || !entry.responsive.desktop) {
    errors.push("Missing responsive.desktop spec.");
  } else {
    validateSpec(entry.responsive.desktop, "desktop", errors);
    // Tablet is required; laptop/mobile are optional but warned if absent
    if (!entry.responsive.tablet) {
      errors.push("Missing responsive.tablet overrides.");
    }
    if (!entry.responsive.mobile) {
      warnings.push("Missing responsive.mobile overrides — desktop spec will be used.");
    }
  }

  // Diversity constraints
  if (!entry.constraints) {
    errors.push("Missing constraints.");
  } else {
    if (!Array.isArray(entry.constraints.blockedLayouts)) {
      errors.push("constraints.blockedLayouts must be an array.");
    }
    if (!Array.isArray(entry.constraints.blockedColumns)) {
      errors.push("constraints.blockedColumns must be an array.");
    }
    if (!Array.isArray(entry.constraints.blockedImageRatios)) {
      errors.push("constraints.blockedImageRatios must be an array.");
    }
    if (!Array.isArray(entry.constraints.blockedMotions)) {
      errors.push("constraints.blockedMotions must be an array.");
    }
    if (!Array.isArray(entry.constraints.blockedCtas)) {
      errors.push("constraints.blockedCtas must be an array.");
    }
    if (!Array.isArray(entry.constraints.blockedAlignments)) {
      errors.push("constraints.blockedAlignments must be an array.");
    }
  }

  // Premium score (compute fresh — do not trust stored value)
  let computedPremium = 0;
  if (entry.responsive?.desktop && errors.length === 0) {
    const result = calculatePremiumScore(entry.responsive.desktop);
    computedPremium = result.overall;

    if (computedPremium < MINIMUM_PREMIUM_SCORE) {
      errors.push(
        `Premium score ${computedPremium} is below the minimum ${MINIMUM_PREMIUM_SCORE}.`,
      );
    }

    // Warn if stored premium diverges from computed by more than 3 points
    if (Math.abs(entry.premium - computedPremium) > 3) {
      warnings.push(
        `Stored premium ${entry.premium} diverges from computed ${computedPremium} by ` +
          `${Math.abs(entry.premium - computedPremium)} points. Consider updating.`,
      );
    }
  }

  // Description non-empty
  if (!entry.description || entry.description.trim().length === 0) {
    warnings.push("Missing description — consider adding a one-sentence editorial intent.");
  }

  // Tags
  if (!isNonEmpty(entry.tags)) {
    warnings.push("No tags — composition will be harder to discover.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    computedPremium,
  };
}

/**
 * Validate all compositions in a batch. Throws if any have errors.
 * Returns validation results for logging/reporting.
 */
export function validateAll(
  entries: CompositionEntry[],
): Map<string, CompositionValidationResult> {
  const results = new Map<string, CompositionValidationResult>();
  const failed: string[] = [];

  for (const entry of entries) {
    const result = validateComposition(entry);
    results.set(entry.id, result);
    if (!result.valid) failed.push(entry.id);
  }

  if (failed.length > 0) {
    throw new Error(
      `Composition validation failed for: ${failed.join(", ")}\n` +
        `Run validateComposition(entry) on each to see detailed errors.`,
    );
  }

  return results;
}
