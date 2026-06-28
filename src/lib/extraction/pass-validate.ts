import type { PassContext, PassResult, ExtractionResult } from "./types";

/**
 * Pass 7+8+9+10 — Deduplication + Business Validation + Quality Scoring + Final Normalization
 *
 * Cleans, validates, scores, and normalizes the complete extraction result
 * before it is handed to the generation engine.
 */
export async function runValidationPass(ctx: PassContext): Promise<PassResult> {
  const r = ctx.result;

  // ── Pass 7: Deduplication ─────────────────────────────────────────────

  const deduped = runDeduplication(r);

  // ── Pass 8: Business Validation ───────────────────────────────────────

  const validated = runBusinessValidation(deduped, ctx.url);

  // ── Pass 9: Quality Score ─────────────────────────────────────────────

  const qualityDimensions = scoreQuality(validated);

  // ── Pass 10: Asset Confidence ─────────────────────────────────────────

  const assetConfidence = scoreAssetConfidence(validated);

  // Overall weighted average
  const overall = Math.round(
    qualityDimensions.completeness * 0.25 +
      qualityDimensions.consistency * 0.15 +
      qualityDimensions.duplication * 0.2 +
      qualityDimensions.hierarchy * 0.1 +
      qualityDimensions.mediaRecovery * 0.15 +
      qualityDimensions.businessUnderstanding * 0.15
  );

  const confidence: "full" | "partial" | "fallback" =
    overall >= 70 ? "full" : overall >= 40 ? "partial" : "fallback";

  return {
    updates: {
      ...validated,
      quality: {
        score: overall,
        completeness: qualityDimensions.completeness,
        consistency: qualityDimensions.consistency,
        duplication: qualityDimensions.duplication,
        hierarchy: qualityDimensions.hierarchy,
        mediaRecovery: qualityDimensions.mediaRecovery,
        businessUnderstanding: qualityDimensions.businessUnderstanding,
        confidence,
        assetConfidence,
        passes: 10,
      },
    },
  };
}

// ── Pass 7: Deduplication ─────────────────────────────────────────────────

function runDeduplication(
  r: Partial<ExtractionResult>
): Partial<ExtractionResult> {
  const updates: Partial<ExtractionResult> = {};

  // Deduplicate services by normalized title
  if (r.content?.services) {
    updates.content = {
      ...r.content,
      services: dedupeByKey(r.content.services, (s) =>
        s.title.toLowerCase().trim()
      ),
    };
  }

  // Deduplicate projects by normalized title
  if (r.content?.projects) {
    const content = updates.content || { ...r.content, headline: r.content!.headline, description: r.content!.description };
    content.projects = dedupeByKey(r.content.projects, (p) =>
      p.title.toLowerCase().trim()
    );
    updates.content = content;
  }

  // Deduplicate testimonials by first 48 chars of quote
  if (r.content?.testimonials) {
    const content = updates.content || { ...r.content, headline: r.content!.headline, description: r.content!.description };
    content.testimonials = dedupeByKey(r.content.testimonials, (t) =>
      t.quote.slice(0, 48).toLowerCase().trim()
    );
    updates.content = content;
  }

  // Deduplicate faqItems by first 48 chars of question
  if (r.content?.faqItems) {
    const content = updates.content || { ...r.content, headline: r.content!.headline, description: r.content!.description };
    content.faqItems = dedupeByKey(r.content.faqItems, (f) =>
      f.question.slice(0, 48).toLowerCase().trim()
    );
    updates.content = content;
  }

  // Deduplicate gallery by URL
  if (r.images?.gallery) {
    updates.images = {
      ...r.images,
      gallery: Array.from(new Set(r.images.gallery)),
    };
  }

  // Deduplicate navigation items by label (case-insensitive)
  if (r.navigation?.items) {
    updates.navigation = {
      ...r.navigation,
      items: dedupeByKey(r.navigation.items, (n) =>
        n.label.toLowerCase().trim()
      ),
    };
  }

  // Collapse consecutive same-type sections
  if (r.sections?.order) {
    const collapsed: typeof r.sections.order = [];
    for (const section of r.sections.order) {
      if (
        collapsed.length > 0 &&
        collapsed[collapsed.length - 1].type === section.type
      ) {
        // Keep the one with higher confidence
        if (section.confidence > collapsed[collapsed.length - 1].confidence) {
          collapsed[collapsed.length - 1] = section;
        }
        continue;
      }
      collapsed.push(section);
    }
    updates.sections = { ...r.sections, order: collapsed };
  }

  return updates;
}

