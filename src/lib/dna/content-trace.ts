/**
 * V2 Chantier 6d (F15) — content provenance in the PipelineTrace.
 *
 * The DNA has been traced since C2; the CONTENT decisions (language, section
 * headings, CTA copy) were still opaque. These entries mirror exactly what
 * the composer does (real heading wins, localized label is the fallback —
 * composer.ts#title / labels.ts), so the trace answers "why this heading?"
 * without the composer having to report on itself.
 */

import type { SiteAnalysis } from "@/lib/generation/types";
import type { ContentModel } from "@/lib/understand/content-model";
import { label, type LabelKey } from "@/lib/generation/labels";
import { INDUSTRY_PROFILES } from "@/lib/generation/industries";
import { sourced, resolveField, traceEntry, type PipelineTrace } from "./provenance";

const HEADING_KEYS: Partial<Record<string, LabelKey>> = {
  features: "features",
  services: "services",
  testimonials: "testimonials",
  contact: "contact",
  faq: "faq",
  portfolio: "portfolio",
  gallery: "portfolio",
  about: "about",
};

export function contentTraceEntries(
  model: ContentModel,
  analysis: SiteAnalysis
): PipelineTrace {
  const trace: PipelineTrace = [];
  const lang = model.language;

  // Language: measured (extraction) vs the English fallback label() applies.
  trace.push(
    traceEntry(
      resolveField("content.language", [
        lang ? sourced(lang, "measured", "extraction/language.ts#detectLanguage") : undefined,
        sourced("en", "preset", "generation/labels.ts#label(fallback)"),
      ])!
    )
  );

  // CTA copy: measured scene CTA / DOM-extracted label vs industry preset.
  const industryCta = INDUSTRY_PROFILES[analysis.industry]?.cta.primary;
  trace.push(
    traceEntry(
      resolveField("content.cta", [
        model.primaryCta
          ? sourced(model.primaryCta.label, "measured", "measure/scenes.ts#heroCtaLabel | pass-content.ts#extractPrimaryCtaLabel")
          : undefined,
        industryCta ? sourced(industryCta, "preset", "generation/industries.ts#cta.primary") : undefined,
      ])!
    )
  );

  // Section headings: the real heading vs the localized generated label —
  // the exact pair composer.ts#title() arbitrates.
  const seen = new Set<string>();
  for (const scene of model.scenes) {
    const key = HEADING_KEYS[scene.category];
    if (!key || seen.has(scene.category)) continue;
    seen.add(scene.category);
    const slot = resolveField(`content.heading.${scene.category}`, [
      scene.heading
        ? sourced(scene.heading, "measured", "understand/content-model.ts#realHeading")
        : undefined,
      sourced(label(key, lang), "preset", `generation/labels.ts#label(${key}, ${lang ?? "en"})`),
    ]);
    if (slot) trace.push(traceEntry(slot));
  }

  return trace;
}
