import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { extractContact, extractStats, cleanServiceLabels } from "./engine";

const root = (html: string) => parse(html, { blockTextElements: { script: false, style: true } });

describe("cleanServiceLabels", () => {
  it("strips nav/CTA/location noise (real Tartine nav)", () => {
    const out = cleanServiceLabels(["LOCATIONS", "VIEW ALL", "Bay Area", "The Bakery", "Tartine Manufactory", "Inner Sunset SF"]);
    expect(out).not.toContain("LOCATIONS");
    expect(out).not.toContain("VIEW ALL");
    expect(out).not.toContain("Bay Area");
    expect(out).not.toContain("Inner Sunset SF");
    expect(out).not.toContain("Tartine Manufactory"); // "manufactory" => location-ish
    expect(out).toContain("The Bakery");
  });

  it("keeps real offering names and dedupes", () => {
    const out = cleanServiceLabels(["Catering", "Wedding Cakes", "Catering", "Contact", "Shop Now", "Pastry Classes"]);
    expect(out).toEqual(["Catering", "Wedding Cakes", "Pastry Classes"]);
  });

  it("drops utility labels and pure symbols", () => {
    expect(cleanServiceLabels(["Home", "Cart", "FAQ", "→", "123"]).length).toBe(0);
  });
});

describe("extractContact", () => {
  it("prefers tel:/mailto: links and reads an <address>", () => {
    const r = root(
      `<a href="tel:+33123456789">Call</a><a href="mailto:hi@acme.com?subject=x">Email</a><address>12 Rue X, 75003 Paris</address>`
    );
    const c = extractContact(r, "", {});
    expect(c?.phone).toBe("+33123456789");
    expect(c?.email).toBe("hi@acme.com");
    expect(c?.address).toContain("Paris");
  });

  it("falls back to structured data, then text patterns", () => {
    const c = extractContact(root("<div>Reach us</div>"), "Call 01 23 45 67 89 or email team@shop.fr today", {});
    expect(c?.phone?.replace(/\s/g, "")).toContain("0123456789");
    expect(c?.email).toBe("team@shop.fr");
  });

  it("uses JSON-LD details when present", () => {
    const c = extractContact(root("<div></div>"), "", { telephone: "+1 555 0100", email: "x@y.com", address: "1 Main St, NY" });
    expect(c).toEqual({ phone: "+1 555 0100", email: "x@y.com", address: "1 Main St, NY" });
  });

  it("returns undefined when there is nothing real", () => {
    expect(extractContact(root("<p>hello world</p>"), "hello world", {})).toBeUndefined();
  });
});

describe("extractStats (real ratings only)", () => {
  it("builds stats from aggregateRating", () => {
    expect(extractStats({ ratingValue: "4.8", reviewCount: "230" })).toEqual([
      { value: "4.8★", label: "Average rating" },
      { value: "230+", label: "Reviews" },
    ]);
  });
  it("ignores invalid ratings and returns undefined when none", () => {
    expect(extractStats({ ratingValue: "9" })).toBeUndefined(); // >5 rejected
    expect(extractStats({})).toBeUndefined();
  });
});
