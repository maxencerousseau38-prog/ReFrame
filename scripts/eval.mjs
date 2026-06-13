/**
 * Extraction evaluation harness — does ReFrame recover enough real material from
 * a URL to auto-rebuild a premium site? Drives the real pipeline
 * (dashboard -> analyze -> generate -> result) per URL and exports a per-dimension
 * CSV + a visual contact sheet + a printed verdict.
 *
 * Each reconstruction input is scored SEPARATELY (0-100), measuring only material
 * we actually extracted (a fallback fabricates default copy/sections, so its text
 * and structure score 0 - we never credit invented content):
 *   logo        100 if a logo URL was extracted
 *   color       100 if a brand accent color was extracted
 *   images      100 * min(imagesLoaded,5)/5   (loaded = passes the proxy)
 *   text        0 if fallback, else min(100, contentChars/200*100)
 *   structure   min(100, realSections/6*100)  (real detected structure only)
 *
 * GLOBAL score = weighted blend (auditable):
 *   text .30 · images .25 · structure .20 · color .15 · logo .10
 *
 * Decision thresholds (printed automatically):
 *   avg >= 70 AND >=70% of sites > 60  -> VALIDATED
 *   avg 50-70                          -> MIXED (hybrid workflow)
 *   avg < 50 (or too many fallbacks)   -> REJECTED (rethink workflow)
 *
 * Headless A/B: set BROWSERLESS_URL before starting the app (see .env.example)
 * and re-run to compare against the static baseline.
 *
 * Usage (app must be running):
 *   BASE=http://localhost:3000 node scripts/eval.mjs [urls-file]
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
if (!urls.length) { console.error(`No URLs in ${URLS_FILE}`); process.exit(1); }
mkdirSync(SHOTS, { recursive: true });

const hostOf = (u) => {
  try { return new URL(u).hostname.replace(/^www\./, ""); }
  catch { return u.replace(/[^a-z0-9]+/gi, "-"); }
};

/** Per-dimension sub-scores (0-100) + weighted global. Credits real material only. */
function dimScores(r) {
  const fallback = r.confidence === "fallback" || r.confidence === "error";
  const logo = r.logo ? 100 : 0;
  const color = r.accent ? 100 : 0;
  const images = Math.round((Math.min(r.imagesOk, 5) / 5) * 100);
  const text = fallback ? 0 : Math.min(100, Math.round((r.contentChars / 200) * 100));
  const structure = Math.min(100, Math.round((r.realSections / 6) * 100));
  const global = Math.round(text * 0.3 + images * 0.25 + structure * 0.2 + color * 0.15 + logo * 0.1);
  return { logo, color, images, text, structure, global };
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
    services: 0, realSections: 0, blocks: 0, notice: false, shot: "",
    s: { logo: 0, color: 0, images: 0, text: 0, structure: 0, global: 0 },
  };
  process.stdout.write(`[${i + 1}/${urls.length}] ${host} ... `);

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
    row.realSections = a.structure?.sections?.length || 0; // real structure only
    const images = (ec.images || []).slice(0, 6);
    row.imagesTotal = images.length;

    await page.getByRole("button", { name: /transform my site/i }).first().click();
    await page.waitForURL(/\/result/, { timeout: 30000 });
    await page.waitForFunction(() => !!sessionStorage.getItem("sr:schema"), { timeout: 30000 });
    const schema = await page.evaluate(() => JSON.parse(sessionStorage.getItem("sr:schema")));
    row.blocks = schema.blocks.length;

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
  } catch (e) {
    console.log(`ERROR ${String(e).slice(0, 50)}`);
  } finally {
    await ctx.close();
  }
  row.s = dimScores(row);
  if (row.shot || row.confidence !== "error") {
    console.log(`global ${row.s.global} | ${row.confidence} ${row.sector} | logo ${row.s.logo} color ${row.s.color} img ${row.s.images} text ${row.s.text} struct ${row.s.structure}`);
  }
  rows.push(row);
}
await browser.close();

// --- results.csv ----------------------------------------------------------
const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
const head = "n,url,sector,confidence,global,logo_score,color_score,images_score,text_score,structure_score,logo_url,brand_color,images_loaded,images_total,content_chars,real_sections,blocks,notice";
const csv = [head].concat(
  rows.map((r) => [
    r.n, q(r.url), r.sector, r.confidence, r.s.global,
    r.s.logo, r.s.color, r.s.images, r.s.text, r.s.structure,
    q(r.logo), r.accent, r.imagesOk, r.imagesTotal, r.contentChars, r.realSections, r.blocks, r.notice,
  ].join(","))
).join("\n");
writeFileSync(path.join(OUT, "results.csv"), csv);

