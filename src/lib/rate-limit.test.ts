import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

// No KV env in tests, so this exercises the in-memory fallback window.
describe("rateLimit (in-memory fallback)", () => {
  it("allows up to max requests, then blocks with a retryAfter", async () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect((await rateLimit(key, 3, 60_000)).ok).toBe(true);
    }
    const blocked = await rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("opens a fresh window once the previous one expires", async () => {
    const key = `test-${Math.random()}`;
    expect((await rateLimit(key, 1, 1)).ok).toBe(true);
    await new Promise((r) => setTimeout(r, 5));
    expect((await rateLimit(key, 1, 1)).ok).toBe(true);
  });
});
