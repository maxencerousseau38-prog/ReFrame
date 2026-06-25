import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { findAccent, parseColorToHex } from "./engine";
import { hexToHsl, hslToHex, deriveScheme, contrastRatio, idealInkOn, ensureReadable } from "./color";

describe("WCAG contrast (the AA guarantee)", () => {
  it("contrastRatio matches the WCAG extremes", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 1);
  });

  it("idealInkOn picks dark text for a light accent, white for a deep one", () => {
    expect(idealInkOn("#ffd400")).toBe("#0a0a0a"); // yellow -> dark label
    expect(idealInkOn("#84cc16")).toBe("#0a0a0a"); // lime  -> dark label
    expect(idealInkOn("#5e6ad2")).toBe("#ffffff"); // indigo -> white label
    expect(contrastRatio(idealInkOn("#ffd400"), "#ffd400")).toBeGreaterThanOrEqual(4.5);
  });

  it("ensureReadable reaches the target while keeping the hue", () => {
    const fixed = ensureReadable("#9ad1ff", "#ffffff", 4.5); // pale blue on white fails
    expect(contrastRatio(fixed, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(hexToHsl(fixed).h).toBeCloseTo(hexToHsl("#9ad1ff").h, -1); // same hue family
  });

  it("deriveScheme body ink clears AA on the surface for any accent", () => {
    for (const accent of ["#ffd400", "#84cc16", "#5e6ad2", "#e11d48", "#000000", "#ffffff"]) {
      for (const dark of [false, true]) {
        const sc = deriveScheme(accent, dark);
        expect(contrastRatio(sc.ink, sc.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(sc.accentInk, accent)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("hexToHsl / hslToHex round-trip", () => {
  it("round-trips a saturated colour within tolerance", () => {
    const { h, s, l } = hexToHsl("#5e6ad2"); // Linear indigo
    expect(Math.round(h)).toBeGreaterThan(220);
    expect(Math.round(h)).toBeLessThan(245);
    expect(hslToHex(h, s, l)).toBe("#5e6ad2");
  });
  it("treats greys as neutral (s=0)", () => {
    expect(hexToHsl("#808080").s).toBeCloseTo(0, 5);
    expect(hexToHsl("#000000").s).toBeCloseTo(0, 5);
  });
});

describe("deriveScheme", () => {
  it("dark scheme is a near-black canvas tinted toward the brand hue", () => {
    const sc = deriveScheme("#5e6ad2", true);
    expect(hexToHsl(sc.surface).l).toBeLessThan(0.06); // off-black
    // hue is preserved (blue family), saturation kept whisper-faint
    expect(Math.round(hexToHsl(sc.surface).h)).toBeGreaterThan(220);
    expect(hexToHsl(sc.surface).s).toBeLessThan(0.2);
    expect(hexToHsl(sc.ink).l).toBeGreaterThan(0.85); // light text
  });
  it("light scheme is a near-white canvas with dark ink", () => {
    const sc = deriveScheme("#5e6ad2", false);
    expect(hexToHsl(sc.surface).l).toBeGreaterThan(0.96);
    expect(hexToHsl(sc.ink).l).toBeLessThan(0.15);
    expect(sc.card).toBe("#ffffff");
  });
  it("a monochrome brand yields pure neutrals (no colour wash)", () => {
    const sc = deriveScheme("#000000", true);
    expect(hexToHsl(sc.surface).s).toBeCloseTo(0, 5);
    expect(hexToHsl(sc.surface2).s).toBeCloseTo(0, 5);
  });
  it("derives a complementary secondary accent in the same hue family", () => {
    const sc = deriveScheme("#5e6ad2", false);
    expect(sc.accent2).toMatch(/^#[0-9a-f]{6}$/);
    expect(sc.accent2).not.toBe("#5e6ad2");
  });
});

describe("parseColorToHex", () => {
  it("parses hex (3/6/8), rgb(), rgba() and hsl()", () => {
    expect(parseColorToHex("#2563eb")).toBe("#2563eb");
    expect(parseColorToHex("#25f")).toBe("#2255ff");
    expect(parseColorToHex("#2563ebff")).toBe("#2563eb");
    expect(parseColorToHex("rgb(37, 99, 235)")).toBe("#2563eb");
    expect(parseColorToHex("rgba(37 99 235 / 0.5)")).toBe("#2563eb");
    expect(parseColorToHex("hsl(217, 83%, 53%)")).toBe("#2470eb"); // blue, ~ #2563eb
  });
  it("returns undefined for non-colors", () => {
    expect(parseColorToHex("transparent")).toBeUndefined();
    expect(parseColorToHex("")).toBeUndefined();
  });
});

const root = (html: string) => parse(html, { blockTextElements: { script: false, style: true } });

describe("findAccent", () => {
  it("prefers explicit theme-color over generic tokens", () => {
    const r = root(
      `<head><meta name="theme-color" content="#0d9488"></head><body><style>.x{color:#ff0000}</style></body>`
    );
    expect(findAccent(r)).toBe("#0d9488");
  });

  it("reads a brand-named CSS custom property (rgb)", () => {
    const r = root(`<style>:root{--brand-primary: rgb(37,99,235); --gap: 4px}</style>`);
    expect(findAccent(r)).toBe("#2563eb");
  });

  it("falls back to the most frequent vivid token", () => {
    const r = root(
      `<style>.a{color:#16a34a}.b{border:1px solid #16a34a}.c{background:#16a34a}.d{color:#777}</style>`
    );
    expect(findAccent(r)).toBe("#16a34a");
  });

  it("ignores neutrals (black/white/grey)", () => {
    const r = root(`<style>.a{color:#000}.b{background:#fff}.c{color:#888}</style>`);
    expect(findAccent(r)).toBeUndefined();
  });

  it("picks up a logo SVG fill when nothing else is present", () => {
    const r = root(`<header><svg><path fill="#db2777"/></svg></header>`);
    expect(findAccent(r)).toBe("#db2777");
  });
});
