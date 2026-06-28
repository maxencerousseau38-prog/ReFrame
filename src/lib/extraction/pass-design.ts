import type { PassContext, PassResult } from "./types";
import { findAccent, detectSourceDark, parseColorToHex } from "@/lib/generation/engine";

/**
 * Pass 5+6 — CSS Intelligence + Motion Intelligence
 *
 * Extracts design tokens (colors, typography, spacing, radii, shadows,
 * breakpoints) and motion DNA (transitions, animations, parallax, hover
 * effects) from the source page.
 */
export async function runDesignPass(ctx: PassContext): Promise<PassResult> {
  // ── CSS Intelligence ──────────────────────────────────────────────────

  // 1. Collect all CSS
  const styleTags = ctx.root.querySelectorAll("style").map((s) => s.text);
  const inlineStyles = ctx.root
    .querySelectorAll("[style]")
    .map((e) => e.getAttribute("style") || "");
  const allCss = styleTags.join("\n");
  const allStyles = `${allCss}\n${inlineStyles.join("\n")}`;

  // 2. Extract CSS custom properties and categorize
  const customProps = extractCustomProperties(allCss);

  const colorTokens: Record<string, string> = {};
  const spacingTokens: string[] = [];
  const radiusTokens: number[] = [];
  const shadowTokens: string[] = [];
  const fontTokens: string[] = [];

  for (const [name, value] of Object.entries(customProps)) {
    const lower = name.toLowerCase();
    if (/color|bg|background|text|border|foreground|muted|accent|primary|secondary/.test(lower)) {
      const hex = parseColorToHex(value);
      if (hex) colorTokens[name] = hex;
    } else if (/gap|padding|margin|spacing/.test(lower)) {
      spacingTokens.push(value);
    } else if (/radius|rounded/.test(lower)) {
      const num = parseFloat(value);
      if (!isNaN(num)) radiusTokens.push(num);
    } else if (/shadow/.test(lower)) {
      shadowTokens.push(value);
    } else if (/font|type|heading|body/.test(lower)) {
      fontTokens.push(value);
    }
  }

  // 3. Primary/accent color
  const accent = findAccent(ctx.root);
  const accentHex = accent ? parseColorToHex(accent) : undefined;

  // 4. Surface color from body/html background
  let surfaceColor: string | undefined;
  for (const sel of ["body", "html"]) {
    const style = ctx.root.querySelector(sel)?.getAttribute("style") || "";
    const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i)?.[1];
    if (bgMatch) {
      surfaceColor = parseColorToHex(bgMatch.trim());
      if (surfaceColor) break;
    }
  }

  // 5. Typography detection
  const headingFont = detectHeadingFont(allCss);
  const bodyFont = detectBodyFont(allCss);
  const googleFonts = extractGoogleFonts(ctx.root);
  const fontFaceFonts = extractFontFaceFonts(allCss);
  const fontWeights = extractFontWeights(allCss);

  // Resolve heading/body fonts: prefer CSS declarations, fall back to Google/font-face
  const resolvedHeadingFont = headingFont || googleFonts[0] || fontFaceFonts[0];
  const resolvedBodyFont =
    bodyFont || (googleFonts.length > 1 ? googleFonts[1] : undefined) || fontFaceFonts[1];

  // 6. Breakpoints from @media queries
  const breakpoints = extractBreakpoints(allCss);

  // 7. Dark mode detection
  const isDark = detectSourceDark(ctx.html, ctx.root);

  // ── Motion Intelligence ───────────────────────────────────────────────

  // 1. CSS transitions and animations
  const transitions = extractTransitions(allStyles);
  const keyframes = extractKeyframes(allCss);
  const cssAnimations = extractAnimationProperties(allStyles);

  // 2. Framer motion hints
  const framerReveals = ctx.root
    .querySelectorAll("[data-framer-appear-id]")
    .map((el) => el.getAttribute("data-framer-appear-id") || "")
    .filter(Boolean);

  // 3. Motion level estimation
  const motionLevel = estimateMotionLevel(
    transitions,
    keyframes,
    cssAnimations,
    framerReveals,
    allStyles
  );

  // 4. Parallax detection
  const hasParallax =
    /transform\s*:[^;}]*translate3d/i.test(allStyles) ||
    /perspective\s*:/i.test(allStyles) ||
    ctx.root.querySelectorAll('[class*="parallax"]').length > 0 ||
    ctx.root.querySelectorAll(".parallax").length > 0;

  // 5. Hover effects
  const hoverEffects = extractHoverEffects(allCss);

  // Categorize keyframe animations
  const reveals = categorizeKeyframes(keyframes);

  return {
    updates: {
      tokens: {
        colors: {
          primary: accentHex || Object.values(colorTokens)[0],
          accent: accentHex,
          surface: surfaceColor,
        },
        typography: {
          headingFont: resolvedHeadingFont,
          bodyFont: resolvedBodyFont,
          weights: fontWeights.length > 0 ? fontWeights : undefined,
        },
        spacing: {},
        radii: dedupeNumbers(radiusTokens),
        shadows: shadowTokens.length > 0 ? dedupe(shadowTokens) : undefined,
        breakpoints: breakpoints.length > 0 ? breakpoints : undefined,
      },
      motion: {
        level: motionLevel,
        reveals: reveals.length > 0 ? reveals : undefined,
        parallax: hasParallax || undefined,
        hoverEffects: hoverEffects.length > 0 ? hoverEffects : undefined,
        transitions: transitions.length > 0 ? transitions : undefined,
      },
      source: {
        url: ctx.url,
        platform: ctx.platform,
        dark: isDark || undefined,
        fetched: true,
      },
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extractCustomProperties(css: string): Record<string, string> {
  const props: Record<string, string> = {};
  const re = /--([\w-]+)\s*:\s*([^;}\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    props[m[1].trim()] = m[2].trim();
  }
  return props;
}

function detectHeadingFont(css: string): string | undefined {
  // Look for font-family in h1/h2/h3 selectors
  const headingRe = /(?:h[1-3])[^{]*\{[^}]*font-family\s*:\s*([^;}"]+)/gi;
  const m = headingRe.exec(css);
  if (m) return cleanFontName(m[1]);
  return undefined;
}

function detectBodyFont(css: string): string | undefined {
  // Look for font-family on body or html
  const bodyRe = /(?:body|html)[^{]*\{[^}]*font-family\s*:\s*([^;}"]+)/gi;
  const m = bodyRe.exec(css);
  if (m) return cleanFontName(m[1]);
  return undefined;
}

function cleanFontName(raw: string): string {
  // Take the first font in the stack, strip quotes
  const first = raw.split(",")[0].trim().replace(/['"]/g, "");
  return first;
}

function extractGoogleFonts(root: import("node-html-parser").HTMLElement): string[] {
  const fonts: string[] = [];
  for (const link of root.querySelectorAll('link[href*="fonts.googleapis.com"]')) {
    const href = link.getAttribute("href") || "";
    // Handle both old-style (?family=Font+Name) and new (&family=Font+Name:wght@...)
    const familyRe = /family=([^&:;]+)/g;
    let fm: RegExpExecArray | null;
    while ((fm = familyRe.exec(href))) {
      const name = decodeURIComponent(fm[1].replace(/\+/g, " ")).trim();
      if (name && !fonts.includes(name)) fonts.push(name);
    }
  }
  return fonts;
}

function extractFontFaceFonts(css: string): string[] {
  const fonts: string[] = [];
  const re = /@font-face\s*\{[^}]*font-family\s*:\s*['"]?([^;'"}\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const name = m[1].trim().replace(/['"]/g, "");
    if (name && !fonts.includes(name)) fonts.push(name);
  }
  return fonts;
}

function extractFontWeights(css: string): number[] {
  const weights = new Set<number>();
  const re = /font-weight\s*:\s*(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    weights.add(parseInt(m[1], 10));
  }
  return Array.from(weights).sort((a, b) => a - b);
}

function extractBreakpoints(css: string): number[] {
  const bps = new Set<number>();
  const re = /@media[^{]*\(\s*(?:min|max)-width\s*:\s*([\d.]+)\s*px\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    bps.add(Math.round(parseFloat(m[1])));
  }
  return Array.from(bps).sort((a, b) => a - b);
}

function extractTransitions(
  css: string
): { property: string; duration: number; easing: string }[] {
  const results: { property: string; duration: number; easing: string }[] = [];
  const re = /transition\s*:\s*([^;}"]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const parts = m[1].trim().split(",");
    for (const part of parts) {
      const tokens = part.trim().split(/\s+/);
      if (tokens.length >= 2) {
        const property = tokens[0];
        const durationStr = tokens[1];
        const durationMs = parseDuration(durationStr);
        const easing = tokens[2] || "ease";
        results.push({ property, duration: durationMs, easing });
      }
    }
  }
  return results;
}

function parseDuration(s: string): number {
  if (s.endsWith("ms")) return parseFloat(s);
  if (s.endsWith("s")) return parseFloat(s) * 1000;
  return parseFloat(s) || 0;
}

function extractKeyframes(css: string): string[] {
  const names: string[] = [];
  const re = /@keyframes\s+([\w-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    names.push(m[1]);
  }
  return names;
}

function extractAnimationProperties(css: string): string[] {
  const anims: string[] = [];
  const re = /animation(?:-name)?\s*:\s*([^;}"]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    anims.push(m[1].trim());
  }
  return anims;
}

function estimateMotionLevel(
  transitions: { property: string; duration: number; easing: string }[],
  keyframes: string[],
  animations: string[],
  framerReveals: string[],
  allStyles: string
): 0 | 1 | 2 | 3 {
  // Check for complex motion indicators
  const hasParallax =
    /transform\s*:[^;}]*translate3d/i.test(allStyles) || /perspective\s*:/i.test(allStyles);
  const hasStagger = /stagger/i.test(allStyles) || /animation-delay/i.test(allStyles);
  const hasScrollLinked = /scroll-snap|scroll-behavior|IntersectionObserver/i.test(allStyles);

  if (hasParallax || hasStagger || hasScrollLinked || keyframes.length > 3) {
    return 3;
  }

  if (keyframes.length > 0 || animations.length > 0 || framerReveals.length > 0) {
    return 2;
  }

  if (transitions.length > 0) {
    return 1;
  }

  return 0;
}

function categorizeKeyframes(names: string[]): string[] {
  const categories: string[] = [];
  for (const name of names) {
    const lower = name.toLowerCase();
    if (/fade/i.test(lower)) categories.push("fade");
    else if (/slide/i.test(lower)) categories.push("slide");
    else if (/scale|zoom|grow/i.test(lower)) categories.push("scale");
    else if (/rotate|spin/i.test(lower)) categories.push("rotate");
    else if (/reveal|appear|enter/i.test(lower)) categories.push("reveal");
    else categories.push(name);
  }
  return dedupe(categories);
}

function extractHoverEffects(css: string): string[] {
  const effects: string[] = [];
  const re = /:hover\s*\{([^}]+)\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const body = m[1];
    if (/transform/i.test(body)) effects.push("transform");
    if (/opacity/i.test(body)) effects.push("opacity");
    if (/color/i.test(body)) effects.push("color");
    if (/background/i.test(body)) effects.push("background");
    if (/box-shadow/i.test(body)) effects.push("shadow");
    if (/scale/i.test(body)) effects.push("scale");
    if (/translate/i.test(body)) effects.push("translate");
  }
  return dedupe(effects);
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function dedupeNumbers(arr: number[]): number[] {
  return Array.from(new Set(arr)).sort((a, b) => a - b);
}
