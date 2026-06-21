/**
 * Brand colour system. Pure, dependency-free maths (safe to import in client
 * components) that turns the single extracted brand colour into a coherent
 * scheme — tinted neutrals plus a complementary accent — for BOTH a light and a
 * dark theme. The goal is brand consistency: a blue brand glows faintly blue on
 * its off-black canvas (the Linear move), a warm brand reads as a warm off-white
 * in light mode. See DESIGN.md for the grammar this encodes.
 */

import type { Theme } from "./types";

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")).join("")}`;
}

/** HSL (h in degrees, s/l in 0..1) to #rrggbb. */
export function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}

/** #rrggbb to HSL (h in degrees, s/l in 0..1). Neutral colours return h=0,s=0. */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

export interface Scheme {
  /** Page canvas. */
  surface: string;
  /** Cards / secondary panels. */
  surface2: string;
  /** Card fill (white in light, elevated in dark). */
  card: string;
  /** Body text on the surface. */
  ink: string;
  /** Inverse band (stats / CTA) background. */
  contrast: string;
  /** Complementary accent, a gentle analogous shift — for tasteful 2-stop gradients. */
  accent2: string;
}

/**
 * Derive a full light or dark scheme from one brand accent. Saturation is kept
 * deliberately low on neutrals so the tint reads as "premium", never as a wash;
 * a neutral/monochrome brand (black, white, gray) yields pure neutrals, which is
 * exactly right. `mood` only nudges how much of the brand tint shows in light.
 */
export function deriveScheme(accent: string, dark: boolean, mood: Theme["mood"] = "minimal"): Scheme {
  const { h, s, l } = hexToHsl(accent);
  // Complementary/analogous secondary keeps the brand hue family.
  const accent2 = hslToHex((h + 24) % 360, Math.min(0.9, s), Math.max(0.4, Math.min(0.6, l)));

  if (dark) {
    // Tinted off-black, à la Linear (#08090a): the hue is present but whisper-faint.
    const sd = Math.min(0.16, s);
    return {
      surface: hslToHex(h, sd * 0.9, 0.035),
      surface2: hslToHex(h, sd * 0.8, 0.095),
      card: hslToHex(h, sd * 0.8, 0.095),
      ink: hslToHex(h, sd * 0.45, 0.93),
      contrast: hslToHex(h, sd * 0.9, 0.14),
      accent2,
    };
  }

  // Light: brand-tinted near-white. Warm/elegant moods show a touch more tint.
  const moodTint = mood === "warm" || mood === "elegant" ? 1 : mood === "bold" ? 0.7 : 0.55;
  const sl = Math.min(0.4, s) * moodTint;
  return {
    surface: hslToHex(h, sl * 0.5, 0.99),
    surface2: hslToHex(h, sl * 0.5, 0.96),
    card: "#ffffff",
    ink: hslToHex(h, sl * 0.4, 0.1),
    contrast: hslToHex(h, Math.min(0.5, s) * 0.7, 0.13),
    accent2,
  };
}