// --- summary + verdict -----------------------------------------------------
const n = rows.length;
const avg = (k) => Math.round(rows.reduce((a, r) => a + r.s[k], 0) / n);
const avgGlobal = avg("global");
const pctOver60 = Math.round((rows.filter((r) => r.s.global > 60).length / n) * 100);
const fallbacks = rows.filter((r) => r.confidence === "fallback" || r.confidence === "error").length;
const fbRate = fallbacks / n;
const verdict =
  fbRate > 0.4 || avgGlobal < 50
    ? "REJECTED — rethink the workflow (too little extracted / too many fallbacks, even headless)"
    : avgGlobal >= 70 && pctOver60 >= 70
      ? "VALIDATED — URL -> auto-rebuild holds"
      : "MIXED — viable with a hybrid (user-completed) workflow";

const dims = ["logo", "color", "images", "text", "structure"];

// --- index.html (contact sheet) -------------------------------------------
const sc = (s) => (s >= 70 ? "#16a34a" : s >= 40 ? "#d97706" : "#dc2626");
const bar = (label, v) => `<span class="dim"><span class="dl">${label}</span><span class="db"><span class="df" style="width:${v}%;background:${sc(v)}"></span></span><span class="dv">${v}</span></span>`;
const cards = rows.map((r) => `<div class="card">
  <div class="meta">
    <span class="score" style="background:${sc(r.s.global)}">${r.s.global}</span>
    <b>${r.host}</b><span class="tag">${r.confidence}</span><span class="tag">${r.sector || "?"}</span>
    ${r.accent ? `<span class="tag"><span class="sw" style="background:${r.accent}"></span>${r.accent}</span>` : ""}
  </div>
  <div class="dims">${dims.map((d) => bar(d, r.s[d])).join("")}</div>
  ${r.shot ? `<a href="${r.shot}" target="_blank"><img loading="lazy" src="${r.shot}"/></a>` : `<div class="fail">no render</div>`}
</div>`).join("\n");
writeFileSync(path.join(OUT, "index.html"), `<!doctype html><meta charset="utf-8"><title>ReFrame extraction eval</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;margin:0;background:#0b0b0f;color:#e7e7ea;padding:24px}
  h1{font-size:18px;margin:0 0 6px}
  .verdict{font-weight:700;margin:0 0 6px} .sum{color:#a1a1aa;margin-bottom:18px;font-size:14px}
  .grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(360px,1fr))}
  .card{border:1px solid #26262b;border-radius:12px;overflow:hidden;background:#141418}
  .meta{display:flex;align-items:center;gap:7px;padding:10px 12px;font-size:12px;flex-wrap:wrap}
  .score{font-weight:700;color:#fff;border-radius:7px;padding:2px 9px;font-size:14px}
  .tag{color:#a1a1aa;border:1px solid #2c2c33;border-radius:9px;padding:1px 7px;display:inline-flex;align-items:center;gap:5px}
  .sw{width:9px;height:9px;border-radius:3px;display:inline-block}
  .dims{display:flex;gap:10px;padding:0 12px 10px;flex-wrap:wrap}
  .dim{display:flex;align-items:center;gap:5px;font-size:11px;color:#a1a1aa}
  .db{width:46px;height:6px;border-radius:6px;background:#2c2c33;overflow:hidden} .df{display:block;height:100%}
  img{width:100%;display:block;border-top:1px solid #26262b}
  .fail{padding:40px;text-align:center;color:#dc2626;border-top:1px solid #26262b}
</style>
<h1>ReFrame extraction eval — ${n} sites</h1>
<div class="verdict" style="color:${sc(avgGlobal)}">${verdict}</div>
<div class="sum">avg global ${avgGlobal}/100 · ${pctOver60}% > 60 · fallbacks ${fallbacks}/${n} &nbsp;|&nbsp; avg by dimension — ${dims.map((d) => `${d} ${avg(d)}`).join(" · ")}</div>
<div class="grid">${cards}</div>`);

console.log("\n========================================================");
console.log(`AVG GLOBAL ${avgGlobal}/100  ·  ${pctOver60}% > 60  ·  fallbacks ${fallbacks}/${n}`);
console.log(`avg by dimension — ${dims.map((d) => `${d} ${avg(d)}`).join("  ")}`);
console.log(`VERDICT: ${verdict}`);
console.log("========================================================");
console.log(`Open ${path.join(OUT, "index.html")}  ·  ${path.join(OUT, "results.csv")}`);
