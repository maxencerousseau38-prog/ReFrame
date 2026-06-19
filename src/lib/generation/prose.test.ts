import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { extractProse } from "./engine";

const root = (html: string) => parse(html, { blockTextElements: { script: false, style: true } });

describe("extractProse — reuse the client's real words", () => {
  it("pulls the real About paragraph (wrapped layout too)", () => {
    const r = root(`
      <section><h2>About us</h2><div><p>Founded in 2004 in Lyon, our family workshop restores antique furniture with traditional techniques and a lot of patience.</p></div></section>
    `);
    const out = extractProse(r);
    expect(out.aboutBody).toContain("Founded in 2004 in Lyon");
  });

  it("pulls real service headings + descriptions (>= 3)", () => {
    const r = root(`
      <h3>Boiler repair</h3><p>Same-day diagnostics and fixes for every major boiler brand, fully guaranteed.</p>
      <h3>Bathroom fitting</h3><p>End-to-end installation, from the first plan to the final silicone bead.</p>
      <h3>Emergency callout</h3><p>A real plumber on the phone day or night when a pipe just cannot wait.</p>
    `);
    const out = extractProse(r);
    expect(out.serviceItems?.length).toBe(3);
    expect(out.serviceItems?.[0]).toEqual({ title: "Boiler repair", description: expect.stringContaining("Same-day") });
  });

  it("ignores generic headings and thin content", () => {
    const r = root(`<h3>Home</h3><p>x</p><h3>Contact</h3><p>y</p>`);
    const out = extractProse(r);
    expect(out.serviceItems).toBeUndefined(); // generic + too thin
    expect(out.aboutBody).toBeUndefined();
  });
});
