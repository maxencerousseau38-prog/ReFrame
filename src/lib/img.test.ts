import { describe, it, expect } from "vitest";
import { toProxiedUrl } from "./img";

describe("toProxiedUrl", () => {
  it("proxies external http(s) urls", () => {
    const u = "https://x.com/a.jpg";
    expect(toProxiedUrl(u)).toBe(`/api/img?u=${encodeURIComponent(u)}`);
    expect(toProxiedUrl("http://x.com/a.png")).toContain("/api/img?u=");
  });

  it("encodes the url so query params survive intact", () => {
    const u = "https://x.com/a.jpg?w=1200&q=80";
    expect(toProxiedUrl(u)).toBe(`/api/img?u=${encodeURIComponent(u)}`);
    // round-trips back to the original
    const back = decodeURIComponent(toProxiedUrl(u).split("u=")[1]);
    expect(back).toBe(u);
  });

  it("passes data URIs, relative paths and anchors through untouched", () => {
    expect(toProxiedUrl("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
    expect(toProxiedUrl("/local.png")).toBe("/local.png");
    expect(toProxiedUrl("#frag")).toBe("#frag");
  });

  it("returns empty string for empty/nullish input", () => {
    expect(toProxiedUrl(undefined)).toBe("");
    expect(toProxiedUrl(null)).toBe("");
    expect(toProxiedUrl("")).toBe("");
  });
});
