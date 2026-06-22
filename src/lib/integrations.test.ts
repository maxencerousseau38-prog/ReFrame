import { describe, it, expect } from "vitest";
import { isConnectable, isValidIntegrationValue, buildIntegrationTags } from "./integrations";

describe("integration reconnection", () => {
  it("knows which detected tools are reconnectable from an ID", () => {
    expect(isConnectable("ga4")).toBe(true);
    expect(isConnectable("calendly")).toBe(true);
    expect(isConnectable("stripe")).toBe(false); // payments need manual reconnect
  });

  it("validates IDs strictly (rejects junk / injection attempts)", () => {
    expect(isValidIntegrationValue("ga4", "G-ABCD1234")).toBe(true);
    expect(isValidIntegrationValue("ga4", "G-<script>")).toBe(false);
    expect(isValidIntegrationValue("gtm", "GTM-ABC123")).toBe(true);
    expect(isValidIntegrationValue("metapixel", "123456789")).toBe(true);
    expect(isValidIntegrationValue("metapixel", "12'};alert(1)//")).toBe(false);
    expect(isValidIntegrationValue("calendly", "https://calendly.com/me/intro")).toBe(true);
    expect(isValidIntegrationValue("calendly", "https://evil.com/x")).toBe(false);
    expect(isValidIntegrationValue("calendly", "javascript:alert(1)")).toBe(false);
  });

  it("builds real vendor tags only for valid entries", () => {
    const tags = buildIntegrationTags([
      { id: "ga4", value: "G-ABCD1234" },
      { id: "metapixel", value: "BAD" }, // invalid -> dropped
      { id: "stripe", value: "whatever" }, // not connectable -> dropped
    ]);
    expect(tags.some((t) => t.kind === "src" && t.content.includes("gtag/js?id=G-ABCD1234"))).toBe(true);
    expect(tags.some((t) => t.content.includes("fbq"))).toBe(false);
  });

  it("never emits an unvalidated value into a snippet", () => {
    const tags = buildIntegrationTags([{ id: "ga4", value: "G-ABCD1234" }]);
    expect(tags.every((t) => !/<script>|alert\(/.test(t.content))).toBe(true);
  });
});
