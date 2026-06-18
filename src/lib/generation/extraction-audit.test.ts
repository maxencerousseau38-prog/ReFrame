import { writeFileSync } from "fs";
import { describe, it, expect } from "vitest";
import { analyzeUrl } from "./engine";
import { INDUSTRY_PROFILES } from "./industries";
import type { SiteAnalysis } from "./types";

/**
 * Extraction validation harness (Product Master Directive — Priority #1).
 *
 * Scores how well we extract the SUBSTANCE of a real site across five
 * dimensions, with the hard rule that fallback/template content earns ZERO —
 * we never reward content we invented. Run it explicitly (it hits the network):
 *
 *   AUDIT=1 npx vitest run src/lib/generation/extraction-audit.test.ts
 *   AUDIT=1 AUDIT_URLS="https://a.com,https://b.com" npx vitest run src/lib/generation/extraction-audit.test.ts
 *
 * Decision (per the directive):
 *   VALIDATED  avg >= 70 AND >= 70% of sites score > 60
 *   REJECTED   avg < 50 OR more than half fall back
 *   MIXED      anything in between
 */

const DEFAULT_SITES = [
  "https://basecamp.com",
  "https://stripe.com",
  "https://linear.app",
  "https://www.notion.so",
  "https://www.squarespace.com",
  "https://www.shopify.com",
  "https://www.allbirds.com",
  "https://www.warbyparker.com",
  "https://www.dishoom.com",
  "https://www.sweetgreen.com",
  "https://www.compass.com",
  "https://www.toptal.com",
  "https://www.figma.com",
  "https://vercel.com",
];

const SITES =
  process.env.AUDIT_URLS?.split(",").map((s) => s.trim()).filter(Boolean) ?? DEFAULT_SITES;

type Dim = "logo" | "images" | "text" | "structure" | "color";
interface Scored {
  url: string;
  fetched: boolean;
  confidence: string;
  logo: number;
  images: number;
  text: number;
  structure: number;
  color: number;
  avg: number;
}

function scoreAnalysis(url: string, a: SiteAnalysis | null): Scored {
  const zero = { logo: 0, images: 0, text: 0, structure: 0, color: 0 };
  // A failed read or a template fallback earns nothing — invented content is 0.
  if (!a || !a.fetched || a.confidence === "fallback") {
    return { url, fetched: a?.fetched ?? false, confidence: a?.confidence ?? "error", ...zero, avg: 0 };
  }
  const p = INDUSTRY_PROFILES[a.industry];
  const c = a.extractedContent;

  const logo = a.brand?.logoUrl ? 100 : 0;
  const color = a.brand?.accentColor ? 100 : 0;
  const images = Math.min(100, c.images.length * 25); // 4+ real images => 100

  let text = 0;
  if (c.headline && c.headline !== p.defaults.headline) text += 40;
  if (c.description && c.description !== p.defaults.description) text += 35;
  if (a.navItems.length >= 3) text += 25; // services come from the real nav, not defaults
  text = Math.min(100, text);

  const sections = a.structure?.sections.length ?? 0;
  const structure = Math.min(100, Math.max(0, (sections - 1) * 22)); // ~5 sections => 88-100

  const avg = Math.round((logo + images + text + structure + color) / 5);
  return { url, fetched: a.fetched, confidence: a.confidence ?? "full", logo, images, text, structure, color, avg };
}

const mean = (xs: number[]) => (xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : 0);

describe.runIf(process.env.AUDIT)("extraction audit", () => {
  it(
    "scores extraction on real sites and prints a verdict",
    async () => {
      const rows: Scored[] = [];
      for (const url of SITES) {
        let a: SiteAnalysis | null = null;
        try {
          a = await analyzeUrl(url);
        } catch {
          a = null;
        }
        rows.push(scoreAnalysis(url, a));
      }

      const dim = (k: Dim) => mean(rows.map((r) => r[k]));
      const overall = mean(rows.map((r) => r.avg));
      const pctAbove60 = rows.filter((r) => r.avg > 60).length / rows.length;
      const fallbackRate = rows.filter((r) => r.confidence === "fallback" || !r.fetched).length / rows.length;
      const decision =
        overall >= 70 && pctAbove60 >= 0.7 ? "VALIDATED" : overall < 50 || fallbackRate > 0.5 ? "REJECTED" : "MIXED";

      const pad = (s: string, n: number) => s.padEnd(n).slice(0, n);
      const num = (n: number) => String(n).padStart(3);
      const lines: string[] = [];
      lines.push("");
      lines.push("================ EXTRACTION AUDIT ================");
      lines.push(`${pad("site", 34)} logo  img text strc colr | avg  conf`);
      lines.push("-".repeat(72));
      for (const r of rows) {
        const host = r.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
        lines.push(
          `${pad(host, 34)} ${num(r.logo)}  ${num(r.images)} ${num(r.text)} ${num(r.structure)} ${num(r.color)} | ${num(r.avg)}  ${r.confidence}`
        );
      }
      lines.push("-".repeat(72));
      lines.push(
        `AVG  logo ${dim("logo")}  images ${dim("images")}  text ${dim("text")}  structure ${dim("structure")}  color ${dim("color")}`
      );
      lines.push(
        `OVERALL avg=${overall}   sites>60=${Math.round(pctAbove60 * 100)}%   fallback=${Math.round(fallbackRate * 100)}%`
      );
      lines.push(`DECISION: ${decision}`);
      lines.push("==================================================");
      const report = lines.join("\n");
      // vitest buffers console; write a durable artifact we can always read.
      writeFileSync(process.env.AUDIT_OUT || "/tmp/extraction-audit.txt", report + "\n");
      // eslint-disable-next-line no-console
      console.log(report);

      expect(rows.length).toBe(SITES.length);
    },
    900_000
  );
});
