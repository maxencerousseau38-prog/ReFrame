/**
 * V7 CSS Analyzer — extracts the full CSS intelligence from a RawPage.
 *
 * Goes beyond the existing pass-design.ts by:
 *   - Fetching external stylesheets (not just <style> tags)
 *   - Identifying CSS frameworks (Tailwind, Bootstrap)
 *   - Separating light/dark custom-property buckets
 *   - Detecting modern CSS features (clamp, container queries, scroll-driven)
 *   - Inferring color roles (surface/ink/accent/border)
 *
 * Pure function: takes a V7AnalysisContext, returns CSSAnalysis.
 * No I/O beyond the pre-fetched CSS strings in the context.
 */

import type { CSSAnalysis, CSSColorValue, CSSLength, KeyframeInfo, TransitionInfo, AnimationInfo, MediaQueryInfo, ContainerQueryInfo, GridDefinition, V7AnalysisContext } from "./types";

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export function analyzeCss(ctx: V7AnalysisContext): CSSAnalysis {
  const css = ctx.allCSS;

  const customProperties = extractCustomProperties(css);
  const customPropertyThemes = extractThemeBuckets(css);
  const colorValues = extractColorValues(css);
  const fontFamilies = extractFontFamilies(css);
  const fontSizes = extractFontSizes(css);
  const fontWeights = extractFontWeights(css);
  const lineHeights = extractLineHeights(css);
  const letterSpacings = extractLetterSpacings(css);
  const borderRadii = extractBorderRadii(css);
  const boxShadows = extractBoxShadows(css);
  const zIndexLevels = extractZIndexLevels(css);
  const keyframes = extractKeyframes(css);
  const transitions = extractTransitions(css);
  const animations = extractAnimations(css);
  const mediaQueries = extractMediaQueries(css);
  const containerQueries = extractContainerQueries(css);
  const gridDefinitions = extractGridDefinitions(css);

  return {
    customProperties,
    customPropertyThemes,
    colorValues,
    fontFamilies,
    fontSizes,
    fontWeights,
    lineHeights,
    letterSpacings,
    borderRadii,
    boxShadows,
    zIndexLevels,
    keyframes,
    transitions,
    animations,
    mediaQueries,
    containerQueries,
    gridDefinitions,
    flexboxUsage: extractFlexboxUsage(css),
    hasCustomProperties: Object.keys(customProperties).length > 0,
    hasClamp: /clamp\s*\(/i.test(css),
    hasCSSGrid: /display\s*:\s*grid/i.test(css) || /grid-template/i.test(css),
    hasFlexbox: /display\s*:\s*flex/i.test(css),
    hasContainerQueries: /@container/i.test(css),
    hasScrollSnap: /scroll-snap/i.test(css),
    hasScrollDrivenAnimation: /animation-timeline\s*:/i.test(css) || /scroll-timeline/i.test(css),
    cssFramework: detectCssFramework(ctx.rawPage.html, css),
  };
}

/* -------------------------------------------------------------------------- */
/*  Custom properties                                                         */
/* -------------------------------------------------------------------------- */

function extractCustomProperties(css: string): Record<string, string> {
  const props: Record<string, string> = {};
  const re = /--([\w-]+)\s*:\s*([^;}\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const name = m[1].trim();
    const value = m[2].trim();
    if (name && value && !props[name]) {
      props[name] = value;
    }
  }
  return props;
}

function extractThemeBuckets(css: string): CSSAnalysis["customPropertyThemes"] {
  const result: CSSAnalysis["customPropertyThemes"] = { default: {}, dark: {} };

  // Match :root { ... } blocks
  const rootRe = /:root\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = rootRe.exec(css))) {
    const block = m[1];
    for (const [name, value] of Object.entries(parseCustomPropsFromBlock(block))) {
      result.default[name] = value;
    }
  }

  // Match dark theme blocks: [data-theme="dark"], .dark, @media (prefers-color-scheme: dark)
  const darkPatterns = [
    /\[data-theme=["']dark["']\]\s*\{([^}]+)\}/g,
    /\.dark\s*\{([^}]+)\}/g,
    /@media\s*\(prefers-color-scheme\s*:\s*dark\)\s*\{([^}]*:root[^}]*\{([^}]+)\})/g,
  ];
  for (const pattern of darkPatterns) {
    const re2 = new RegExp(pattern.source, pattern.flags);
    let m2: RegExpExecArray | null;
    while ((m2 = re2.exec(css))) {
      const block = m2[2] ?? m2[1];
      for (const [name, value] of Object.entries(parseCustomPropsFromBlock(block))) {
        result.dark[name] = value;
      }
    }
  }

  return result;
}

