/**
 * Evaluation harness for ReFrame's core promise.
 *
 * Drives the real pipeline (dashboard -> analyze -> generate -> result) for a
 * list of URLs and reports, per site:
 *   - analysis confidence (full | partial | fallback) and detected industry,
 *   - how many sections were preserved and which variants they rendered,
 *   - how many extracted images actually load through the proxy,
 *   - a full-page screenshot of the rebuilt site.
 *
 * Outputs to ./eval : screenshots/, results.csv, and index.html (a contact
 * sheet you open in a browser to judge quality at a glance).
 *
 * Usage:
 *   # start the app first (npm run start / dev), then:
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
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

if (!urls.length) {
  console.error(`No URLs in ${URLS_FILE}`);
  process.exit(1);
}

mkdirSync(SHOTS, { recursive: true });

const hostOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u.replace(/[^a-z0-9]+/gi, "-");
  }
};

const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });

const rows = [];

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const host = hostOf(url);
  const slug = `${String(i + 1).padStart(2, "0")}-${host.replace(/[^a-z0-9]+/gi, "-")}`;
  const shot = path.join("screenshots", `${slug}.png`);
  const row = {
    n: i + 1, url, host, status: "error", industry: "", brand: "",
    sections: 0, variants: "", imagesOk: 0, imagesTotal: 0, notice: false, shot: "",
  };
  process.stdout.write(`[${i + 1}/${urls.length}] ${host} ... `);

  // Fresh context per URL so sessionStorage (sr:analysis / sr:schema) never
  // leaks from the previous site into this one.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.1 });
  const page = await ctx.newPage();
  try {
    // 1. Analyze (auto-runs from ?url=)
    await page.goto(`${BASE}/dashboard?url=${encodeURIComponent(url)}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      () => !!sessionStorage.getItem("sr:analysis") || !!document.querySelector(".text-red-300"),
      { timeout: 45000 }
    );
    const analysis = await page.evaluate(() => {
      const r = sessionStorage.getItem("sr:analysis");
      return r ? JSON.parse(r) : null;
    });
    if (!analysis) throw new Error("analysis failed");

    row.status = analysis.confidence || (analysis.fetched ? "full" : "fallback");
    row.industry = analysis.industry || "";
    row.brand = analysis.brandName || "";
    row.notice = !!analysis.notice;
    const images = (analysis.extractedContent?.images || []).slice(0, 5);
    row.imagesTotal = images.length;

    // 2. Generate (Preserve, the default)
    await page.getByRole("button", { name: /transform my site/i }).first().click();
    await page.waitForURL(/\/result/, { timeout: 30000 });
    await page.waitForFunction(() => !!sessionStorage.getItem("sr:schema"), { timeout: 30000 });
    const schema = await page.evaluate(() => JSON.parse(sessionStorage.getItem("sr:schema")));
    row.sections = schema.blocks.length;
    row.variants = schema.blocks.map((b) => b.variant).join(" ");

    // 3. How many extracted images actually load through the proxy
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

    // 4. Screenshot the full rebuilt page (lift the preview clamp first)
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const sc = document.querySelector(".max-h-\\[70vh\\]");
      if (sc) {
        sc.classList.remove("max-h-[70vh]", "overflow-y-auto");
        sc.style.maxHeight = "none";
        sc.style.overflow = "visible";
      }
    });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 350) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true });
    row.shot = shot;
    console.log(`${row.status} | ${row.industry} | ${row.sections} sections | img ${row.imagesOk}/${row.imagesTotal}`);
  } catch (e) {
    console.log(`ERROR ${String(e).slice(0, 60)}`);
  } finally {
    await ctx.close();
  }
  rows.push(row);
}

await browser.close();

// --- results.csv ----------------------------------------------------------
const csvHead = "n,url,host,status,industry,brand,sections,imagesOk,imagesTotal,notice,variants";
const csv = [csvHead]
  .concat(
    rows.map((r) =>
      [r.n, r.url, r.host, r.status, r.industry, JSON.stringify(r.brand), r.sections, r.imagesOk, r.imagesTotal, r.notice, JSON.stringify(r.variants)].join(",")
    )
  )
  .join("\n");
writeFileSync(path.join(OUT, "results.csv"), csv);

// --- index.html (contact sheet) -------------------------------------------
const badge = (s) =>
  ({ full: "#16a34a", partial: "#d97706", fallback: "#dc2626", error: "#6b7280" }[s] || "#6b7280");
const cards = rows
  .map(
    (r) => `<div class="card">
    <div class="meta">
      <span class="dot" style="background:${badge(r.status)}"></span>
      <b>${r.host}</b>
      <span class="tag">${r.status}</span>
      <span class="tag">${r.industry}</span>
      <span class="tag">${r.sections} sec</span>
      <span class="tag">img ${r.imagesOk}/${r.imagesTotal}</span>
    </div>
    ${r.shot ? `<a href="${r.shot}" target="_blank"><img loading="lazy" src="${r.shot}"/></a>` : `<div class="fail">no render</div>`}
  </div>`
  )
  .join("\n");
const counts = rows.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
const summary = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(" · ");
writeFileSync(
  path.join(OUT, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>ReFrame eval</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;margin:0;background:#0b0b0f;color:#e7e7ea;padding:24px}
  h1{font-size:18px} .sum{color:#a1a1aa;margin-bottom:20px}
  .grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}
  .card{border:1px solid #26262b;border-radius:12px;overflow:hidden;background:#141418}
  .meta{display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:13px;flex-wrap:wrap}
  .dot{width:9px;height:9px;border-radius:9px}
  .tag{font-size:11px;color:#a1a1aa;border:1px solid #2c2c33;border-radius:9px;padding:1px 7px}
  img{width:100%;display:block;border-top:1px solid #26262b}
  .fail{padding:40px;text-align:center;color:#dc2626;border-top:1px solid #26262b}
</style>
<h1>ReFrame evaluation — ${rows.length} sites</h1>
<div class="sum">${summary}</div>
<div class="grid">${cards}</div>`
);

console.log(`\nDone. ${summary}`);
console.log(`Open ${path.join(OUT, "index.html")}  ·  ${path.join(OUT, "results.csv")}`);
