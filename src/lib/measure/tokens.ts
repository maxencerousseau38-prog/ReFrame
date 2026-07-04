/**
 * V2 MEASURE — real design tokens from a RenderedSite (Chantier 4).
 *
 * First true consumer of the CAPTURE layer. Everything here is derived from
 * COMPUTED values collected in the browser (snapshot nodes/blocks), weighted
 * by what the visitor actually sees (painted area) — never from presets.
 *
 * Charter rules:
 *  - a token the capture cannot support is `undefined` (+ a coverage note),
 *    never a guessed default;
 *  - every measurement carries its own confidence (method metadata) and a
 *    file-precise origin — ready for the resolver (per-field, at last);
 *  - collection stays lossless upstream: this module only reads.
 *
 * Tier 1 captures (no computedSnapshot) yield fonts/cssVariables passthrough
 * and nothing else — measured honesty over coverage.
 */

import type { ComputedNodeStyle, FontFaceRecord, RenderedSite } from "@/lib/capture/types";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface MeasuredValue<T> {
  value: T;
  /** 0–1, method metadata (coverage share, sample size…), never site data. */
  confidence: number;
  origin: string;
}

export interface PaletteRoles {
  surface?: MeasuredValue<string>;
  surface2?: MeasuredValue<string>;
  ink?: MeasuredValue<string>;
  ink2?: MeasuredValue<string>;
  accent?: MeasuredValue<string>;
  border?: MeasuredValue<string>;
}

export interface TypographyTokens {
  displayFont?: MeasuredValue<string>;
  bodyFont?: MeasuredValue<string>;
  headingWeight?: MeasuredValue<number>;
  bodyWeight?: MeasuredValue<number>;
  /** em-relative tracking of the display level ("-0.024em"). */
  tracking?: MeasuredValue<string>;
  uppercaseHeadings?: MeasuredValue<boolean>;
  /** px sizes at the widest viewport. */
  scalePx?: MeasuredValue<{ display: number; h2?: number; body?: number; small?: number }>;
  /** Fluid display size reconstructed from two measured viewports. */
  displayClamp?: MeasuredValue<string>;
}

export interface SpacingTokens {
  sectionPaddingY?: MeasuredValue<{ min: number; median: number; max: number }>;
  /** 64px-base multiplier, snapped to the DNA scale {1, 1.25, 1.5, 2}. */
  spacingMultiplier?: MeasuredValue<number>;
  containerWidth?: MeasuredValue<number>;
}

export interface SurfaceTokens {
  buttonRadius?: MeasuredValue<number>;
  cardRadius?: MeasuredValue<number>;
  cardShadow?: MeasuredValue<string>;
  hairlineBorders?: MeasuredValue<boolean>;
}

export interface MeasuredTokens {
  palette: PaletteRoles;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  surfaces: SurfaceTokens;
  /** Raw :root custom properties, verbatim from capture. */
  cssVariables: Record<string, string>;
  /** Real font faces, verbatim from capture. */
  fonts: FontFaceRecord[];
  prefersDark?: MeasuredValue<boolean>;
  coverage: {
    nodesUsed: number;
    viewportsUsed: number[];
    notes: string[];
  };
}

/* -------------------------------------------------------------------------- */
/*  Color helpers                                                             */
/* -------------------------------------------------------------------------- */

interface Rgba { r: number; g: number; b: number; a: number }

export function parseColor(css: string | undefined): Rgba | null {
  if (!css) return null;
  const m = css.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+))?\s*\)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  const hex = css.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  return null;
}

const toHex = (c: Rgba): string =>
  "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");