function parseCustomPropsFromBlock(block: string): Record<string, string> {
  const props: Record<string, string> = {};
  const re = /--([\w-]+)\s*:\s*([^;}\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    props[m[1].trim()] = m[2].trim();
  }
  return props;
}

/* -------------------------------------------------------------------------- */
/*  Color values                                                              */
/* -------------------------------------------------------------------------- */

const COLOR_RE = /#([0-9a-f]{3,8})\b|rgba?\([^)]+\)|hsl[a]?\([^)]+\)/gi;

function extractColorValues(css: string): CSSColorValue[] {
  const freq: Map<string, number> = new Map();

  // Count raw occurrences
  let m: RegExpExecArray | null;
  const re = new RegExp(COLOR_RE.source, "gi");
  while ((m = re.exec(css))) {
    const raw = m[0].toLowerCase();
    freq.set(raw, (freq.get(raw) ?? 0) + 1);
  }

  // Exclude pure white/black extremes from role assignment
  const total = Array.from(freq.values()).reduce((s, v) => s + v, 0) || 1;

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([raw, count]) => ({
      raw,
      hex: toHex(raw),
      role: inferColorRole(raw, css),
      frequency: count / total,
    }));
}

function inferColorRole(raw: string, css: string): CSSColorValue["role"] {
  // Find nearby property names in the CSS
  const idx = css.toLowerCase().indexOf(raw.toLowerCase());
  if (idx === -1) return "unknown";
  const before = css.slice(Math.max(0, idx - 80), idx);
  if (/background(?:-color)?/i.test(before)) {
    const luma = estimateLuma(raw);
    return luma === null ? "surface" : luma > 0.7 ? "surface" : "ink";
  }
  if (/(?:^|[^-])color\s*:/i.test(before)) return "ink";
  if (/border(?:-color)?/i.test(before)) return "border";
  if (/box-shadow/i.test(before)) return "shadow";
  if (/accent|brand|primary/i.test(before)) return "accent";
  return "unknown";
}

