/**
 * V2 CAPTURE — Tier 2: rendered acquisition through headless Chromium.
 *
 * One page load, then descending viewport resizes (1440 → 768 → 390): three
 * loads would triple latency and desynchronize JS state between widths. The
 * documented limit (JS-driven breakpoints on resize may differ from a real
 * mobile load) is accepted here; VERIFY (Chantier 10) reloads per viewport.
 *
 * Reuses the shared browser substrate (server/browser.ts#withPage) and the
 * settle/scroll patterns proven in server/render.ts. Never throws: returns
 * null when no browser is usable, and degrades artifact-by-artifact with
 * notes otherwise.
 *
 * Spec: docs/V2_CHANTIER1_CAPTURE_SPEC.md §5, §6.2–6.4
 */

import type { Page } from "playwright";
import { localBrowserReady, withPage } from "@/lib/server/browser";
import {
  collectSnapshot,
  COMPUTED_PROPS,
  SNAPSHOT_LIMITS,
  type SnapshotResult,
} from "./snapshot";
import type {
  CaptureViewport,
  CssAnimationRecord,
  FontFaceRecord,
  ViewportCapture,
} from "./types";
import { CAPTURE_VIEWPORTS } from "./types";

export interface RenderTierOptions {
  viewports?: readonly CaptureViewport[];
  screenshots?: boolean;
  /** Global Tier 2 budget. Default 30_000 ms. */
  timeoutMs?: number;
}

export interface RenderTierResult {
  /** Post-JS serialized DOM. */
  html: string;
  viewports: ViewportCapture[];
  /** From the first (widest) snapshot — viewport-independent artifacts. */
  cssVariables: Record<string, string>;
  fonts: FontFaceRecord[];
  animations: CssAnimationRecord[];
  /** Live-CSSOM sheets (F10), via:"runtime". */
  runtimeCss: { href: string | null; content: string }[];
  notes: string[];
}

const SCROLL_CAP_PX = 12_000;
const SNAPSHOT_TIMEOUT_MS = 5_000;
const SETTLE_MS = 400;

/** Scroll the whole page so lazy content mounts. Returns true when capped. */
async function fullScroll(page: Page): Promise<boolean> {
  const capped = await page
    .evaluate(async (cap: number) => {
      return await new Promise<boolean>((resolve) => {
        let y = 0;
        const step = () => {
          y += window.innerHeight;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight && y < cap) setTimeout(step, 120);
          else resolve(y >= cap && y < document.body.scrollHeight);
        };
        step();
      });
    }, SCROLL_CAP_PX)
    .catch(() => false);
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  return capped;
}

/** Light settle after a resize: top → one screen → top. */
async function resettle(page: Page): Promise<void> {
  await page.waitForTimeout(SETTLE_MS);
  await page
    .evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 150));
      window.scrollTo(0, window.innerHeight);
      await new Promise((r) => setTimeout(r, 150));
      window.scrollTo(0, 0);
    })
    .catch(() => {});
}

/** evaluate() has no built-in timeout — race it so a hostile page can't hang us. */
async function snapshotWithTimeout(page: Page): Promise<SnapshotResult | null> {
  const run = page
    .evaluate(collectSnapshot, {
      props: [...COMPUTED_PROPS],
      limits: SNAPSHOT_LIMITS,
    })
    .catch(() => null);
  const timeout = new Promise<null>((r) => setTimeout(() => r(null), SNAPSHOT_TIMEOUT_MS));
  return Promise.race([run, timeout]);
}

/**
 * Render-capture a URL at the requested widths.
 * Returns null only when no local browser is usable (caller falls back to
 * Tier 1 and traces it) — every other failure degrades with a note.
 */
export async function renderCapture(
  url: string,
  opts: RenderTierOptions = {}
): Promise<RenderTierResult | null> {
  const widths = [...(opts.viewports ?? CAPTURE_VIEWPORTS)].sort((a, b) => b - a);
  const wantShots = opts.screenshots ?? true;
  const timeoutMs = opts.timeoutMs ?? 30_000;

  // Same convention as server/render.ts: the readiness probe carries the
  // hermetic-test guard; withPage alone would launch a browser under Vitest.
  if (!(await localBrowserReady())) return null;

  return withPage(
    async (page) => {
      const notes: string[] = [];

      const ok = await page
        .goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 })
        .then(() => true)
        .catch(() => false);
      if (!ok) {
        // Distinct from "no browser": navigation itself failed. Returning an
        // empty result keeps the downgrade note truthful (no invented cause).
        return {
          html: "",
          viewports: [],
          cssVariables: {},
          fonts: [],
          animations: [],
          runtimeCss: [],
          notes: [`navigation failed: ${url}`],
        };
      }

      await page.waitForLoadState("networkidle", { timeout: 6_000 }).catch(() => {});

      // Mount lazy content before any measurement (pattern from server/render.ts).
      if (await fullScroll(page)) notes.push(`infinite scroll capped at ${SCROLL_CAP_PX}px`);

      // Let webfonts resolve so fontFamily/document.fonts are truthful.
      await page
        .evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]))
        .catch(() => {});

      const viewports: ViewportCapture[] = [];
      let cssVariables: Record<string, string> = {};
      let fonts: FontFaceRecord[] = [];
      let animations: CssAnimationRecord[] = [];
      let runtimeCss: { href: string | null; content: string }[] = [];

      for (let i = 0; i < widths.length; i++) {
        const width = widths[i];
        await page.setViewportSize({ width, height: 900 }).catch(() => {});
        await resettle(page);

        const snap = await snapshotWithTimeout(page);
        if (snap === null) notes.push(`computed snapshot failed at ${width}px`);
        if (i === 0 && snap) {
          cssVariables = snap.cssVariables;
          fonts = snap.fonts;
          animations = snap.animations;
          runtimeCss = snap.runtimeCss;
          if (snap.runtimeCssSkipped > 0) {
            notes.push(`${snap.runtimeCssSkipped} cross-origin CSSOM sheet(s) unreadable (fetched over HTTP instead)`);
          }
        }

        let screenshot: Buffer | null = null;
        if (wantShots) {
          if (snap && snap.scrollHeight > 20_000) {
            notes.push(`page height ${snap.scrollHeight}px at ${width}px; fullPage screenshot may be truncated by Chromium`);
          }
          screenshot = await page
            .screenshot({ fullPage: true, type: "jpeg", quality: 70 })
            .catch(() => null);
          if (!screenshot) notes.push(`screenshot failed at ${width}px`);
        }

        viewports.push({
          viewport: width as CaptureViewport,
          screenshot,
          nodes: snap?.nodes ?? [],
          blocks: snap?.blocks ?? [],
          scrollHeight: snap?.scrollHeight ?? 0,
        });
      }

      const html = await page.content().catch(() => "");
      if (!html) notes.push("post-JS HTML serialization failed");

      return { html, viewports, cssVariables, fonts, animations, runtimeCss, notes };
    },
    { timeoutMs, viewport: { width: widths[0], height: 900 } }
  );
}
