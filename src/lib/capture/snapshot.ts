/**
 * V2 CAPTURE — the in-page snapshot script (Tier 2).
 *
 * `collectSnapshot` is passed to page.evaluate(): it MUST stay fully
 * self-contained (no imports, no outer-scope closures) so Playwright can
 * serialize it into the browser context. It only reads the DOM — collection,
 * never interpretation (charter): node selection is mechanical (tag +
 * visibility + size), block typing is left to MEASURE (Chantier 6).
 *
 * Spec: docs/V2_CHANTIER1_CAPTURE_SPEC.md §6.2
 */

import type {
  ComputedNodeStyle,
  RawBlockGeometry,
  FontFaceRecord,
  CssAnimationRecord,
} from "./types";

/** Fixed subset of computed properties collected per structural node. */
export const COMPUTED_PROPS = [
  // colors
  "color",
  "backgroundColor",
  "backgroundImage",
  "borderColor",
  // typography
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "textAlign",
  // box
  "display",
  "position",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "marginTop",
  "marginBottom",
  "gap",
  "borderRadius",
  "boxShadow",
  "opacity",
  "overflow",
  "zIndex",
  // grid / flex / sizing
  "gridTemplateColumns",
  "gridTemplateRows",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "maxWidth",
  "width",
  "height",
  // motion
  "transitionProperty",
  "transitionDuration",
  "transitionTimingFunction",
  "transitionDelay",
  "animationName",
  "animationDuration",
  "transform",
  "filter",
  "backdropFilter",
] as const;

/** Everything one evaluate() pass returns for a viewport. */
export interface SnapshotResult {
  nodes: ComputedNodeStyle[];
  blocks: RawBlockGeometry[];
  cssVariables: Record<string, string>;
  fonts: FontFaceRecord[];
  animations: CssAnimationRecord[];
  /** Live-CSSOM sheets: {href, content} — constructed/adopted styles (F10).
   *  Cross-origin sheets whose rules cannot be read are counted, not lost. */
  runtimeCss: { href: string | null; content: string }[];
  runtimeCssSkipped: number;
  scrollHeight: number;
}

/** Caps (spec §6.2) — passed into the page so the script stays data-driven. */
export const SNAPSHOT_LIMITS = {
  maxBlocks: 80,
  maxNodes: 400,
  maxCssVariables: 200,
  maxAnimations: 100,
  minBlockHeight: 40,
  textSlice: 160,
  maxRuntimeSheets: 40,
  maxRuntimeSheetBytes: 262_144, // 256 KB per sheet
  maxRuntimeTotalBytes: 1_048_576, // 1 MB across all sheets
} as const;

export type SnapshotLimits = typeof SNAPSHOT_LIMITS;

/**
 * Runs INSIDE the browser. Self-contained by contract — verified by a unit
 * test that its source references neither `import` nor `require`.
 */
