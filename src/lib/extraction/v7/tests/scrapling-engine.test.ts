import { describe, it, expect } from "vitest";
import { isChallengeHtml, needsDynamicFetch } from "@/lib/scraping/scrapling-engine";

describe("isChallengeHtml", () => {
  it("detects Cloudflare 'Just a moment' challenge", () => {
    const html = "<html><head><title>Just a moment...</title></head><body><p>Checking your browser</p></body></html>";
    expect(isChallengeHtml(html)).toBe(true);
  });

  it("detects Turnstile challenge", () => {
    const html = "<html><body><div class='cf-turnstile'></div><script>window._cf_chl_opt={}</script></body></html>";
    expect(isChallengeHtml(html)).toBe(true);
  });

  it("detects 403 status as blocked", () => {
    expect(isChallengeHtml("<html><body>Forbidden</body></html>", 403)).toBe(true);
  });

  it("detects 429 status as blocked", () => {
    expect(isChallengeHtml("<html><body>Rate limited</body></html>", 429)).toBe(true);
  });

  it("detects very short HTML as blocked", () => {
    expect(isChallengeHtml("<html><body></body></html>")).toBe(true);
  });

  it("does not flag real site HTML as challenge", () => {
    const html = `<html><head><title>Archform | Orthodontic Platform</title></head><body>
      <h1>Clear aligners designed to move faster</h1>
      <p>Archform is the orthodontic platform that combines clinical, business, and manufacturing into one.
      We help orthodontists deliver better care with a fully-integrated digital workflow. From case planning
      to aligner manufacturing, everything is in one place — making treatment faster, more predictable, and
      more profitable. Trusted by thousands of orthodontists worldwide.</p>
      <nav><a href="/about">About</a><a href="/pricing">Pricing</a><a href="/contact">Contact</a></nav>
      <section><h2>Why Archform</h2><p>Purpose-built for modern orthodontic practices.</p></section>
    </body></html>`;
    expect(isChallengeHtml(html, 200)).toBe(false);
  });

  it("does not flag 200 status rich HTML", () => {
    const html = "<html><body>" + "real content ".repeat(50) + "</body></html>";
    expect(isChallengeHtml(html, 200)).toBe(false);
  });
});

describe("needsDynamicFetch", () => {
  it("flags empty React SPA shell", () => {
    const html = `<html><body><div id="__next"></div></body></html>`;
    expect(needsDynamicFetch(html)).toBe(true);
  });

  it("flags very short HTML", () => {
    expect(needsDynamicFetch("<html><body><div></div></body></html>")).toBe(true);
  });

  it("flags Framer sites with little content", () => {
    const html = `<html data-framer-name="landing"><body><div data-framer-name="hero"></div></body></html>`;
    expect(needsDynamicFetch(html)).toBe(true);
  });

  it("does not flag a fully-rendered HTML page", () => {
    const html = "<html><body>" + "<p>content</p>".repeat(50) + "</body></html>";
    expect(needsDynamicFetch(html)).toBe(false);
  });
});
