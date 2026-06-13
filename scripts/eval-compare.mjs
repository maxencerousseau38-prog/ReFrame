/**
 * Compare two eval runs (static vs headless) and quantify the gain.
 *
 * Reads two results.csv produced by scripts/eval.mjs and prints, side by side:
 *   - overall avg global + verdict for each run (and whether headless flips it)
 *   - fallback count for each run
 *   - average per dimension (logo/color/images/text/structure) with the delta
 *   - per-site global delta, biggest improvements first, flagging sites that
 *     crossed the 60 threshold thanks to rendering.
 *
 * Usage:
 *   node scripts/eval-compare.mjs <static.csv> <headless.csv>
 * Defaults: eval-static/results.csv  eval/results.csv
 */
import { readFileSync } from "fs";

const A = process.argv[2] || "eval-static/results.csv";
const B = process.argv[3] || "eval/results.csv";

/** Minimal CSV line parser honouring double-quoted fields. */
function parseLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function load(file) {
  const lines = readFileSync(file, "utf8").trim().split("\n");
  const head = parseLine(lines[0]);
  const idx = (k) => head.indexOf(k);
  const rows = lines.slice(1).map((l) => {
    const f = parseLine(l);
    return {
      url: f[idx("url")],
      sector: f[idx("sector")],
      confidence: f[idx("confidence")],
      global: +f[idx("global")],
      logo: +f[idx("logo_score")],
      color: +f[idx("color_score")],
      images: +f[idx("images_score")],
      text: +f[idx("text_score")],
      structure: +f[idx("structure_score")],
    };
  });
  return rows;
}

const DIMS = ["logo", "color", "images", "text", "structure"];
const avg = (rows, k) => (rows.length ? Math.round(rows.reduce((a, r) => a + r[k], 0) / rows.length) : 0);
const fb = (rows) => rows.filter((r) => r.confidence === "fallback" || r.confidence === "error").length;
const pctOver60 = (rows) => Math.round((rows.filter((r) => r.global > 60).length / rows.length) * 100);
function verdict(rows) {
  const g = avg(rows, "global"), p = pctOver60(rows), f = fb(rows) / rows.length;
  if (f > 0.4 || g < 50) return "REJECTED";
  if (g >= 70 && p >= 70) return "VALIDATED";
  return "MIXED";
}

const a = load(A), b = load(B);
const bByUrl = new Map(b.map((r) => [r.url, r]));
const pad = (s, n) => String(s).padEnd(n);
const sgn = (d) => (d > 0 ? `+${d}` : `${d}`);

console.log(`\nSTATIC   ${A}   (${a.length} sites)`);
console.log(`HEADLESS ${B}   (${b.length} sites)\n`);

console.log(`AVG GLOBAL   static ${avg(a, "global")}  ->  headless ${avg(b, "global")}   (${sgn(avg(b, "global") - avg(a, "global"))})`);
console.log(`FALLBACKS    static ${fb(a)}/${a.length}  ->  headless ${fb(b)}/${b.length}`);
console.log(`VERDICT      static ${verdict(a)}  ->  headless ${verdict(b)}\n`);

console.log("BY DIMENSION   static -> headless (delta)");
for (const d of DIMS) console.log(`  ${pad(d, 10)} ${pad(avg(a, d), 4)} -> ${pad(avg(b, d), 4)} (${sgn(avg(b, d) - avg(a, d))})`);

console.log("\nPER SITE   global static -> headless   (biggest gains first)");
const deltas = a
  .map((ra) => {
    const rb = bByUrl.get(ra.url);
    return rb ? { url: ra.url, sa: ra.global, sb: rb.global, d: rb.global - ra.global, crossed: ra.global <= 60 && rb.global > 60 } : null;
  })
  .filter(Boolean)
  .sort((x, y) => y.d - x.d);
for (const r of deltas) {
  const host = r.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
  console.log(`  ${pad(host, 28)} ${pad(r.sa, 4)} -> ${pad(r.sb, 4)} (${sgn(r.d)})${r.crossed ? "  ✦ crossed 60" : ""}`);
}
const crossed = deltas.filter((r) => r.crossed).length;
console.log(`\n${crossed} site(s) crossed the 60 threshold thanks to headless rendering.`);
