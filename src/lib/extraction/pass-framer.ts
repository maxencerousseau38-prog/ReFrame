import type { HTMLElement } from "node-html-parser";
import type { PassContext, PassResult, FramerSection } from "./types";

const VARIANT_NAMES = /^(tablet|phone|mobile|responsive)/i;
const DESKTOP_NAMES = /^(desktop|default)/i;

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Section type inference from Framer data-framer-name
// ---------------------------------------------------------------------------

const SECTION_TYPE_MAP: [RegExp, string][] = [
  [/hero|banner|header(?!.*nav)/i, "hero"],
  [/about|story|mission/i, "about"],
  [/service|what we do/i, "services"],
  [/portfolio|project|work|case/i, "portfolio"],
  [/gallery|galerie|photos/i, "gallery"],
  [/testimonial|review|client/i, "testimonials"],
  [/faq|question/i, "faq"],
  [/contact|get in touch/i, "contact"],
  [/pricing|price|plan/i, "pricing"],
  [/team|people|founder/i, "team"],
  [/process|how|approach/i, "process"],
  [/stats|number|metric/i, "stats"],
  [/feature|why|benefit/i, "features"],
  [/footer/i, "footer"],
  [/cta|call.?to.?action/i, "cta"],
  [/newsletter|subscribe/i, "newsletter"],
];

function inferSectionType(name: string): string {
  const cleaned = clean(name).replace(/^section\s*[-–—:]\s*/i, "");
  for (const [re, type] of SECTION_TYPE_MAP) {
    if (re.test(cleaned)) return type;
  }
  return "features";
}

// ---------------------------------------------------------------------------
// Pass 0 — Framer Variant Collapsing
// ---------------------------------------------------------------------------

export async function runFramerPass(ctx: PassContext): Promise<PassResult> {
  if (ctx.platform !== "framer") {
    return { updates: {} };
  }

  let desktopKept = 0;
  let variantsRemoved = 0;
  let responsiveVariants = 0;

  // 1. Find all responsive variant containers and collapse them
  //    Framer wraps Desktop/Tablet/Phone as siblings inside a parent container.
  //    We keep the Desktop variant and remove the rest.
  collapseResponsiveVariants(ctx.root, (stats) => {
    desktopKept += stats.kept;
    variantsRemoved += stats.removed;
    responsiveVariants += stats.total;
  });

  // 2. Parse data-framer-name on <section> elements for section identities
  const framerSections: FramerSection[] = [];
  const namedSections: string[] = [];
  const componentNames = new Set<string>();

  for (const el of ctx.root.querySelectorAll("[data-framer-name]")) {
    const name = el.getAttribute("data-framer-name") || "";
    if (!name) continue;
    componentNames.add(name);

    const tag = el.tagName?.toLowerCase() || "";
    if (tag === "section" || name.toLowerCase().startsWith("section")) {
      const sectionName = clean(name).replace(/^section\s*[-–—:]\s*/i, "");
      const sectionType = inferSectionType(name);
      framerSections.push({
        name: sectionName,
        type: sectionType,
        element: el as unknown as import("node-html-parser").HTMLElement,
      });
      namedSections.push(sectionName);
    }
  }

  // 3. Detect layout hints (column counts) per section
  const layoutHints: { section: string; columns: number }[] = [];
  for (const section of framerSections) {
    const cols = detectColumns(section.element as unknown as HTMLElement);
    if (cols > 1) {
      layoutHints.push({ section: section.name, columns: cols });
    }
  }

  // 4. Count RichTextContainer instances
  const richTextContainers = ctx.root.querySelectorAll(
    '[data-framer-name="RichTextContainer"], [data-framer-name*="RichText"]'
  ).length;

  // Store framer sections on ctx for downstream passes
  ctx.framerSections = framerSections;

  return { updates: {} };
}

// ---------------------------------------------------------------------------
// Responsive variant collapsing
// ---------------------------------------------------------------------------

interface CollapseStats {
  kept: number;
  removed: number;
  total: number;
}

