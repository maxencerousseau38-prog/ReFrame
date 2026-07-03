import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { detectLanguage } from "./language";
import { extractSite } from "./pipeline";
import { toSiteAnalysis } from "./bridge";

/* -------------------------------------------------------------------------- */
/*  detectLanguage                                                            */
/* -------------------------------------------------------------------------- */

const FR_TEXT =
  "Nous accompagnons les entreprises dans la création de leurs espaces. " +
  "Notre atelier travaille le bois massif pour des pièces uniques, avec une " +
  "attention particulière pour les matériaux et pour votre budget. Vous êtes " +
  "au bon endroit pour votre projet sur mesure dans les Alpes.";

const EN_TEXT =
  "We help teams build the products your customers love. Our platform brings " +
  "your data together with the tools you already use, from automation to " +
  "analytics, so you can focus on the work that matters for your business.";

describe("detectLanguage", () => {
  it("prefers the declared <html lang> attribute (measured signal)", () => {
    const root = parse(`<html lang="fr-FR"><body><h1>Hi</h1>${EN_TEXT}</body></html>`);
    expect(detectLanguage(root, EN_TEXT)).toEqual({ lang: "fr", source: "html-attr" });
  });

  it("falls back to the stopword heuristic on French prose", () => {
    const root = parse(`<html><body>x</body></html>`);
    expect(detectLanguage(root, FR_TEXT)).toEqual({ lang: "fr", source: "heuristic" });
  });

  it("detects English prose", () => {
    const root = parse(`<html><body>x</body></html>`);
    expect(detectLanguage(root, EN_TEXT)).toEqual({ lang: "en", source: "heuristic" });
  });

  it("returns undefined when inconclusive — nothing invented", () => {
    const root = parse(`<html><body>x</body></html>`);
    expect(detectLanguage(root, "12 34 56 78")).toBeUndefined();
    expect(detectLanguage(root, "lorem ipsum dolor sit amet")).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/*  extractSite — language + real CTA copy end to end                         */
/* -------------------------------------------------------------------------- */

function frenchSiteHtml(): string {
  return `<!DOCTYPE html><html lang="fr"><head><title>Atelier Lumière</title>
    <meta name="description" content="Menuiserie d'art à Grenoble depuis 1987."></head>
    <body>
      <nav><a href="/">Accueil</a><a href="/contact">Contact</a></nav>
      <section>
        <h1>Menuiserie d'art à Grenoble</h1>
        <p>${FR_TEXT}</p>
        <a href="#contact" class="cta">Discuter de votre projet</a>
      </section>
      <section><h2>Nos réalisations</h2><p>Bibliothèques, escaliers, agencements.</p></section>
    </body></html>`;
}

describe("extractSite (V2 content fields)", () => {
  it("extracts language and the real CTA label, skipping nav links", async () => {
    const ext = await extractSite("https://atelier.example", frenchSiteHtml());
    expect(ext.content.language).toBe("fr");
    expect(ext.content.primaryCtaLabel).toBe("Discuter de votre projet");
  });

  it("leaves the fields absent when the page has neither (never guessed)", async () => {
    const html = `<html><body>
      <h1>Untitled thing</h1>
      <p>zz qq ww ee rr tt yy uu ii oo pp aa ss dd ff gg hh jj kk ll</p>
    </body></html>`;
    const ext = await extractSite("https://x.example", html);
    expect(ext.content.language).toBeUndefined();
    expect(ext.content.primaryCtaLabel).toBeUndefined();
  });

  it("bridges both fields into SiteAnalysis.extractedContent", async () => {
    const ext = await extractSite("https://atelier.example", frenchSiteHtml());
    const analysis = toSiteAnalysis(ext);
    expect(analysis.extractedContent.language).toBe("fr");
    expect(analysis.extractedContent.ctaLabel).toBe("Discuter de votre projet");
  });

  it("ignores generic/nav-only actions for the CTA label", async () => {
    const html = `<html lang="en"><body>
      <section>
        <h1>Great plumbing services</h1>
        <p>${EN_TEXT}</p>
        <nav><a href="/book">Book now from nav</a></nav>
        <button>OK</button>
        <a href="/quote">Get a free quote</a>
      </section></body></html>`;
    const ext = await extractSite("https://p.example", html);
    expect(ext.content.primaryCtaLabel).toBe("Get a free quote");
  });
});
