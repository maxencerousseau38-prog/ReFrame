import { describe, it, expect } from "vitest";
import { isRenderConfigured, renderHtml } from "./render";

// With no BROWSERLESS_URL in the test environment, the render service must
// degrade gracefully: report unconfigured and never throw.
describe("render service (unconfigured)", () => {
  it("reports not configured without BROWSERLESS_URL", () => {
    expect(isRenderConfigured()).toBe(false);
  });

  it("renderHtml returns null when unconfigured", async () => {
    await expect(renderHtml("https://example.com")).resolves.toBeNull();
  });
});