function toHex(raw: string): string | null {
  const hashMatch = raw.match(/^#([0-9a-f]{3,8})$/i);
  if (hashMatch) {
    const h = hashMatch[1];
    if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
    if (h.length === 6) return `#${h}`;
    return null;
  }
  return null;
}

/** Rough relative luminance estimate from hex color. */
function estimateLuma(raw: string): number | null {
  const hex = toHex(raw);
  if (!hex) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/* -------------------------------------------------------------------------- */
/*  Typography                                                                */
/* -------------------------------------------------------------------------- */

function extractFontFamilies(css: string): string[] {
  const families = new Set<string>();
  // Capture everything up to ; or } (including quoted strings)
  const re = /font-family\s*:\s*([^;}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    // Take the first font in the stack, strip surrounding quotes
    const first = m[1].split(",")[0].trim().replace(/^['"]|['"]$/g, "");
    if (first && first.length < 80 && first !== "inherit" && first !== "unset") families.add(first);
  }
  // Google Fonts from @import or <link> — not in CSS string but can appear in @import
  const googleRe = /family=([A-Za-z+%\s]+)/g;
  let gm: RegExpExecArray | null;
  while ((gm = googleRe.exec(css))) {
    families.add(decodeURIComponent(gm[1].replace(/\+/g, " ")).trim());
  }
  return Array.from(families).slice(0, 20);
}

function extractFontSizes(css: string): CSSLength[] {
  const sizes: CSSLength[] = [];
  const seen = new Set<string>();
  const re = /font-size\s*:\s*([\d.]+)(px|rem|em|vw|vh|%)|font-size\s*:\s*clamp\([^)]+\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    if (m[0].includes("clamp")) {
      if (!seen.has("clamp")) {
        sizes.push({ value: 0, unit: "other", px: null });
        seen.add("clamp");
      }
      continue;
    }
    const value = parseFloat(m[1]);
    const unit = m[2] as CSSLength["unit"];
    const key = `${value}${unit}`;
    if (!seen.has(key)) {
      seen.add(key);
      const px = unit === "px" ? value : unit === "rem" ? value * 16 : null;
      sizes.push({ value, unit, px });
    }
  }
  return sizes.sort((a, b) => (b.px ?? 0) - (a.px ?? 0));
}

function extractFontWeights(css: string): number[] {
  const weights = new Set<number>();
  const re = /font-weight\s*:\s*(\d{3})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const w = parseInt(m[1], 10);
    if (w >= 100 && w <= 900) weights.add(w);
  }
  return Array.from(weights).sort((a, b) => a - b);
}

function extractLineHeights(css: string): number[] {
  const lhs = new Set<number>();
  const re = /line-height\s*:\s*([\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const v = parseFloat(m[1]);
    if (v >= 0.8 && v <= 3) lhs.add(v);
  }
  return Array.from(lhs).sort((a, b) => a - b);
}

function extractLetterSpacings(css: string): CSSLength[] {
  const spacings: CSSLength[] = [];
  const seen = new Set<string>();
  const re = /letter-spacing\s*:\s*(-?[\d.]+)(em|px|rem)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const value = parseFloat(m[1]);
    const unit = m[2].toLowerCase() as "em" | "px" | "rem";
    const key = `${value}${unit}`;
    if (!seen.has(key)) {
      seen.add(key);
      const px = unit === "px" ? value : null;
      spacings.push({ value, unit, px });
    }
  }
  return spacings;
}

/* -------------------------------------------------------------------------- */
/*  Layout / spacing                                                          */
/* -------------------------------------------------------------------------- */

function extractBorderRadii(css: string): number[] {
  const radii = new Set<number>();
  const re = /border-radius\s*:\s*([\d.]+)px/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    radii.add(Math.round(parseFloat(m[1])));
  }
  return Array.from(radii).sort((a, b) => a - b);
}

function extractBoxShadows(css: string): string[] {
  const shadows = new Set<string>();
  const re = /box-shadow\s*:\s*([^;}"]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const val = m[1].trim();
    if (val !== "none") shadows.add(val);
  }
  return Array.from(shadows).slice(0, 10);
}

function extractZIndexLevels(css: string): number[] {
  const levels = new Set<number>();
  const re = /z-index\s*:\s*(-?\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    levels.add(parseInt(m[1], 10));
  }
  return Array.from(levels).sort((a, b) => a - b);
}

/* -------------------------------------------------------------------------- */
/*  Motion                                                                    */
/* -------------------------------------------------------------------------- */

function extractKeyframes(css: string): KeyframeInfo[] {
  const result: KeyframeInfo[] = [];
  const re = /@keyframes\s+([\w-]+)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const name = m[1];
    const body = m[2];
    const steps = (body.match(/%|from|to/g) ?? []).length;
    result.push({ name, role: classifyKeyframe(name, body), steps: Math.max(2, steps) });
  }
  return result;
}

function classifyKeyframe(name: string, body: string): KeyframeInfo["role"] {
  const lowerName = name.toLowerCase();
  const lower = (name + body).toLowerCase();
  // Check name first for clear intent, then body for technique
  if (/slide|translate/i.test(lowerName) || /translatey|translatex\b/i.test(body)) return "slide";
  if (/rotate|spin/i.test(lower)) return "rotate";
  if (/scale|zoom|grow/i.test(lower)) return "scale";
  if (/blur/i.test(lower)) return "blur";
  if (/reveal|appear|enter|show/i.test(lower)) return "reveal";
  if (/fade/i.test(lowerName) || (/opacity/i.test(lower) && !/translate/i.test(lower))) return "fade";
  return "other";
}

function extractTransitions(css: string): TransitionInfo[] {
  const result: TransitionInfo[] = [];
  const re = /transition\s*:\s*([^;}"]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    for (const part of m[1].split(",")) {
      const tokens = part.trim().split(/\s+/);
      if (tokens.length >= 2) {
        const property = tokens[0];
        const durationMs = parseDurationMs(tokens[1]);
        const delayMs = tokens[3] ? parseDurationMs(tokens[3]) : 0;
        result.push({ property, durationMs, easing: tokens[2] ?? "ease", delayMs });
      }
    }
  }
  return result.slice(0, 50);
}

function extractAnimations(css: string): AnimationInfo[] {
  const result: AnimationInfo[] = [];
  const re = /animation\s*:\s*([^;}"]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const parts = m[1].trim().split(/\s+/);
    // animation: name duration timing-function delay iteration-count fill-mode
    const keyframeName = parts.find((p) => /^[a-z][\w-]*/i.test(p) && !/^\d/.test(p) && p !== "none") ?? "unknown";
    const durationMs = parseDurationMs(parts.find((p) => /^[\d.]+(ms|s)$/.test(p)) ?? "0");
    result.push({
      keyframeName,
      durationMs,
      easing: parts.find((p) => /ease|linear|cubic|step/i.test(p)) ?? "ease",
      delayMs: 0,
      iterationCount: parts.find((p) => /infinite|\d+/.test(p)) ?? "1",
      fillMode: parts.find((p) => /both|forwards|backwards|none/.test(p)) ?? "none",
    });
  }
  return result.slice(0, 30);
}

