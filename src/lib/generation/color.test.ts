import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { findAccent, parseColorToHex } from "./engine";

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
