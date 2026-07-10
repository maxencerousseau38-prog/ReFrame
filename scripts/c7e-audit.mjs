/**
 * C7e — quality + business audit harness. Drives the REAL pipeline
 * (dashboard → analyze → generate → result) on sector-diverse real sites and
 * saves, per site:
 *   - a full-page screenshot of the reconstruction (desktop 1440)
 *   - the analysis + generated schema (business-relevant slices) as JSON
 *   - a business-signal scan of the SOURCE homepage HTML (what the source
 *     actually offers: prices/cart/booking/search/filters/team/menus…)
 * The JSON pairs are the evidence base to locate where business information
 * disappears in the pipeline. Usage: BASE=http://localhost:3000 node scripts/c7e-audit.mjs
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = "eval-c7e";
mkdirSync(path.join(OUT, "shots"), { recursive: true });
mkdirSync(path.join(OUT, "dumps"), { recursive: true });

const SITES = [
  ["ecommerce", "https://www.bruneau.fr"],
  ["immobilier", "https://www.guy-hoquet.com"],
  ["architecture", "https://www.wilmotte.com"],
  ["restaurant", "https://www.bouillon-chartier.com"],
  ["hotel", "https://www.hotellutetia.com"],
  ["avocats", "https://www.august-debouzy.com"],
  ["saas", "https://www.payfit.com"],
  ["industrie", "https://www.matferbourgeat.com"],
  ["sante", "https://www.elsan.care"],
];

/** What does the SOURCE actually offer? Heuristic scan of raw homepage HTML. */
async function sourceBusinessSignals(url) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    const html = (await res.text()).toLowerCase();
    const count = (re) => (html.match(re) || []).length;
    return {
      htmlKb: Math.round(html.length / 1024),
      prices: count(/\d\s?(€|eur)|\$\s?\d|(€|eur)\s?\d/g),
      addToCart: count(/ajouter au panier|add to cart|panier|cart/g),
      checkout: count(/checkout|paiement|commander/g),
      productCards: count(/produit|product/g),
      categories: count(/cat(é|e)gorie|collection/g),
      variants: count(/variante|taille|coloris|couleur\s*:/g),
      booking: count(/r(é|e)serv|book(ing| now)|rendez-vous|appointment|disponibilit/g),
      search: count(/recherche|search/g),
      filters: count(/filtre|filter|trier|sort by/g),
      menuCarte: count(/menu|carte|plat|d(é|e)jeuner|d(î|i)ner/g),
      rooms: count(/chambre|room|suite/g),
      properties: count(/bien(s)? (immobilier|à vendre)|acheter|louer|estimation|annonce/g),
      team: count(/(é|e)quipe|team|associ(é|e)|avocat|agent/g),
      expertise: count(/expertise|domaine|comp(é|e)tence|practice/g),
      pricing: count(/tarif|pricing|abonnement|plan/g),
      reviews: count(/avis|review|note|rating|étoile/g),
      hours: count(/horaire|ouvert|opening hours/g),
      phone: count(/tel:|téléphone|appel/g),
    };
  } catch (e) {
    return { error: String(e).slice(0, 80) };
  }
}

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-gpu"],
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/opt/pw-browsers/chromium",
});

for (const [sector, url] of SITES) {
  process.stdout.write(`[${sector}] ${url} ... `);
  const dump = { sector, url, source: await sourceBusinessSignals(url) };

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/dashboard?url=${encodeURIComponent(url)}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      () => !!sessionStorage.getItem("sr:analysis") || !!document.querySelector(".text-red-300"),
      { timeout: 90000 },
    );
    const a = await page.evaluate(() => JSON.parse(sessionStorage.getItem("sr:analysis") || "null"));
    if (!a) throw new Error("analysis failed");
    const ec = a.extractedContent || {};
    dump.analysis = {
      industry: a.industry,
      confidence: a.confidence,
      notice: a.notice,
      brandName: a.brandName,
      logo: a.brand?.logoUrl ? true : false,
      accent: a.brand?.accentColor,
      detectedSections: a.detectedSections,
      structureSections: (a.structure?.sections || []).map((s) => `${s.type}@${s.order}(${Math.round(s.confidence * 100)})`),
      nav: a.navItems,
      headline: ec.headline,
      ctaLabel: ec.ctaLabel,
      services: ec.services,
      images: (ec.images || []).length,
      testimonials: (ec.testimonials || []).length,
      stats: (ec.stats || []).length,
      faq: (ec.faqItems || []).length,
      language: ec.language,
      integrations: (a.integrations || []).map((i) => i.id),
      measured: { tokens: !!a.measuredTokens, scenes: !!a.measuredScenes },
    };

    await page.getByRole("button", { name: /transform my site/i }).first().click();
    await page.waitForURL(/\/result/, { timeout: 45000 });
    await page.waitForFunction(() => !!sessionStorage.getItem("sr:schema"), { timeout: 45000 });
    const schema = await page.evaluate(() => JSON.parse(sessionStorage.getItem("sr:schema")));
    dump.schema = {
      blocks: schema.blocks.map((b) => `${b.type}:${b.variant}${b.scene ? " [scene:" + Object.keys(b.scene.provenance || {}).join("+") + "]" : ""}`),
      pages: (schema.pages || []).map((p) => p.path),
      dark: schema.theme?.dark === true,
      tokens: !!schema.tokens,
      heroProps: Object.fromEntries(Object.entries(schema.blocks.find((b) => b.type === "hero")?.props || {})
        .filter(([k, v]) => typeof v === "string" && k !== "_dna").map(([k, v]) => [k, String(v).slice(0, 90)])),
    };

    // Honest full-page render: disable entrance animations (owner-facing
    // toggle) so below-the-fold content isn't frozen at opacity:0 by
    // unfired whileInView reveals in the fullPage screenshot.
    await page.evaluate(() => {
      const s = JSON.parse(sessionStorage.getItem("sr:schema"));
      s.animations = false;
      sessionStorage.setItem("sr:schema", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      const sc = document.querySelector(".max-h-\\[70vh\\]");
      if (sc) { sc.classList.remove("max-h-[70vh]", "overflow-y-auto"); sc.style.maxHeight = "none"; sc.style.overflow = "visible"; }
    });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, "shots", `${sector}.png`), fullPage: true });
    console.log(`OK — ${dump.analysis.industry}/${dump.analysis.confidence}, ${schema.blocks.length} blocks`);
  } catch (e) {
    dump.error = String(e).slice(0, 120);
    console.log(`ERROR ${dump.error}`);
  } finally {
    await ctx.close();
  }
  writeFileSync(path.join(OUT, "dumps", `${sector}.json`), JSON.stringify(dump, null, 2));
}
await browser.close();
console.log("done → eval-c7e/");
