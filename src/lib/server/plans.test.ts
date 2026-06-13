import { describe, it, expect } from "vitest";
import { PLANS, entitlementsOf, planOf, isPlan, isComped, effectivePlan } from "./plans";

describe("plan entitlements", () => {
  it("free cannot publish (publishing is a paid feature) and is branded", () => {
    const e = entitlementsOf("free");
    expect(e.maxPublishedSites).toBe(0);
    expect(e.removeBranding).toBe(false);
    expect(e.customDomain).toBe(false);
  });

  it("paid tiers can publish, unbranded, with a custom domain", () => {
    for (const p of ["pro", "studio"] as const) {
      const e = entitlementsOf(p);
      expect(e.removeBranding).toBe(true);
      expect(e.customDomain).toBe(true);
      expect(e.maxPublishedSites).toBeGreaterThanOrEqual(1);
    }
  });

  it("Pro is a single live site; Agency allows several", () => {
    expect(entitlementsOf("pro").maxPublishedSites).toBe(1);
    expect(entitlementsOf("studio").maxPublishedSites).toBeGreaterThan(1);
  });

  it("falls back to free for undefined or unknown plans", () => {
    expect(planOf(undefined).id).toBe("free");
    // a value that isn't a known plan
    expect(planOf("enterprise" as never).id).toBe("free");
    expect(entitlementsOf(undefined)).toEqual(PLANS.free.entitlements);
  });

  it("comps accounts listed in ADMIN_EMAILS to the top plan", () => {
    const prev = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = "founder@x.com, team@x.com";
    expect(isComped("founder@x.com")).toBe(true);
    expect(isComped("FOUNDER@X.COM")).toBe(true); // case-insensitive
    expect(isComped("someone@else.com")).toBe(false);
    expect(isComped(undefined)).toBe(false);
    expect(effectivePlan({ email: "founder@x.com", plan: "free" })).toBe("studio");
    expect(effectivePlan({ email: "someone@else.com", plan: "free" })).toBe("free");
    process.env.ADMIN_EMAILS = prev;
  });

  it("isPlan guards the tier strings", () => {
    expect(isPlan("pro")).toBe(true);
    expect(isPlan("free")).toBe(true);
    expect(isPlan("nope")).toBe(false);
    expect(isPlan(undefined)).toBe(false);
  });
});
