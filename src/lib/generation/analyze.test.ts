import { describe, it, expect } from "vitest";
import { parse } from "node-html-parser";
import { analyzeUrl, looksLikeChallenge, needsRendering, extractImages } from "./engine";

describe("looksLikeChallenge", () => {
  it("flags common bot-protection / interstitial pages", () => {
    expect(looksLikeChallenge("<title>Just a moment...</title>")).toBe(true);
    expect(looksLikeChallenge("<title>One moment, please...</title>")).toBe(true);
    expect(looksLikeChallenge("<h1>Attention Required! | Cloudflare</h1>")).toBe(true);
    expect(looksLikeChallenge("<p>Please enable JS and cookies to continue</p>")).toBe(true);
    expect(looksLikeChallenge("<noscript>Please enable JavaScript to run this app</noscript>")).toBe(true);
  });

  it("passes normal pages through", () => {
    expect(looksLikeChallenge("<title>Gjelina - Restaurant</title><h1>Welcome</h1>")).toBe(false);
    expect(looksLikeChallenge("<h1>Acme Plumbing</h1><p>24/7 service</p>")).toBe(false);
  });
});

describe("needsRendering", () => {
  it("flags an unfilled SPA shell (real bytes, no real content)", () => {
    const shell =
      '<html><head><title>App</title></head><body><div id="root"></div>' +
      "<script src=a.js></script><script src=b.js></script><script src=c.js></script></body></html>";
    expect(needsRendering(shell)).toBe(true);
  });

  it("flags a Next.js shell with an empty mount", () => {
    const next =
      '<div id="__next"></div><script src=1></script><script src=2></script><script src=3></script>';
    expect(needsRendering(next)).toBe(true);
  });

  it("leaves a content-rich server-rendered page alone", () => {
    const rich =
      "<h1>Acme Plumbing</h1><h2>Services</h2><p>" +
      "We have served the Bristol area for over twenty years with emergency call-outs, ".repeat(8) +
      "</p><img src=a.jpg><img src=b.jpg><img src=c.jpg>";
    expect(needsRendering(rich)).toBe(false);
  });
});

describe("extractImages", () => {
  const base = "https://acme.com/";

  it("prefers the og:image and resolves relative URLs", () => {
    const root = parse(
      '<meta property="og:image" content="/hero.jpg"><img src="/a.jpg">'
    );
    const imgs = extractImages(root, base);
    expect(imgs[0]).toBe("https://acme.com/hero.jpg");
  });

  it("drops logos, icons, sprites, svg, data URIs and tiny images", () => {
    const root = parse(
      '<img src="/logo.png">' +
        '<img src="/icons/sprite.png">' +
        '<img src="/photo.svg">' +
        '<img src="data:image/png;base64,xxxx">' +
        '<img src="/tiny.jpg" width="40" height="40">' +
        '<img src="/real-photo.jpg">'
    );
    const imgs = extractImages(root, base);
    expect(imgs).toContain("https://acme.com/real-photo.jpg");
    expect(imgs.some((s) => /logo|sprite|\.svg|data:|tiny/.test(s))).toBe(false);
  });

  it("reads the largest srcset candidate and lazy-load attributes", () => {
    const root = parse(
      '<img srcset="/s-320.jpg 320w, /s-1280.jpg 1280w" src="/s-320.jpg">' +
        '<img data-src="/lazy.jpg">'
    );
    const imgs = extractImages(root, base);
    expect(imgs).toContain("https://acme.com/s-1280.jpg");
    expect(imgs).toContain("https://acme.com/lazy.jpg");
  });

  it("captures CSS background-image heroes", () => {
    const root = parse(
      '<div style="background-image:url(\'/bg-hero.jpg\')"></div>' +
        "<style>.hero{background: url(/css-hero.jpg) no-repeat}</style>"
    );
    const imgs = extractImages(root, base);
    expect(imgs).toContain("https://acme.com/bg-hero.jpg");
    expect(imgs).toContain("https://acme.com/css-hero.jpg");
  });
});

/**
 * analyzeUrl fetches the network; here we only exercise the offline fallback
 * path (a non-resolving host), which is deterministic and needs no network.
 * The richer extraction (JSON-LD, confidence on real HTML) is covered by the
 * pure helpers and the live API verification.
 */
describe("analyzeUrl fallback", () => {
  it("returns a fallback-confidence profile with an honest notice when unreachable", async () => {
    const a = await analyzeUrl("https://nonexistent-domain-xyz-12345.test");
    expect(a.confidence).toBe("fallback");
    expect(a.notice).toBeTruthy();
    expect(a.brandName.length).toBeGreaterThan(0);
    expect(a.extractedContent.services.length).toBeGreaterThan(0);
  });

  it("derives a brand name from the domain", async () => {
    const a = await analyzeUrl("https://acme-plumbing.test");
    expect(a.brandName.toLowerCase()).toContain("acme");
  });
});
