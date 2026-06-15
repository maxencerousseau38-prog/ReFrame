import { describe, it, expect } from "vitest";
import {
  isApexDomain,
  recommendedRecords,
  isVercelDomainsConfigured,
} from "./vercel-domains";

describe("isApexDomain", () => {
  it("treats two-label domains as apex", () => {
    expect(isApexDomain("acme.com")).toBe(true);
  });
  it("treats www / sub as a subdomain", () => {
    expect(isApexDomain("www.acme.com")).toBe(false);
    expect(isApexDomain("shop.acme.com")).toBe(false);
  });
});

describe("recommendedRecords", () => {
  it("points an apex domain at Vercel's A record", () => {
    const recs = recommendedRecords("acme.com");
    expect(recs).toHaveLength(1);
    expect(recs[0]).toMatchObject({ type: "A", name: "@", value: "76.76.21.21" });
  });

  it("points a subdomain at Vercel's CNAME target, scoped to its host", () => {
    const recs = recommendedRecords("www.acme.com");
    expect(recs).toHaveLength(1);
    expect(recs[0]).toMatchObject({ type: "CNAME", name: "www", value: "cname.vercel-dns.com" });
  });

  it("surfaces Vercel ownership challenges before the pointing record", () => {
    const recs = recommendedRecords("www.acme.com", [
      { type: "TXT", domain: "_vercel.acme.com", value: "vc-domain-verify=abc", reason: "pending_domain_verification" },
    ]);
    expect(recs).toHaveLength(2);
    expect(recs[0]).toMatchObject({ type: "TXT", name: "_vercel.acme.com", value: "vc-domain-verify=abc" });
    expect(recs[0].reason).toBe("pending_domain_verification");
    // pointing record stays last
    expect(recs[recs.length - 1].type).toBe("CNAME");
  });

  it("ignores challenge entries of unknown type", () => {
    const recs = recommendedRecords("acme.com", [
      { type: "WEIRD", domain: "x", value: "y" },
    ]);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe("A");
  });
});

describe("isVercelDomainsConfigured", () => {
  it("is off by default (no Vercel creds in the test env)", () => {
    // The module reads VERCEL_* at import time, so with no creds set the app
    // safely falls back to the local DNS path instead of calling Vercel.
    expect(isVercelDomainsConfigured()).toBe(false);
  });
});
