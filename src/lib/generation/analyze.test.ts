import { describe, it, expect } from "vitest";
import { analyzeUrl } from "./engine";

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