// ── Pass 8: Business Validation ───────────────────────────────────────────

const NAV_LABELS = new Set([
  "home",
  "about",
  "contact",
  "projects",
  "portfolio",
  "blog",
  "news",
  "gallery",
  "team",
  "careers",
  "faq",
  "pricing",
]);

function runBusinessValidation(
  updates: Partial<ExtractionResult>,
  url: string
): Partial<ExtractionResult> {
  const content = updates.content;
  const navigation = updates.navigation;

  // Cross-check: nav labels should not appear as services
  if (content?.services && navigation?.items) {
    const navLabels = new Set(
      navigation.items.map((n) => n.label.toLowerCase().trim())
    );
    content.services = content.services.filter(
      (s) => !navLabels.has(s.title.toLowerCase().trim())
    );

    // Also remove services matching common nav-only labels
    content.services = content.services.filter(
      (s) => !NAV_LABELS.has(s.title.toLowerCase().trim())
    );
  }

  // If business name is empty or generic, try to derive from headline or URL
  const business = updates.business;
  if (business) {
    if (!business.name || isGenericName(business.name)) {
      if (content?.headline && !isGenericName(content.headline)) {
        // Use first meaningful segment of headline as name
        business.name = content.headline.split(/[|—–\-:]/)[ 0].trim();
      } else {
        // Derive from URL hostname
        try {
          const hostname = new URL(url).hostname.replace(/^www\./, "");
          const parts = hostname.split(".");
          business.name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        } catch {
          // Keep whatever we have
        }
      }
    }

    // Verify description isn't just a repeat of the headline
    if (
      business.description &&
      content?.headline &&
      business.description.toLowerCase().trim() ===
        content.headline.toLowerCase().trim()
    ) {
      business.description = "";
    }

    // Verify email format
    if (business.contact?.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.contact.email)) {
        business.contact.email = undefined;
      }
    }
  }

  // If services list is empty after validation, set to undefined
  if (content?.services && content.services.length === 0) {
    content.services = undefined;
  }

  return updates;
}

function isGenericName(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return (
    !lower ||
    lower === "home" ||
    lower === "welcome" ||
    lower === "untitled" ||
    lower === "website" ||
    lower === "my website" ||
    lower === "homepage"
  );
}

// ── Pass 9: Quality Scoring ───────────────────────────────────────────────

interface QualityDimensions {
  completeness: number;
  consistency: number;
  duplication: number;
  hierarchy: number;
  mediaRecovery: number;
  businessUnderstanding: number;
}

function scoreQuality(r: Partial<ExtractionResult>): QualityDimensions {
  // Completeness: (has name + has headline + has description + has hero image + has services + has contact) / 6 * 100
  const completenessFactors = [
    r.business?.name ? 1 : 0,
    r.content?.headline ? 1 : 0,
    r.content?.description || r.business?.description ? 1 : 0,
    r.images?.hero ? 1 : 0,
    r.content?.services && r.content.services.length > 0 ? 1 : 0,
    r.business?.contact?.email || r.business?.contact?.phone || r.business?.contact?.address
      ? 1
      : 0,
  ];
  const completeness = Math.round(
    (completenessFactors.reduce((a, b) => a + b, 0) / 6) * 100
  );

  // Consistency: check for conflicting data
  let consistencyPenalty = 0;
  // Different brand names across fields
  if (
    r.business?.name &&
    r.content?.headline &&
    r.business.name.length > 2 &&
    r.content.headline.length > 2
  ) {
    // No penalty if name appears in headline (common and fine)
    if (
      !r.content.headline.toLowerCase().includes(r.business.name.toLowerCase())
    ) {
      // Mild penalty — headline may intentionally differ from brand name
      consistencyPenalty += 10;
    }
  }
  // Mismatched industry would be a bigger issue but hard to detect here
  const consistency = Math.max(0, 100 - consistencyPenalty);

  // Duplication: 100 - (duplicates found / total items * 100)
  const { duplicateCount, totalCount } = countDuplicates(r);
  const duplication =
    totalCount > 0
      ? Math.round(100 - (duplicateCount / totalCount) * 100)
      : 100;

  // Hierarchy: (has nav + has sections + proper h1>h2>h3 order) / 3 * 100
  const hierarchyFactors = [
    r.navigation?.items && r.navigation.items.length > 0 ? 1 : 0,
    r.sections?.order && r.sections.order.length > 0 ? 1 : 0,
    r.sections?.hasHero ? 1 : 0, // Proxy for proper heading hierarchy
  ];
  const hierarchy = Math.round(
    (hierarchyFactors.reduce((a, b) => a + b, 0) / 3) * 100
  );

  // Media recovery: (has logo + has hero + gallery count >= 2) / 3 * 100
  const mediaFactors = [
    r.images?.logo ? 1 : 0,
    r.images?.hero ? 1 : 0,
    r.images?.gallery && r.images.gallery.length >= 2 ? 1 : 0,
  ];
  const mediaRecovery = Math.round(
    (mediaFactors.reduce((a, b) => a + b, 0) / 3) * 100
  );

  // Business understanding: (has industry + has services + has contact + proper separation of nav vs content) / 4 * 100
  const bizFactors = [
    r.business?.industry ? 1 : 0,
    r.content?.services && r.content.services.length > 0 ? 1 : 0,
    r.business?.contact ? 1 : 0,
    r.navigation?.items && r.content?.services
      ? noNavServiceOverlap(r.navigation.items, r.content.services)
        ? 1
        : 0.5
      : 0,
  ];
  const businessUnderstanding = Math.round(
    (bizFactors.reduce((a, b) => a + b, 0) / 4) * 100
  );

  return {
    completeness,
    consistency,
    duplication,
    hierarchy,
    mediaRecovery,
    businessUnderstanding,
  };
}

