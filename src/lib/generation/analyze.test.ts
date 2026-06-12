import { describe, it, expect } from "vitest";
import { analyzeUrl, looksLikeChallenge } from "./engine";

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
