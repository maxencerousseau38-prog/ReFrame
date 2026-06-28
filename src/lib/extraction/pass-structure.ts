import type { HTMLElement } from "node-html-parser";
import type { PassContext, PassResult } from "./types";
import { cleanFramerNavItems } from "./platform";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Labels to exclude from navigation (utility / chrome links). */
const NAV_EXCLUDE_RE =
  /^(home|menu|login|sign.?in|sign.?up|register|search|cart|basket|skip|cookie|accept|close|toggle|lang|en|fr|de|es)$/i;

/** Heading → section type mapping (first match wins). */
const SECTION_MATCHERS: [RegExp, string][] = [
  [/about|story|mission|who we are|à propos/i, "about"],
  [/services|what we do|our services|nos services/i, "services"],
  [/portfolio|projects|work|case stud|réalisations/i, "portfolio"],
  [/gallery|galerie|photos/i, "gallery"],
  [/testimonial|review|client|avis/i, "testimonials"],
  [/faq|question|asked/i, "faq"],
  [/contact|get in touch|reach/i, "contact"],
  [/pricing|price|plan|tarif/i, "pricing"],
  [/team|people|founder|équipe/i, "team"],
  [/process|how|approach|method/i, "process"],
  [/number|stats|metric|chiffres/i, "stats"],
  [/feature|why|benefit|advantage|pourquoi/i, "features"],
  [/blog|news|journal|article/i, "blog"],
  [/newsletter|subscribe|abonne/i, "newsletter"],
];

function classifyHeading(text: string, isFirstH1: boolean): string {
  if (isFirstH1) return "hero";

  const t = clean(text);
  for (const [re, type] of SECTION_MATCHERS) {
    if (re.test(t)) return type;
  }
  return "features";
}

// ---------------------------------------------------------------------------
// Pass 1 — Page structure: navigation, sections, hierarchy
// ---------------------------------------------------------------------------

export async function runStructurePass(ctx: PassContext): Promise<PassResult> {
  const { root, platform } = ctx;

  // -----------------------------------------------------------------------
  // 1. Extract navigation items from nav and header links
  // -----------------------------------------------------------------------

  const navAnchors = root.querySelectorAll("nav a, header a");
  const rawItems: { label: string; href: string }[] = [];

  for (const a of navAnchors) {
    const label = clean(a.text);
    const href = (a.getAttribute("href") || "").trim();
    if (label) rawItems.push({ label, href });
  }

  // 2. Apply Framer deduplication if needed
  let labels = rawItems.map((i) => i.label);
  if (platform === "framer") {
    labels = cleanFramerNavItems(labels);
  }

  // Build a label→href lookup (first occurrence wins after dedup)
  const labelToHref = new Map<string, string>();
  for (const item of rawItems) {
    const key = clean(item.label).toLowerCase();
    if (!labelToHref.has(key)) {
      labelToHref.set(key, item.href);
    }
  }

  // 3. Filter nav items: length, exclusion list, deduplication
  const seen = new Set<string>();
  const navItems: { label: string; path: string; isAnchor: boolean }[] = [];

  for (const label of labels) {
    const trimmed = clean(label);
    if (trimmed.length < 2 || trimmed.length > 32) continue;
    if (NAV_EXCLUDE_RE.test(trimmed)) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    // 4. Classify as anchor vs page link
    const href = labelToHref.get(key) || "";
    const isAnchor =
      href.startsWith("#") ||
      href.startsWith("/#") ||
      (href.includes("#") && !href.startsWith("http"));

    navItems.push({
      label: trimmed,
      path: href || `/${key.replace(/\s+/g, "-")}`,
      isAnchor,
    });
  }

  // -----------------------------------------------------------------------
  // 5. Extract section headings from the DOM in document order
  // -----------------------------------------------------------------------

  const rawSections: { type: string; heading: string; confidence: number }[] =
    [];

  // When Framer section identities are available, use them as primary source
  if (ctx.framerSections && ctx.framerSections.length > 0) {
    for (const fs of ctx.framerSections) {
      const heading = fs.element.querySelector("h1, h2, h3");
      const headingText = heading ? clean(heading.text) : fs.name;
      rawSections.push({
        type: fs.type,
        heading: headingText,
        confidence: 0.9,
      });
    }
  } else {
    const headings = root.querySelectorAll("h1, h2, h3");
    let firstH1Seen = false;

    for (const h of headings) {
      const text = clean(h.text);
      if (!text || text.length < 2) continue;

      const tagName = h.tagName?.toLowerCase() || "h3";
      const isH1 = tagName === "h1";
      const isFirstH1 = isH1 && !firstH1Seen;
      if (isH1) firstH1Seen = true;

      const type = classifyHeading(text, isFirstH1);

      const hasKeywordMatch = SECTION_MATCHERS.some(([re]) => re.test(text));
      let confidence = 0.5;
      if (isFirstH1 && type === "hero") confidence = 0.95;
      else if ((tagName === "h1" || tagName === "h2") && hasKeywordMatch)
        confidence = 0.85;
      else if (tagName === "h3" && hasKeywordMatch) confidence = 0.7;

      rawSections.push({ type, heading: text, confidence });
    }
  }

  // Check for contact via form presence
  const hasFormInPage = root.querySelector("form") !== null;
  if (hasFormInPage) {
    // If no contact section was detected, see if a heading near a form matches
    const hasContactSection = rawSections.some((s) => s.type === "contact");
    if (!hasContactSection) {
      rawSections.push({
        type: "contact",
        heading: "Contact",
        confidence: 0.6,
      });
    }
  }

  // -----------------------------------------------------------------------
  // 8. Collapse consecutive duplicate section types
  // -----------------------------------------------------------------------

  const sections: { type: string; heading?: string; confidence: number }[] = [];
  for (const section of rawSections) {
    const prev = sections[sections.length - 1];
    if (prev && prev.type === section.type) continue; // skip consecutive duplicate
    sections.push(section);
  }

  // -----------------------------------------------------------------------
  // 7. Detect structural flags
  // -----------------------------------------------------------------------

  const hasHero = sections.some((s) => s.type === "hero");
  const hasContact =
    hasFormInPage || sections.some((s) => s.type === "contact");
  const hasFooter = root.querySelector("footer") !== null;

  // -----------------------------------------------------------------------
  // 9. Return PassResult
  // -----------------------------------------------------------------------

  return {
    updates: {
      navigation: {
        items: navItems,
      },
      sections: {
        order: sections,
        hasHero,
        hasContact,
        hasFooter,
      },
    },
  };
}