function collapseResponsiveVariants(
  root: HTMLElement,
  onStats: (stats: CollapseStats) => void
): void {
  // Strategy 1: Look for sibling elements with Desktop/Tablet/Phone data-framer-name
  const allNamed = root.querySelectorAll("[data-framer-name]");
  const processed = new Set<HTMLElement>();

  for (const el of allNamed) {
    const name = (el.getAttribute("data-framer-name") || "").toLowerCase();
    if (!DESKTOP_NAMES.test(name) && !VARIANT_NAMES.test(name)) continue;

    const parent = el.parentNode as HTMLElement | null;
    if (!parent || processed.has(parent as HTMLElement)) continue;

    const siblings = parent.childNodes.filter(
      (n): n is HTMLElement =>
        typeof (n as HTMLElement).getAttribute === "function" &&
        !!(n as HTMLElement).getAttribute("data-framer-name")
    );

    if (siblings.length < 2) continue;

    const desktopSiblings = siblings.filter((s) => {
      const n = (s.getAttribute("data-framer-name") || "").toLowerCase();
      return DESKTOP_NAMES.test(n);
    });
    const variantSiblings = siblings.filter((s) => {
      const n = (s.getAttribute("data-framer-name") || "").toLowerCase();
      return VARIANT_NAMES.test(n);
    });

    if (desktopSiblings.length > 0 && variantSiblings.length > 0) {
      processed.add(parent as HTMLElement);
      for (const variant of variantSiblings) {
        variant.remove();
      }
      onStats({
        kept: desktopSiblings.length,
        removed: variantSiblings.length,
        total: siblings.length,
      });
    }
  }

  // Strategy 2: Look for CSS class-based responsive hiding patterns
  // Framer often uses hidden-xxx classes or style-based display:none at breakpoints.
  // Remove elements that are explicitly for tablet/phone via their class names.
  for (const el of root.querySelectorAll(
    '[class*="tablet"], [class*="phone"], [class*="mobile"]'
  )) {
    const cls = el.getAttribute("class") || "";
    // Only remove if the class explicitly marks it as a responsive variant
    if (/\b(?:tablet|phone|mobile)[-_]?(?:only|variant|view)\b/i.test(cls)) {
      el.remove();
      onStats({ kept: 0, removed: 1, total: 1 });
    }
  }

  // Strategy 3: Hidden responsive variants via Framer's style attribute
  // Framer sets display:none on non-active variants in server-rendered HTML
  for (const el of root.querySelectorAll("[data-framer-name]")) {
    const style = el.getAttribute("style") || "";
    const name = (el.getAttribute("data-framer-name") || "").toLowerCase();
    if (
      style.includes("display: none") &&
      (VARIANT_NAMES.test(name) || /tablet|phone|mobile/i.test(name))
    ) {
      el.remove();
      onStats({ kept: 0, removed: 1, total: 1 });
    }
  }
}

// ---------------------------------------------------------------------------
// Column detection
// ---------------------------------------------------------------------------

function detectColumns(section: HTMLElement): number {
  const style = section.getAttribute("style") || "";

  // Check for grid-template-columns
  const gridMatch = style.match(
    /grid-template-columns\s*:\s*([^;]+)/i
  );
  if (gridMatch) {
    const cols = gridMatch[1]
      .trim()
      .split(/\s+/)
      .filter((t) => t !== "/" && t !== "auto");
    return Math.min(cols.length, 6);
  }

  // Check for flex layout with multiple children of similar width
  if (/display\s*:\s*flex/i.test(style)) {
    const children = section.childNodes.filter(
      (n): n is HTMLElement => typeof (n as HTMLElement).getAttribute === "function"
    );
    if (children.length >= 2 && children.length <= 6) {
      return children.length;
    }
  }

  // Look for nested containers with columns
  const gridChildren = section.querySelectorAll("[style*='grid-template-columns']");
  if (gridChildren.length > 0) {
    const firstGrid = gridChildren[0].getAttribute("style") || "";
    const gm = firstGrid.match(/grid-template-columns\s*:\s*([^;]+)/i);
    if (gm) {
      return Math.min(
        gm[1].trim().split(/\s+/).filter((t) => t !== "/" && t !== "auto").length,
        6
      );
    }
  }

  return 1;
}
