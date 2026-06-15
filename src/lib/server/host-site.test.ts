import { describe, it, expect } from "vitest";
import { classifyHost } from "./host-site";

const ROOT = "reframe.site";

describe("classifyHost", () => {
  it("treats our own origins as the app", () => {
    expect(classifyHost("reframe.site", ROOT).kind).toBe("app");
    expect(classifyHost("www.reframe.site", ROOT).kind).toBe("app");
    expect(classifyHost("localhost:3000", ROOT).kind).toBe("app");
    expect(classifyHost("my-app-abc123.vercel.app", ROOT).kind).toBe("app");
    expect(classifyHost("", ROOT).kind).toBe("app");
  });

  it("reads a branded subdomain as sub + slug", () => {
    expect(classifyHost("komorebi.reframe.site", ROOT)).toEqual({ kind: "sub", slug: "komorebi" });
    expect(classifyHost("komorebi.localhost:3000", ROOT)).toEqual({ kind: "sub", slug: "komorebi" });
  });

  it("treats anything else as a connected custom domain", () => {
    expect(classifyHost("www.acme.com", ROOT)).toEqual({ kind: "domain", host: "www.acme.com" });
    expect(classifyHost("acme.com", ROOT)).toEqual({ kind: "domain", host: "acme.com" });
  });

  it("is case-insensitive and ignores the port", () => {
    expect(classifyHost("Komorebi.ReFrame.site:443", ROOT)).toEqual({ kind: "sub", slug: "komorebi" });
  });
});
