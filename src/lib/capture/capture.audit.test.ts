/**
 * Integration audit — real Chromium against a local fixture site.
 *
 * Gated: only runs with AUDIT=1 (convention from server/browser.ts).
 *   AUDIT=1 npx vitest run src/lib/capture/capture.audit.test.ts
 *
 * Optional real-site demo (chantier exit criterion):
 *   AUDIT=1 AUDIT_URL=https://www.framer.com npx vitest run src/lib/capture/capture.audit.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { captureSite } from "./capture";

const AUDIT = Boolean(process.env.AUDIT);
const AUDIT_URL = process.env.AUDIT_URL;

const FIXTURE_DIR = join(__dirname, "__fixtures__", "mini-site");
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".svg": "image/svg+xml",
};

describe.skipIf(!AUDIT)("captureSite — Chromium integration (fixture)", () => {
  let server: Server;
  let base: string;

  beforeAll(async () => {
    server = createServer((req, res) => {
      const path = req.url === "/" ? "/index.html" : (req.url || "/index.html");
      try {
        const ext = path.slice(path.lastIndexOf("."));
        const body = readFileSync(join(FIXTURE_DIR, path.slice(1)));
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const addr = server.address();
    base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
  });

  afterAll(async () => {
    await new Promise<void>((r) => server.close(() => r()));
  });

  it("captures the fixture at three widths with CSS, tokens, fonts and geometry", async () => {
    // 127.0.0.1 is private: the CSS guard must be bypassed for the fixture only.
    const site = await captureSite(`${base}/`, { cssGuard: async () => {} });

    // Tier & HTML
    expect(site.quality.tier).toBe("rendered");
    expect(site.html).toContain("Menuiserie d'art");

    // CSS: styles.css (link) + deep.css (@import) + inline <style>
    const urls = site.stylesheets.filter((s) => s.url).map((s) => s.url!);
    expect(urls.some((u) => u.endsWith("styles.css"))).toBe(true);
    expect(urls.some((u) => u.endsWith("deep.css"))).toBe(true);
    expect(site.stylesheets.some((s) => s.via === "inline")).toBe(true);
    expect(site.quality.css).toBe("full");

    // Design tokens read verbatim
    expect(site.cssVariables["--brand"]).toBe("#b4552d");
    expect(site.cssVariables["--space-section"]).toBe("96px");

    // Fonts: declared @font-face collected (local() → src null acceptable)
    expect(site.fonts.some((f) => f.family === "Fixture Sans")).toBe(true);

    // Three viewports, each with screenshot + geometry
    expect(site.viewports.map((v) => v.viewport).sort((a, b) => a - b)).toEqual([390, 768, 1440]);
    for (const v of site.viewports) {
      expect(v.screenshot).not.toBeNull();
      expect(v.screenshot!.length).toBeGreaterThan(1000);
      expect(v.blocks.length).toBeGreaterThanOrEqual(3);
      expect(v.scrollHeight).toBeGreaterThan(0);
    }

    // F1: the real sections live under TWO full-page wrappers, one of them a
    // bare div — the geometric descent must surface them all the same.
    const blocks1440 = site.viewports.find((v) => v.viewport === 1440)!.blocks;
    const headings = blocks1440.map((b) => b.headingText).filter(Boolean);
    expect(headings.some((h) => h!.includes("Menuiserie"))).toBe(true);      // hero <section>
    expect(headings.some((h) => h!.includes("Réalisations"))).toBe(true);    // data-framer-name div
    expect(headings.some((h) => h!.includes("Contact"))).toBe(true);         // bare div — descent only
    // …and the page-covering wrappers themselves are NOT reported as blocks.
    const pageTall = blocks1440.filter((b) => b.rect.height >= site.viewports[0].scrollHeight * 0.85);
    expect(pageTall).toHaveLength(0);

    // F3: paths are unique within each list (blocks ∩ nodes MAY share a path —
    // that is the join key between geometry and styles of the same element).
    for (const v of site.viewports) {
      const blockPaths = v.blocks.map((b) => b.path);
      expect(new Set(blockPaths).size).toBe(blockPaths.length);
      const nodePaths = v.nodes.map((n) => n.path);
      expect(new Set(nodePaths).size).toBe(nodePaths.length);
    }
    expect(site.quality.screenshots).toHaveLength(3);
    expect(site.quality.geometry).toBe(true);
    expect(site.quality.computedSnapshot).toBe(true);

    // Node paths are stable across viewports (responsive diffing contract)
    const paths1440 = new Set(site.viewports.find((v) => v.viewport === 1440)!.blocks.map((b) => b.path));
    const paths390 = site.viewports.find((v) => v.viewport === 390)!.blocks.map((b) => b.path);
    expect(paths390.filter((p) => paths1440.has(p)).length).toBeGreaterThanOrEqual(3);

    // Computed grid reached the snapshot (hero 3fr/9fr → two resolved tracks)
    const hero1440 = site.viewports
      .find((v) => v.viewport === 1440)!
      .nodes.find((n) => n.styles.gridTemplateColumns && n.styles.gridTemplateColumns !== "none");
    expect(hero1440).toBeDefined();
    expect(hero1440!.styles.gridTemplateColumns!.split(" ")).toHaveLength(2);
  }, 60_000);
});

describe.skipIf(!AUDIT || !AUDIT_URL)("captureSite — real-site demo", () => {
  it(`captures ${AUDIT_URL}`, async () => {
    const site = await captureSite(AUDIT_URL!);

    // Human-readable summary FIRST so a failing criterion still shows the
    // full quality diagnosis in the test output.
    // eslint-disable-next-line no-console
    console.log("[capture demo]", AUDIT_URL, JSON.stringify({
      ...site.quality,
      cssVariableCount: Object.keys(site.cssVariables).length,
      fontCount: site.fonts.length,
      animationCount: site.animations.length,
      blockCounts: site.viewports.map((v) => `${v.viewport}px:${v.blocks.length}`),
      screenshotBytes: site.viewports.map((v) => v.screenshot?.length ?? 0),
    }, null, 2));

    // Exit criteria, tier-consistent (no invented success): HTML + CSS always;
    // rendered artifacts asserted when the environment lets Chromium reach the
    // target (some sandboxes kill browser TLS egress — quality must say so).
    expect(site.quality.html).not.toBe("none");
    expect(site.stylesheets.length).toBeGreaterThan(0);
    if (site.quality.tier === "rendered") {
      expect(site.quality.screenshots.length).toBeGreaterThanOrEqual(1);
      expect(site.quality.geometry).toBe(true);
      expect(site.quality.computedSnapshot).toBe(true);
    } else {
      // Truthful degradation: no rendered artifacts, and the downgrade is traced.
      expect(site.viewports).toEqual([]);
      expect(site.quality.notes.some((n) => n.includes("downgraded to static tier"))).toBe(true);
    }
  }, 120_000);
});