export function collectSnapshot(args: {
  props: readonly string[];
  limits: SnapshotLimits;
}): SnapshotResult {
  const { props, limits } = args;
  const doc = document;

  /* ---- helpers (all local: the function must serialize) ---- */

  // F3: paths are root-anchored up to 16 ancestors; a truncated path is
  // explicitly marked ("… > ") so it can never be mistaken for a queryable
  // selector, and a per-snapshot registry guarantees UNIQUENESS (deep DOMs
  // could collide after truncation). A WeakMap caches the assigned path so
  // the same element always reports the same identity within one snapshot.
  const pathCache = new WeakMap<Element, string>();
  const pathCounts: Record<string, number> = {};
  const cssPath = (el: Element): string => {
    const cached = pathCache.get(el);
    if (cached) return cached;
    const parts: string[] = [];
    let cur: Element | null = el;
    let truncated = false;
    while (cur && cur !== doc.body) {
      if (parts.length >= 16) {
        truncated = true;
        break;
      }
      const tag = cur.tagName.toLowerCase();
      let index = 1;
      let sib = cur.previousElementSibling;
      while (sib) {
        if (sib.tagName === cur.tagName) index++;
        sib = sib.previousElementSibling;
      }
      parts.unshift(`${tag}:nth-of-type(${index})`);
      cur = cur.parentElement;
    }
    const raw = (truncated ? "… > " : "") + (parts.join(" > ") || "body");
    const n = (pathCounts[raw] = (pathCounts[raw] ?? 0) + 1);
    const unique = n === 1 ? raw : `${raw}~${n}`;
    pathCache.set(el, unique);
    return unique;
  };

  const rectOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x + window.scrollX),
      y: Math.round(r.y + window.scrollY),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  };

  const visible = (el: Element): boolean => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const cs = getComputedStyle(el);
    return cs.display !== "none" && cs.visibility !== "hidden";
  };

  const pickStyles = (el: Element): Record<string, string> => {
    const cs = getComputedStyle(el);
    const out: Record<string, string> = {};
    for (const p of props) {
      const v = cs[p as keyof CSSStyleDeclaration];
      if (typeof v === "string" && v !== "") out[p as string] = v;
    }
    return out;
  };

  const textOf = (el: Element): string =>
    (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, limits.textSlice);

  /* ---- block candidates: mechanical selection, no semantics ---- */

  const SKIP_TAGS = ["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"];
  const pageHeight = Math.max(
    doc.documentElement.scrollHeight || 0,
    doc.body ? doc.body.scrollHeight : 0
  );

  // F1: Framer/Webflow pages stack their real sections inside one or two
  // full-page wrapper divs (no <section> tags). Purely geometric descent:
  //  - a candidate covering ≥85% of the page with several children is a
  //    WRAPPER → its children compete instead;
  //  - single-child chains whose child covers ≥90% of the parent pass through.
  const expandWrappers = (roots: Element[]): Element[] => {
    const out: Element[] = [];
    const visit = (el: Element, depth: number): void => {
      const kids = Array.from(el.children).filter((k) => !SKIP_TAGS.includes(k.tagName));
      const h = el.getBoundingClientRect().height;
      if (depth < 4 && pageHeight > 0 && h >= pageHeight * 0.85 && kids.length >= 2) {
        for (const k of kids) visit(k, depth + 1);
        return;
      }
      if (depth < 4 && kids.length === 1 && h > 0) {
        const kh = kids[0].getBoundingClientRect().height;
        if (kh / h >= 0.9) {
          visit(kids[0], depth + 1);
          return;
        }
      }
      out.push(el);
    };
    for (const el of roots) visit(el, 0);
    return out;
  };

  const candidateSet = new Set<Element>();
  const topLevel: Element[] = [];
  const addChildren = (parent: Element | null) => {
    if (!parent) return;
    for (const child of Array.from(parent.children)) topLevel.push(child);
  };
  addChildren(doc.body);
  addChildren(doc.querySelector("main"));
  for (const el of expandWrappers(topLevel)) candidateSet.add(el);
  // data-framer-name is a mechanical platform hint (still collection: the
  // attribute exists on the source DOM), not a semantic interpretation.
  for (const el of Array.from(
    doc.querySelectorAll("section, header, footer, nav, [data-framer-name]")
  )) {
    candidateSet.add(el);
  }

  const blockEls = Array.from(candidateSet)
    .filter((el) => !["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"].includes(el.tagName))
    .filter(visible)
    .filter((el) => el.getBoundingClientRect().height >= limits.minBlockHeight)
    .sort((a, b) => rectOf(a).y - rectOf(b).y)
    .slice(0, limits.maxBlocks);

  const blocks: RawBlockGeometry[] = blockEls.map((el) => {
    const cs = getComputedStyle(el);
    const heading = el.querySelector("h1, h2, h3");
    return {
      path: cssPath(el),
      rect: rectOf(el),
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      childCount: el.children.length,
      headingText: heading ? textOf(heading) || null : null,
    };
  });

  /* ---- structural nodes inside each block ---- */

  const nodes: ComputedNodeStyle[] = [];
  // Nested candidates (a <section> inside an expanded wrapper child) may
  // select the same heading/media element twice — one styles entry per
  // element keeps paths unique WITHIN the list (F3).
  const pushed = new WeakSet<Element>();
  const pushNode = (el: Element, role: ComputedNodeStyle["role"], withText: boolean) => {
    if (nodes.length >= limits.maxNodes) return;
    if (pushed.has(el)) return;
    pushed.add(el);
    nodes.push({
      path: cssPath(el),
      tag: el.tagName.toLowerCase(),
      role,
      ...(withText ? { text: textOf(el) } : {}),
      rect: rectOf(el),
      styles: pickStyles(el),
    });
  };

  for (const el of blockEls) {
    const tag = el.tagName.toLowerCase();
    pushNode(el, tag === "nav" ? "nav" : "block", false);

    const heading = el.querySelector("h1, h2, h3, h4");
    if (heading && visible(heading)) pushNode(heading, "heading", true);

    const para = el.querySelector("p");
    if (para && visible(para)) pushNode(para, "text", true);

    const media = el.querySelector("img, picture, video, svg");
    if (media && visible(media)) pushNode(media, "media", false);

    const actions = Array.from(el.querySelectorAll("a[href], button"))
      .filter(visible)
      .slice(0, 3);
    for (const a of actions) pushNode(a, "action", true);

    if (nodes.length >= limits.maxNodes) break;
  }

  /* ---- :root custom properties (design tokens, collected verbatim) ---- */

  const cssVariables: Record<string, string> = {};
  const rootStyle = getComputedStyle(doc.documentElement);
  let varCount = 0;
  for (let i = 0; i < rootStyle.length && varCount < limits.maxCssVariables; i++) {
    const name = rootStyle[i];
    if (name && name.indexOf("--") === 0) {
      cssVariables[name] = rootStyle.getPropertyValue(name).trim();
      varCount++;
    }
  }

  /* ---- loaded fonts ---- */

  const fonts: FontFaceRecord[] = [];
  try {
    const seen = new Set<string>();
    (doc.fonts as unknown as { forEach: (cb: (f: FontFace) => void) => void }).forEach(
      (f: FontFace) => {
        if (f.status !== "loaded") return;
        const family = f.family.replace(/^["']|["']$/g, "");
        const key = `${family}|${f.weight}|${f.style}`;
        if (seen.has(key)) return;
        seen.add(key);
        fonts.push({ family, weight: f.weight, style: f.style, src: null, status: "loaded" });
      }
    );
  } catch {
    /* document.fonts unavailable → fonts stays empty; quality reports it */
  }

  /* ---- animations & transitions ---- */

  const animations: CssAnimationRecord[] = [];
  try {
    const anims = doc.getAnimations ? doc.getAnimations() : [];
    for (const a of anims.slice(0, limits.maxAnimations)) {
      const effect = a.effect as KeyframeEffect | null;
      const target = effect && (effect.target as Element | null);
      if (!target) continue;
      const timing = effect.getTiming();
      const duration = typeof timing.duration === "number" ? timing.duration : 0;
      let kind: CssAnimationRecord["kind"] = "webAnimation";
      let properties: string[] = [];
      const ctor = (a as unknown as { constructor: { name: string } }).constructor.name;
      if (ctor === "CSSTransition") {
        kind = "transition";
        properties = [(a as unknown as { transitionProperty: string }).transitionProperty];
      } else if (ctor === "CSSAnimation") {
        kind = "animation";
        properties = [(a as unknown as { animationName: string }).animationName];
      }
      animations.push({
        path: cssPath(target),
        kind,
        properties,
        duration,
        easing: String(timing.easing || ""),
        delay: typeof timing.delay === "number" ? timing.delay : 0,
      });
    }
  } catch {
    /* getAnimations unsupported → empty; quality notes it */
  }

  /* ---- live CSSOM (F10): constructed / adopted / JS-injected styles ---- */

  const runtimeCss: { href: string | null; content: string }[] = [];
  let runtimeCssSkipped = 0;
  let runtimeTotal = 0;
  try {
    const allSheets: CSSStyleSheet[] = [
      ...Array.from(doc.styleSheets),
      ...Array.from(
        (doc as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets ?? []
      ),
    ];
    for (const sheet of allSheets.slice(0, limits.maxRuntimeSheets)) {
      if (runtimeTotal >= limits.maxRuntimeTotalBytes) break;
      try {
        const rules = Array.from(sheet.cssRules)
          .map((r) => r.cssText)
          .join("\n");
        if (!rules) continue;
        const content = rules.slice(0, limits.maxRuntimeSheetBytes);
        runtimeCss.push({ href: sheet.href, content });
        runtimeTotal += content.length;
      } catch {
        // Cross-origin CSSOM access denied — counted, never silently lost
        // (the file itself was fetched by fetch-css over HTTP anyway).
        runtimeCssSkipped++;
      }
    }
  } catch {
    /* styleSheets unavailable → empty; quality notes it via counts */
  }

  return {
    nodes,
    blocks,
    cssVariables,
    fonts,
    animations,
    runtimeCss,
    runtimeCssSkipped,
    scrollHeight: Math.max(
      doc.documentElement.scrollHeight || 0,
      doc.body ? doc.body.scrollHeight : 0
    ),
  };
}
