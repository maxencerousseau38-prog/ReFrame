import { parse } from "node-html-parser";
import type { ExtractionResult, PassContext } from "./types";
import { detectPlatform } from "./platform";
import { runFramerPass } from "./pass-framer";
import { runStructurePass } from "./pass-structure";
import { runContentPass } from "./pass-content";
import { runMediaPass } from "./pass-media";
import { runDesignPass } from "./pass-design";
import { runVisualDNAPass } from "./visual-dna";
import { runValidationPass } from "./pass-validate";

function clean(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function emptyResult(url: string): ExtractionResult {
  return {
    source: { url, fetched: false },
    business: {
      name: "",
      tagline: "",
      description: "",
      industry: "generic",
      industryLabel: "Business",
    },
    tokens: {
      colors: {},
      typography: {},
      spacing: {},
      radii: [],
    },
    motion: { level: 0 },
    content: { headline: "", description: "" },
    images: { gallery: [] },
    navigation: { items: [] },
    sections: { order: [], hasHero: false, hasContact: false, hasFooter: false },
    integrations: [],
    quality: {
      score: 0,
      completeness: 0,
      consistency: 0,
      duplication: 100,
      hierarchy: 0,
      mediaRecovery: 0,
      businessUnderstanding: 0,
      confidence: "fallback",
      assetConfidence: { logo: 0, images: 0, colors: 0, text: 0, structure: 0 },
      passes: 0,
    },
  };
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      target[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>
      );
    } else if (sv !== undefined) {
      target[key] = sv;
    }
  }
  return target;
}

export async function extractSite(
  url: string,
  html: string
): Promise<ExtractionResult> {
  if (!html || clean(html).length < 100) {
    return emptyResult(url);
  }

  let root;
  try {
    root = parse(html, { blockTextElements: { script: true, style: true } });
  } catch {
    return emptyResult(url);
  }

  const platform = detectPlatform(html);
  const bodyText = clean(html);

  const ctx: PassContext = {
    url,
    html,
    root,
    bodyText,
    platform,
    result: emptyResult(url),
  };

  ctx.result.source = { url, platform, fetched: true };

  const passes = [
    runFramerPass,       // Pass 0: Framer variant collapsing (mutates ctx.root)
    runStructurePass,    // Pass 1: Page structure
    runContentPass,      // Pass 2: Content extraction
    runMediaPass,        // Pass 3: Media extraction
    runDesignPass,       // Pass 4: Design tokens + motion
    runVisualDNAPass,    // Pass 5: Visual DNA measurement
    runValidationPass,   // Pass 6: Validation + quality scoring
  ];

  let passCount = 0;

  for (const pass of passes) {
    try {
      const { updates } = await pass(ctx);
      deepMerge(ctx.result as Record<string, unknown>, updates as Record<string, unknown>);
      passCount++;
    } catch {
      // A failing pass should not break the pipeline — continue with
      // whatever has been accumulated so far.
    }
  }

  const result = ctx.result as ExtractionResult;

  if (result.quality) {
    result.quality.passes = passCount;
  }

  // Retry loop: if quality is below 90 and we have room for another pass,
  // re-run validation to clean up any cross-pass inconsistencies.
  if (result.quality && result.quality.score < 90 && passCount >= 4) {
    try {
      const { updates } = await runValidationPass(ctx);
      deepMerge(ctx.result as Record<string, unknown>, updates as Record<string, unknown>);
      if (result.quality) result.quality.passes = passCount + 1;
    } catch {
      // best-effort
    }
  }

  return result;
}
