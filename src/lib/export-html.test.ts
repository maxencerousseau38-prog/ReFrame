import { describe, it, expect } from "vitest";
import { schemaToHtml } from "./export-html";
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

  it("omits the branding badge when branded:false, includes it when true", () => {
    expect(html).not.toContain("Made with ReFrame");
    expect(schemaToHtml(schema, { branded: true })).toContain("Made with ReFrame");
  });
});
