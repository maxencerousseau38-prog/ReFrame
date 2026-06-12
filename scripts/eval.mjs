/**
 * Evaluation harness — measures whether ReFrame can actually rebuild a site from
 * what it extracts. Drives the real pipeline (dashboard -> analyze -> generate ->
 * result) per URL and exports a rich CSV plus a visual contact sheet.
 *
 * Per site it records:
 *   - sector (detected industry) and analysis confidence (full/partial/fallback)
 *   - extracted logo (url), brand color, and how many images actually load
 *   - quantity of content recovered (headline+description chars, services,
 *     detected sections)
 *   - a 0-100 EXTRACTION SCORE (transparent weighting below) and a screenshot
 *
 * EXTRACTION SCORE (0-100), auditable:
 *   confidence   full 40 / partial 20 / fallback 0
 *   logo         +15 if a logo URL was extracted
 *   brand color  +10 if an accent color was extracted
 *   images       +15 * min(imagesLoaded,5)/5   (loaded = passes the proxy)
 *   content      +10 text (headline+desc, full at >=200 chars)
 *                +5  services (>=3)
 *                +5  structure (>=4 detected sections; +3 at >=2)
 *
 * To measure headless rendering, run a Browserless box and set BROWSERLESS_URL
 * before starting the app (see .env.example), then compare scores.
 *
 * Usage (app must be running):
 *   BASE=http://localhost:3000 node scripts/eval.mjs [urls-file]
 * Defaults: BASE=http://localhost:3000, urls-file=scripts/eval-urls.txt
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const BASE = process.env.BASE || "http://localhost:3000";
const URLS_FILE = process.argv[2] || "scripts/eval-urls.txt";
const OUT = process.env.OUT || "eval";
const SHOTS = path.join(OUT, "screenshots");

const urls = readFileSync(URLS_FILE, "utf8")
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
if (!urls.length) {
  console.error(`No URLs in ${URLS_FILE}`);
  process.exit(1);
}
mkdirSync(SHOTS, { recursive: true });

const hostOf = (u) => {
  try { return new URL(u).hostname.replace(/^www\./, ""); }
  catch { return u.replace(/[^a-z0-9]+/gi, "-"); }
};

function extractionScore(r) {
  let s = 0;
  s += r.confidence === "full" ? 40 : r.confidence === "partial" ? 20 : 0;
  if (r.logo) s += 15;
  if (r.accent) s += 10;
  s += Math.round((Math.min(r.imagesOk, 5) / 5) * 15);
  s += r.contentChars >= 200 ? 10 : Math.round((r.contentChars / 200) * 10);
  s += r.services >= 3 ? 5 : 0;
  s += r.sections >= 4 ? 5 : r.sections >= 2 ? 3 : 0;
  return Math.min(100, s);
}

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
const rows = [];

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const host = hostOf(url);
  const slug = `${String(i + 1).padStart(2, "0")}-${host.replace(/[^a-z0-9]+/gi, "-")}`;
  const shotRel = path.join("screenshots", `${slug}.png`);
  const row = {
    n: i + 1, url, host, confidence: "error", sector: "", brand: "",
    logo: "", accent: "", imagesOk: 0, imagesTotal: 0, contentChars: 0,
    services: 0, sections: 0, blocks: 0, score: 0, notice: false, shot: "",
  };
  process.stdout.write(`[${i + 1}/${urls.length}] ${host} ... `);

  // Fresh context per URL so sessionStorage never leaks between sites.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.1 });
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/dashboard?url=${encodeURIComponent(url)}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      () => !!sessionStorage.getItem("sr:analysis") || !!document.querySelector(".text-red-300"),
      { timeout: 60000 }
    );
    const a = await page.evaluate(() => {
      const r = sessionStorage.getItem("sr:analysis");
      return r ? JSON.parse(r) : null;
    });
    if (!a) throw new Error("analysis failed");

    const ec = a.extractedContent || {};
    row.confidence = a.confidence || (a.fetched ? "full" : "fallback");
    row.sector = a.industry || "";
    row.brand = a.brandName || "";
    row.logo = a.brand?.logoUrl || "";
    row.accent = a.brand?.accentColor || "";
    row.notice = !!a.notice;
    row.contentChars = `${ec.headline || ""} ${ec.description || ""}`.trim().length;
    row.services = (ec.services || []).length;
    row.sections = a.structure?.sections?.length || (a.detectedSections || []).length || 0;
    const images = (ec.images || []).slice(0, 6);
    row.imagesTotal = images.length;

    // Generate (Preserve default), capture the rebuilt structure
    await page.getByRole("button", { name: /transform my site/i }).first().click();
    await page.waitForURL(/\/result/, { timeout: 30000 });
    await page.waitForFunction(() => !!sessionStorage.getItem("sr:schema"), { timeout: 30000 });
    const schema = await page.evaluate(() => JSON.parse(sessionStorage.getItem("sr:schema")));
    row.blocks = schema.blocks.length;

    // How many extracted images actually load through the proxy
    row.imagesOk = await page.evaluate(async (imgs) => {
      let ok = 0;
      for (const u of imgs) {
        try {
          const r = await fetch(`/api/img?u=${encodeURIComponent(u)}`);
          if (r.ok && (r.headers.get("content-type") || "").startsWith("image/")) ok++;
        } catch {}
      }
      return ok;
    }, images);

    // Screenshot the full rebuilt page
    await page.waitForTimeout(1400);
    await page.evaluate(() => {
      const sc = document.querySelector(".max-h-\\[70vh\\]");
      if (sc) { sc.classList.remove("max-h-[70vh]", "overflow-y-auto"); sc.style.maxHeight = "none"; sc.style.overflow = "visible"; }
    });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, shotRel), fullPage: true });
    row.shot = shotRel;

    row.score = extractionScore(row);
    console.log(`score ${row.score} | ${row.confidence} | ${row.sector} | logo ${row.logo ? "Y" : "-"} color ${row.accent || "-"} | img ${row.imagesOk}/${row.imagesTotal} | ${row.contentChars} chars`);
  } catch (e) {
    console.log(`ERROR ${String(e).slice(0, 60)}`);
  } finally {
    await ctx.close();
  }
  rows.push(row);
}
await browser.close();

// --- results.csv ----------------------------------------------------------
const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
const head = "n,url,sector,confidence,score,logo,brand_color,images_loaded,images_total,content_chars,services,sections,blocks,notice";
const csv = [head].concat(
  rows.map((r) => [
    r.n, q(r.url), r.sector, r.confidence, r.score, q(r.logo), r.accent,
    r.imagesOk, r.imagesTotal, r.contentChars, r.services, r.sections, r.blocks, r.notice,
  ].join(","))
).join("\n");
writeFileSync(path.join(OUT, "results.csv"), csv);

// --- index.html (contact sheet) -------------------------------------------
const scoreColor = (s) => (s >= 70 ? "#16a34a" : s >= 40 ? "#d97706" : "#dc2626");
const cards = rows.map((r) => `<div class="card">
  <div class="meta">
    <span class="score" style="background:${scoreColor(r.score)}">${r.score}</span>
    <b>${r.host}</b>
    <span class="tag">${r.confidence}</span>
    <span class="tag">${r.sector || "?"}</span>
    <span class="tag">logo ${r.logo ? "✓" : "✗"}</span>
    ${r.accent ? `<span class="tag"><span class="sw" style="background:${r.accent}"></span>${r.accent}</span>` : `<span class="tag">no color</span>`}
    <span class="tag">img ${r.imagesOk}/${r.imagesTotal}</span>
    <span class="tag">${r.contentChars} chars</span>
  </div>
  ${r.shot ? `<a href="${r.shot}" target="_blank"><img loading="lazy" src="${r.shot}"/></a>` : `<div class="fail">no render</div>`}
</div>`).join("\n");
const ok = rows.filter((r) => r.shot).length;
const avg = ok ? Math.round(rows.filter((r) => r.shot).reduce((a, r) => a + r.score, 0) / ok) : 0;
const dist = rows.reduce((a, r) => ((a[r.confidence] = (a[r.confidence] || 0) + 1), a), {});
const summary = `avg score ${avg}/100 · ${Object.entries(dist).map(([k, v]) => `${k}: ${v}`).join(" · ")}`;
writeFileSync(path.join(OUT, "index.html"), `<!doctype html><meta charset="utf-8"><title>ReFrame extraction eval</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;margin:0;background:#0b0b0f;color:#e7e7ea;padding:24px}
  h1{font-size:18px;margin:0 0 4px} .sum{color:#a1a1aa;margin-bottom:20px}
  .grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(340px,1fr))}
  .card{border:1px solid #26262b;border-radius:12px;overflow:hidden;background:#141418}
  .meta{display:flex;align-items:center;gap:7px;padding:10px 12px;font-size:12px;flex-wrap:wrap}
  .score{font-weight:700;color:#fff;border-radius:7px;padding:2px 8px;font-size:13px}
  .tag{color:#a1a1aa;border:1px solid #2c2c33;border-radius:9px;padding:1px 7px;display:inline-flex;align-items:center;gap:5px}
  .sw{width:9px;height:9px;border-radius:3px;display:inline-block}
  img{width:100%;display:block;border-top:1px solid #26262b}
  .fail{padding:40px;text-align:center;color:#dc2626;border-top:1px solid #26262b}
</style>
<h1>ReFrame extraction eval — ${rows.length} sites</h1>
<div class="sum">${summary}</div>
<div class="grid">${cards}</div>`);

console.log(`\n${summary}`);
console.log(`Open ${path.join(OUT, "index.html")}  ·  ${path.join(OUT, "results.csv")}`);