/** Relative luminance (WCAG-ish, gamma-less — ranking only). */
const luminance = (c: Rgba): number => (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;

const saturation = (c: Rgba): number => {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  return max === 0 ? 0 : (max - min) / max;
};

/** Coarse perceptual distance — role separation, not colour science. */
const distance = (a: Rgba, b: Rgba): number =>
  Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

const area = (rect: { width: number; height: number }): number =>
  Math.max(0, rect.width) * Math.max(0, rect.height);

/** Area-weighted tally of colours; returns entries sorted by weight. */
function tally(entries: Array<{ color: Rgba; weight: number }>): Array<{ color: Rgba; weight: number }> {
  const byHex = new Map<string, { color: Rgba; weight: number }>();
  for (const e of entries) {
    if (e.weight <= 0 || e.color.a < 0.5) continue;
    const key = toHex(e.color);
    const hit = byHex.get(key);
    if (hit) hit.weight += e.weight;
    else byHex.set(key, { color: e.color, weight: e.weight });
  }
  return Array.from(byHex.values()).sort((a, b) => b.weight - a.weight);
}

/* -------------------------------------------------------------------------- */
/*  Node access                                                               */
/* -------------------------------------------------------------------------- */

const px = (v: string | undefined): number | undefined => {
  if (!v) return undefined;
  const m = v.match(/^(-?\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : undefined;
};

function widest(site: RenderedSite) {
  return [...site.viewports].sort((a, b) => b.viewport - a.viewport)[0];
}
function narrowest(site: RenderedSite) {
  return [...site.viewports].sort((a, b) => a.viewport - b.viewport)[0];
}

/* -------------------------------------------------------------------------- */
/*  measureTokens                                                             */
/* -------------------------------------------------------------------------- */

export function measureTokens(site: RenderedSite): MeasuredTokens {
  const notes: string[] = [];
  const wide = widest(site);

  const base: MeasuredTokens = {
    palette: {},
    typography: {},
    spacing: {},
    surfaces: {},
    cssVariables: site.cssVariables,
    fonts: site.fonts,
    coverage: {
      nodesUsed: 0,
      viewportsUsed: site.viewports.map((v) => v.viewport),
      notes,
    },
  };

  if (!wide || wide.nodes.length === 0) {
    notes.push("no computed snapshot; token measurement unavailable (Tier 1 capture)");
    return base;
  }

  const nodes = wide.nodes;
  const blocks = wide.blocks;
  base.coverage.nodesUsed = nodes.length;
  const origin = (fn: string) => `measure/tokens.ts#${fn}@${wide.viewport}`;

  /* ---- palette by roles (painted-area weighting) ---- */

  const surfaceTally = tally(
    blocks
      .map((b) => ({ color: parseColor(b.backgroundColor)!, weight: area(b.rect) }))
      .filter((e) => e.color !== null) as Array<{ color: Rgba; weight: number }>
  );
  const totalSurface = surfaceTally.reduce((a, e) => a + e.weight, 0);
  if (surfaceTally.length > 0 && totalSurface > 0) {
    const top = surfaceTally[0];
    base.palette.surface = {
      value: toHex(top.color),
      confidence: Math.min(0.95, top.weight / totalSurface + 0.2),
      origin: origin("surface"),
    };
    const second = surfaceTally.find((e) => distance(e.color, top.color) > 30);
    if (second) {
      base.palette.surface2 = {
        value: toHex(second.color),
        confidence: Math.min(0.9, second.weight / totalSurface + 0.15),
        origin: origin("surface2"),
      };
    }
    base.prefersDark = {
      value: luminance(top.color) < 0.35,
      confidence: 0.9,
      origin: origin("prefersDark"),
    };
  } else {
    notes.push("no opaque block backgrounds; surface/prefersDark unmeasured");
  }

  const textNodes = nodes.filter((n) => n.role === "heading" || n.role === "text");
  const inkTally = tally(
    textNodes
      .map((n) => ({ color: parseColor(n.styles.color)!, weight: area(n.rect) }))
      .filter((e) => e.color !== null) as Array<{ color: Rgba; weight: number }>
  );
  const totalInk = inkTally.reduce((a, e) => a + e.weight, 0);
  if (inkTally.length > 0 && totalInk > 0) {
    base.palette.ink = {
      value: toHex(inkTally[0].color),
      confidence: Math.min(0.95, inkTally[0].weight / totalInk + 0.2),
      origin: origin("ink"),
    };
    const second = inkTally.find((e) => distance(e.color, inkTally[0].color) > 30);
    if (second) {
      base.palette.ink2 = {
        value: toHex(second.color),
        confidence: 0.7,
        origin: origin("ink2"),
      };
    }
  } else {
    notes.push("no measurable text colors; ink unmeasured");
  }

  // Accent: opaque action backgrounds distinct from the surface; fallback to
  // the most saturated colour that appears on 2+ nodes.
  const surfaceColor = base.palette.surface ? parseColor(base.palette.surface.value) : null;
  const actionBg = tally(
    nodes
      .filter((n) => n.role === "action")
      .map((n) => ({ color: parseColor(n.styles.backgroundColor)!, weight: 1 }))
      .filter((e) => e.color !== null) as Array<{ color: Rgba; weight: number }>
  ).filter((e) => !surfaceColor || distance(e.color, surfaceColor) > 60);
  if (actionBg.length > 0) {
    base.palette.accent = {
      value: toHex(actionBg[0].color),
      confidence: Math.min(0.9, 0.5 + actionBg[0].weight * 0.1),
      origin: origin("accent:action-background"),
    };
  } else {
    const saturated = tally(
      nodes
        .map((n) => ({ color: parseColor(n.styles.backgroundColor ?? n.styles.color)!, weight: 1 }))
        .filter((e) => e.color !== null) as Array<{ color: Rgba; weight: number }>
    )
      .filter((e) => e.weight >= 2 && saturation(e.color) > 0.45)
      .filter((e) => !surfaceColor || distance(e.color, surfaceColor) > 60);
    if (saturated.length > 0) {
      base.palette.accent = {
        value: toHex(saturated[0].color),
        confidence: 0.55,
        origin: origin("accent:saturation-fallback"),
      };
    } else {
      notes.push("no distinct action/saturated color; accent unmeasured");
    }
  }

  const borderTally = tally(
    nodes
      .map((n) => ({ color: parseColor(n.styles.borderColor)!, weight: 1 }))
      .filter((e) => e.color !== null) as Array<{ color: Rgba; weight: number }>
  ).filter((e) => !surfaceColor || distance(e.color, surfaceColor) > 15);
  if (borderTally.length > 0) {
    base.palette.border = {
      value: toHex(borderTally[0].color),
      confidence: 0.6,
      origin: origin("border"),
    };
  }

  /* ---- typography ---- */

  const headings = nodes.filter((n) => n.role === "heading");
  const texts = nodes.filter((n) => n.role === "text");
  const firstFamily = (stack: string | undefined): string | undefined => {
    const fam = stack?.split(",")[0]?.trim().replace(/^["']|["']$/g, "");
    return fam && fam.length > 0 ? fam : undefined;
  };

  const display = [...headings].sort(
    (a, b) => (px(b.styles.fontSize) ?? 0) - (px(a.styles.fontSize) ?? 0)
  )[0];

  if (display) {
    const fam = firstFamily(display.styles.fontFamily);
    if (fam) {
      base.typography.displayFont = { value: fam, confidence: 0.95, origin: origin("displayFont") };
    }
    const weight = parseInt(display.styles.fontWeight ?? "", 10);
    if (!isNaN(weight)) {
      base.typography.headingWeight = { value: weight, confidence: 0.95, origin: origin("headingWeight") };
    }
    const size = px(display.styles.fontSize);
    const ls = px(display.styles.letterSpacing);
    if (size && ls !== undefined) {
      base.typography.tracking = {
        value: `${(ls / size).toFixed(3)}em`,
        confidence: 0.85,
        origin: origin("tracking"),
      };
    }
    if (size) {
      const h2Sizes = headings.filter((h) => h.tag === "h2").map((h) => px(h.styles.fontSize) ?? 0);
      const bodySizes = texts.map((t) => px(t.styles.fontSize) ?? 0).filter((s) => s > 0);
      base.typography.scalePx = {
        value: {
          display: size,
          h2: h2Sizes.length ? Math.max(...h2Sizes) : undefined,
          body: bodySizes.length ? median(bodySizes) : undefined,
          small: bodySizes.length ? Math.min(...bodySizes) : undefined,
        },
        confidence: 0.85,
        origin: origin("scalePx"),
      };

      // Fluid display size from two measured widths.
      const narrow = narrowest(site);
      if (narrow && narrow.viewport !== wide.viewport) {
        const narrowDisplay = [...narrow.nodes.filter((n) => n.role === "heading")].sort(
          (a, b) => (px(b.styles.fontSize) ?? 0) - (px(a.styles.fontSize) ?? 0)
        )[0];
        const minSize = narrowDisplay ? px(narrowDisplay.styles.fontSize) : undefined;
        if (minSize && minSize < size) {
          const slopeVw = ((size - minSize) / (wide.viewport - narrow.viewport)) * 100;
          const interceptPx = minSize - (slopeVw * narrow.viewport) / 100;
          base.typography.displayClamp = {
            value: `clamp(${round1(minSize)}px, ${round1(interceptPx)}px + ${slopeVw.toFixed(2)}vw, ${round1(size)}px)`,
            confidence: 0.85,
            origin: `measure/tokens.ts#displayClamp@${narrow.viewport}+${wide.viewport}`,
          };
        } else if (minSize && minSize === size) {
          base.typography.displayClamp = {
            value: `${round1(size)}px`,
            confidence: 0.9,
            origin: `measure/tokens.ts#displayClamp@fixed`,
          };
        }
      }
    }
    const upper = headings.filter((h) => h.styles.textTransform === "uppercase").length;
    base.typography.uppercaseHeadings = {
      value: upper / headings.length > 0.5,
      confidence: 0.8,
      origin: origin("uppercaseHeadings"),
    };
  } else {
    notes.push("no heading nodes; typography scale unmeasured");
  }

  if (texts.length > 0) {
    const fam = firstFamily(texts[0].styles.fontFamily);
    if (fam) base.typography.bodyFont = { value: fam, confidence: 0.9, origin: origin("bodyFont") };
    const w = parseInt(texts[0].styles.fontWeight ?? "", 10);
    if (!isNaN(w)) base.typography.bodyWeight = { value: w, confidence: 0.8, origin: origin("bodyWeight") };
  }

  /* ---- spacing ---- */

  const blockNodes = nodes.filter((n) => n.role === "block" || n.role === "nav");
  const paddings = blockNodes
    .flatMap((n) => [px(n.styles.paddingTop), px(n.styles.paddingBottom)])
    .filter((v): v is number => v !== undefined && v >= 16);
  if (paddings.length >= 3) {
    const med = median(paddings);
    base.spacing.sectionPaddingY = {
      value: { min: Math.min(...paddings), median: med, max: Math.max(...paddings) },
      confidence: Math.min(0.9, 0.5 + paddings.length * 0.05),
      origin: origin("sectionPaddingY"),
    };
    const snapped = [1, 1.25, 1.5, 2].reduce((best, m) =>
      Math.abs(med / 64 - m) < Math.abs(med / 64 - best) ? m : best
    );
    base.spacing.spacingMultiplier = {
      value: snapped,
      confidence: 0.8,
      origin: origin("spacingMultiplier"),
    };
  } else {
    notes.push("too few section paddings; spacing unmeasured");
  }

  const contentWidths = blocks
    .map((b) => b.rect.width)
    .filter((w) => w > 400 && w < wide.viewport - 32);
  if (contentWidths.length >= 2) {
    base.spacing.containerWidth = {
      value: Math.round(median(contentWidths)),
      confidence: 0.7,
      origin: origin("containerWidth"),
    };
  }

  /* ---- surfaces ---- */

  const actionRadii = nodes
    .filter((n) => n.role === "action")
    .map((n) => px(n.styles.borderRadius))
    .filter((v): v is number => v !== undefined);
  if (actionRadii.length > 0) {
    base.surfaces.buttonRadius = {
      value: median(actionRadii),
      confidence: Math.min(0.9, 0.5 + actionRadii.length * 0.1),
      origin: origin("buttonRadius"),
    };
  }

  const shadowed = nodes.filter(
    (n) => n.styles.boxShadow && n.styles.boxShadow !== "none"
  );
  if (shadowed.length > 0) {
    const counts = new Map<string, number>();
    for (const n of shadowed) counts.set(n.styles.boxShadow!, (counts.get(n.styles.boxShadow!) ?? 0) + 1);
    const [topShadow, count] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    base.surfaces.cardShadow = {
      value: topShadow,
      confidence: Math.min(0.85, 0.4 + count * 0.1),
      origin: origin("cardShadow"),
    };
    const radii = shadowed
      .map((n) => px(n.styles.borderRadius))
      .filter((v): v is number => v !== undefined);
    if (radii.length > 0) {
      base.surfaces.cardRadius = { value: median(radii), confidence: 0.75, origin: origin("cardRadius") };
    }
  }

  return base;
}

/* -------------------------------------------------------------------------- */
/*  Small math                                                                */
/* -------------------------------------------------------------------------- */

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;
