import { describe, it, expect } from "vitest";
import { schemaToHtml, collectImages } from "./export-html";
import type { SiteSchema } from "./generation/types";

const schema: SiteSchema = {
  id: "x",
  sourceUrl: "https://acme.com",
  industry: "saas",
  brand: { name: "Acme", tagline: "We build sturdy things" },
  theme: { primary: "#0a0a0a", accent: "#6366f1", radius: "lg", font: "inter", mood: "minimal" },
  blocks: [
    { id: "h", type: "hero", variant: "HeroPremium1", props: { title: "Hi", subtitle: "Yo", primaryCta: "Go" } },
    { id: "f", type: "footer", variant: "Footer1", props: { brand: "Acme" } },
  ],
};

describe("schemaToHtml SEO head", () => {
  const html = schemaToHtml(schema, { branded: false });

  it("is a valid standalone document with title + description", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<title>Acme</title>");
    expect(html).toContain('name="description" content="We build sturdy things"');
  });

  it("includes Open Graph, Twitter, theme-color and JSON-LD", () => {
    expect(html).toContain('property="og:title" content="Acme"');
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('name="theme-color" content="#6366f1"');
    expect(html).toContain('"@type":"Organization"');
  });

  it("escapes the brand name in meta/title", () => {
    const evil = schemaToHtml({ ...schema, brand: { name: 'A"<b>', tagline: "t" } }, {});
    expect(evil).not.toContain('<title>A"<b></title>');
    expect(evil).toContain("&lt;b&gt;");
  });

  it("includes a sticky brand nav with section links", () => {
    expect(html).toContain("position:sticky");
    expect(html).toContain('href="#contact"'); // links to the contact section
    expect(html).toContain('id="top"'); // hero anchor
  });

  it("omits the branding badge when branded:false, includes it when true", () => {
    expect(html).not.toContain("Made with ReFrame");
    expect(schemaToHtml(schema, { branded: true })).toContain("Made with ReFrame");
  });
});

describe("self-contained export (no lock-in)", () => {
  const withImages: SiteSchema = {
    ...schema,
    blocks: [
      { id: "h", type: "hero", variant: "HeroPremium2", props: { title: "Hi", subtitle: "Yo", image: "https://cdn.example.com/hero.jpg" } },
      { id: "pf", type: "portfolio", variant: "PortfolioGrid", props: { title: "Work", items: [{ title: "A", image: "https://cdn.example.com/a.png" }] } },
      { id: "f", type: "footer", variant: "Footer1", props: { brand: "Acme" } },
    ],
  };

  it("collects every referenced image URL", () => {
    expect(collectImages(withImages).sort()).toEqual([
      "https://cdn.example.com/a.png",
      "https://cdn.example.com/hero.jpg",
    ]);
  });

  it("rewrites image URLs to bundled local asset paths", () => {
    const assets = { "https://cdn.example.com/hero.jpg": "assets/img-1.jpg", "https://cdn.example.com/a.png": "assets/img-2.png" };
    const html = schemaToHtml(withImages, { branded: false, assets });
    expect(html).toContain("assets/img-1.jpg");
    expect(html).toContain("assets/img-2.png");
    expect(html).not.toContain("cdn.example.com"); // no remote dependency left
  });
});

describe("exported site is fully functional (no dead buttons)", () => {
  const wired: SiteSchema = {
    ...schema,
    blocks: [
      { id: "h", type: "hero", variant: "HeroCanvas", props: { title: "Hi", subtitle: "Yo", primaryCta: "Get a quote", primaryHref: "#contact", secondaryCta: "Call us", secondaryHref: "tel:0123456789" } },
      { id: "c", type: "contact", variant: "ContactFormPremium1", props: { title: "Contact", subtitle: "Reply within a day", contact: { phone: "01 23 45 67 89", email: "hi@acme.com", address: "1 Rue X, Paris", bookingUrl: "https://cal.com/acme" } } },
      { id: "f", type: "footer", variant: "Footer1", props: { brand: "Acme" } },
    ],
  };
  const html = schemaToHtml(wired, { branded: false });

  it("has no dead # anchors", () => {
    expect(html).not.toMatch(/href="#"/);
  });

  it("wires hero CTAs to their real destinations", () => {
    expect(html).toContain('href="tel:0123456789"');
  });

  it("renders a functional contact section (call / book / email / directions / mailto form)", () => {
    expect(html).toContain('href="tel:0123456789"');
    expect(html).toContain('href="https://cal.com/acme"');
    expect(html).toContain('href="mailto:hi@acme.com"');
    expect(html).toContain("google.com/maps/search");
    expect(html).toContain('action="mailto:hi@acme.com"');
  });
});
