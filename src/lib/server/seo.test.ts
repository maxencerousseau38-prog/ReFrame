import { describe, it, expect } from "vitest";
import { buildJsonLd, siteContact, siteImage } from "./seo";
import type { SiteSchema, Block } from "@/lib/generation/types";

function block(type: Block["type"], props: Record<string, unknown>): Block {
  return { id: `b_${type}`, type, variant: "X", props };
}

function schema(blocks: Block[], pages?: SiteSchema["pages"]): SiteSchema {
  return {
    id: "s1",
    sourceUrl: "https://acme.com",
    industry: "restaurant",
    brand: { name: "Acme Bistro", tagline: "Seasonal plates in the old town" },
    theme: { primary: "#111", accent: "#c2703d", radius: "lg", font: "serif", mood: "warm" },
    blocks,
    ...(pages ? { pages } : {}),
  };
}

describe("siteContact", () => {
  it("pulls phone/email/address from a contact block", () => {
    const s = schema([
      block("hero", { title: "Hi" }),
      block("contact", { contact: { phone: "+33 1 23", address: "1 Rue X", bookingUrl: "x" } }),
    ]);
    expect(siteContact(s)).toEqual({ phone: "+33 1 23", address: "1 Rue X" });
  });

  it("searches sub-pages too, and returns undefined when absent", () => {
    expect(siteContact(schema([block("hero", {})]))).toBeUndefined();
    const s = schema([block("hero", {})], [
      { path: "contact", label: "Contact", blocks: [block("contact", { contact: { email: "a@b.com" } })] },
    ]);
    expect(siteContact(s)).toEqual({ email: "a@b.com" });
  });
});

describe("siteImage", () => {
  it("returns the first absolute image across props (image/hero/images[])", () => {
    const s = schema([
      block("hero", { image: "not-absolute.jpg" }),
      block("about", { heroImageUrl: "https://cdn.acme.com/a.jpg" }),
    ]);
    expect(siteImage(s)).toBe("https://cdn.acme.com/a.jpg");
  });
});

describe("buildJsonLd", () => {
  it("emits LocalBusiness with NAP when contact details are present", () => {
    const s = schema([
      block("hero", { image: "https://cdn.acme.com/h.jpg" }),
      block("contact", { contact: { phone: "+33 1 23", address: "1 Rue X" } }),
    ]);
    const ld = buildJsonLd(s, "https://acme-bistro.reframe.site");
    expect(ld["@type"]).toBe("LocalBusiness");
    expect(ld.name).toBe("Acme Bistro");
    expect(ld.url).toBe("https://acme-bistro.reframe.site");
    expect(ld.telephone).toBe("+33 1 23");
    expect(ld.image).toBe("https://cdn.acme.com/h.jpg");
    expect(ld.address).toEqual({ "@type": "PostalAddress", streetAddress: "1 Rue X" });
  });

  it("falls back to Organization without physical contact, and omits url when unknown", () => {
    const ld = buildJsonLd(schema([block("hero", {})]));
    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toBeUndefined();
    expect(ld.description).toBe("Seasonal plates in the old town");
  });
});