function parseDurationMs(s: string): number {
  if (!s) return 0;
  if (s.endsWith("ms")) return parseFloat(s);
  if (s.endsWith("s")) return parseFloat(s) * 1000;
  return parseFloat(s) || 0;
}

/* -------------------------------------------------------------------------- */
/*  Responsive                                                                */
/* -------------------------------------------------------------------------- */

function extractMediaQueries(css: string): MediaQueryInfo[] {
  const result: MediaQueryInfo[] = [];
  const re = /@media\s*([^{]+)\{((?:[^{}]*\{[^{}]*\})*[^{}]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const query = m[1].trim();
    const body = m[2];
    const ruleCount = (body.match(/\{/g) ?? []).length;
    const minW = query.match(/min-width\s*:\s*([\d.]+)\s*px/i);
    const maxW = query.match(/max-width\s*:\s*([\d.]+)\s*px/i);
    const valuePx = minW ? parseFloat(minW[1]) : maxW ? parseFloat(maxW[1]) : null;
    result.push({
      type: minW ? "min-width" : maxW ? "max-width" : "other",
      valuePx,
      features: [query],
      ruleCount,
    });
  }
  return result.slice(0, 20);
}

function extractContainerQueries(css: string): ContainerQueryInfo[] {
  const result: ContainerQueryInfo[] = [];
  const re = /@container\s*([\w-]*)\s*\(([^)]+)\)\s*\{([^}]*\{[^}]*\}[^}]*)\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const name = m[1].trim() || null;
    const condition = m[2].trim();
    const body = m[3];
    const ruleCount = (body.match(/\{/g) ?? []).length;
    const widthMatch = condition.match(/([\d.]+)px/);
    result.push({
      name,
      type: /inline-size/i.test(condition) ? "inline-size" : /\bsize\b/i.test(condition) ? "size" : "other",
      valuePx: widthMatch ? parseFloat(widthMatch[1]) : null,
      ruleCount: Math.max(1, ruleCount),
    });
  }
  return result;
}

function extractGridDefinitions(css: string): GridDefinition[] {
  const result: GridDefinition[] = [];
  const re = /grid-template-columns\s*:\s*([^;}"]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const columns = m[1].trim();
    const colCount = countGridColumns(columns);
    result.push({
      columns,
      rows: "",
      gap: { row: "0", col: "0" },
      columnCount: colCount,
    });
  }
  return result.slice(0, 10);
}

function countGridColumns(template: string): number | null {
  // repeat(N, ...) → N
  const repeatMatch = template.match(/repeat\s*\(\s*(\d+)/i);
  if (repeatMatch) return parseInt(repeatMatch[1]);
  // Count space-separated values (rough)
  const parts = template.trim().split(/\s+/).filter((p) => !["and", "or"].includes(p));
  return parts.length > 0 ? parts.length : null;
}

function extractFlexboxUsage(css: string): CSSAnalysis["flexboxUsage"] {
  const justifyContent = new Set<string>();
  const alignItems = new Set<string>();
  const jre = /justify-content\s*:\s*([\w-]+)/gi;
  let jm: RegExpExecArray | null;
  while ((jm = jre.exec(css))) justifyContent.add(jm[1]);
  const are = /align-items\s*:\s*([\w-]+)/gi;
  let am: RegExpExecArray | null;
  while ((am = are.exec(css))) alignItems.add(am[1]);
  return {
    justifyContent: Array.from(justifyContent),
    alignItems: Array.from(alignItems),
  };
}

/* -------------------------------------------------------------------------- */
/*  Framework detection                                                       */
/* -------------------------------------------------------------------------- */

function detectCssFramework(html: string, css: string): CSSAnalysis["cssFramework"] {
  if (
    /@tailwind\s+(base|utilities|components)/i.test(css) ||
    /class="[^"]*(?:text-[a-z]+-\d+|flex|grid|gap-\d+|p-\d+|m-\d+)/i.test(html)
  ) {
    return "tailwind";
  }
  if (
    /\.container-fluid/i.test(css) ||
    /col-(?:xs|sm|md|lg|xl)-\d+/i.test(html) ||
    /bootstrap/i.test(html)
  ) {
    return "bootstrap";
  }
  if (css.trim().length > 0) return "none";
  return "unknown";
}