function countDuplicates(r: Partial<ExtractionResult>): {
  duplicateCount: number;
  totalCount: number;
} {
  let duplicateCount = 0;
  let totalCount = 0;

  const checkList = <T>(items: T[] | undefined, keyFn: (item: T) => string) => {
    if (!items) return;
    totalCount += items.length;
    const seen = new Set<string>();
    for (const item of items) {
      const key = keyFn(item);
      if (seen.has(key)) duplicateCount++;
      seen.add(key);
    }
  };

  checkList(r.content?.services, (s) => s.title.toLowerCase().trim());
  checkList(r.content?.projects, (p) => p.title.toLowerCase().trim());
  checkList(r.content?.testimonials, (t) =>
    t.quote.slice(0, 48).toLowerCase().trim()
  );
  checkList(r.content?.faqItems, (f) =>
    f.question.slice(0, 48).toLowerCase().trim()
  );
  checkList(r.navigation?.items, (n) => n.label.toLowerCase().trim());

  if (r.images?.gallery) {
    totalCount += r.images.gallery.length;
    const seen = new Set<string>();
    for (const url of r.images.gallery) {
      if (seen.has(url)) duplicateCount++;
      seen.add(url);
    }
  }

  return { duplicateCount, totalCount };
}

function noNavServiceOverlap(
  navItems: { label: string }[],
  services: { title: string }[]
): boolean {
  const navLabels = new Set(navItems.map((n) => n.label.toLowerCase().trim()));
  return services.every((s) => !navLabels.has(s.title.toLowerCase().trim()));
}

// ── Pass 10: Asset Confidence ─────────────────────────────────────────────

function scoreAssetConfidence(r: Partial<ExtractionResult>): {
  logo: number;
  images: number;
  colors: number;
  text: number;
  structure: number;
} {
  // Logo: 0 if missing, 0.5 if favicon, 0.9 if explicit logo
  let logoScore = 0;
  if (r.images?.logo) {
    logoScore = /favicon/i.test(r.images.logo) ? 0.5 : 0.9;
  }

  // Images: proportional to gallery count (0 → 0, 1 → 0.4, 2 → 0.65, 3+ → 0.9)
  const galleryCount = r.images?.gallery?.length ?? 0;
  let imagesScore = 0;
  if (galleryCount >= 3) imagesScore = 0.9;
  else if (galleryCount === 2) imagesScore = 0.65;
  else if (galleryCount === 1) imagesScore = 0.4;

  // Colors: 0.2 if default, 0.8 if extracted accent
  const colorsScore = r.tokens?.colors?.accent ? 0.8 : 0.2;

  // Text: based on confidence level
  let textScore = 0.3; // default low
  if (r.content?.headline && r.content?.description && r.business?.name) {
    textScore = 0.9;
  } else if (r.content?.headline || r.business?.name) {
    textScore = 0.6;
  }

  // Structure: proportional to section count / 5
  const sectionCount = r.sections?.order?.length ?? 0;
  const structureScore = Math.min(1, sectionCount / 5);

  return {
    logo: logoScore,
    images: imagesScore,
    colors: colorsScore,
    text: textScore,
    structure: Math.round(structureScore * 100) / 100,
  };
}

// ── Utility ───────────────────────────────────────────────────────────────

function dedupeByKey<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
