import { describe, it, expect } from "vitest";
import { captureSite, parseFontFaces, mergeFonts } from "./capture";
import type { CapturedStylesheet, FontFaceRecord } from "./types";

const allowAll = async () => {};

function mockFetch(files: Record<string, string>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = files[url];
    if (body === "!throw") throw new Error("network");
    if (body === undefined) return new Response("nope", { status: 404 });
    return new Response(body, { status: 200 });
  }) as typeof fetch;
}

/* -------------------------------------------------------------------------- */
/*  captureSite (hermetic: Vitest guard forces Tier 1)                        */
/* -------------------------------------------------------------------------- */

describe("captureSite", () => {
  it("auto tier degrades to static under the hermetic guard, traced in notes", async () => {
    const site = await captureSite("https://example.com", {
      fetchImpl: mockFetch({
        "https://example.com": `<html><head><link rel="stylesheet" href="/a.css"></head><body>ok</body></html>`,
        "https://example.com/a.css": ":root{--x:1}",
      }),
      cssGuard: allowAll,
      capturedAt: "2026-07-03T00:00:00.000Z",
    });

    expect(site.quality.tier).toBe("static");
    expect(site.quality.html).toBe("static");
    expect(site.quality.notes.some((n) => n.includes("static tier"))).toBe(true);
    expect(site.quality.css).toBe("full");
    expect(site.quality.cssFetched).toBe(1);
    expect(site.viewports).toEqual([]); // Tier 1: no rendered artifacts
    expect(site.quality.computedSnapshot).toBe(false);
    expect(site.quality.screenshots).toEqual([]);
    expect(site.capturedAt).toBe("2026-07-03T00:00:00.000Z");
  });

  it("never throws: unreachable site → explicit 'none' states", async () => {
    const site = await captureSite("https://down.example", {
      fetchImpl: mockFetch({ "https://down.example": "!throw" }),
      cssGuard: allowAll,
    });

    expect(site.quality.html).toBe("none");
    expect(site.quality.css).toBe("none");
    expect(site.quality.fonts).toBe("none");
    expect(site.quality.notes.some((n) => n.includes("no HTML"))).toBe(true);
  });

  it("flags challenge pages instead of silently keeping them", async () => {
    const site = await captureSite("https://blocked.example", {
      fetchImpl: mockFetch({
        "https://blocked.example":
          "<html><head><title>Just a moment...</title></head><body>Checking your browser before accessing</body></html>",
      }),
      cssGuard: allowAll,
    });
    expect(site.quality.challenge).toBe(true);
  });

  it("reports css 'partial' when some stylesheets fail", async () => {
    const site = await captureSite("https://example.com", {
      fetchImpl: mockFetch({
        "https://example.com": `<html><head>
          <link rel="stylesheet" href="/ok.css">
          <link rel="stylesheet" href="/missing.css">
        </head><body>x</body></html>`,
        "https://example.com/ok.css": ".ok{}",
      }),
      cssGuard: allowAll,
    });

    expect(site.quality.css).toBe("partial");
    expect(site.quality.cssFailed).toEqual(["https://example.com/missing.css"]);
  });

  it("collects declared @font-face fonts even in Tier 1", async () => {
    const site = await captureSite("https://example.com", {
      fetchImpl: mockFetch({
        "https://example.com": `<html><head><link rel="stylesheet" href="/f.css"></head><body>x</body></html>`,
        "https://example.com/f.css": `@font-face{font-family:"Brand Serif";font-weight:600;src:url(/fonts/b.woff2) format("woff2");}`,
      }),
      cssGuard: allowAll,
    });

    expect(site.quality.fonts).toBe("collected");
    expect(site.fonts).toEqual([
      {
        family: "Brand Serif",
        weight: "600",
        style: "normal",
        src: "https://example.com/fonts/b.woff2",
        status: "declared",
      },
    ]);
  });
});

/* -------------------------------------------------------------------------- */
/*  parseFontFaces / mergeFonts                                               */
/* -------------------------------------------------------------------------- */

function sheet(content: string, url: string | null = "https://example.com/s.css"): CapturedStylesheet {
  return { url, media: null, content, bytes: content.length, via: url ? "link" : "inline", depth: 0 };
}

describe("parseFontFaces", () => {
  it("prefers woff2, resolves relative to the stylesheet URL, dedupes", () => {
    const fonts = parseFontFaces(
      [
        sheet(`
          @font-face { font-family: 'Inter Display'; font-weight: 100 900; font-style: normal;
            src: url("../fonts/inter.woff") format("woff"), url("../fonts/inter.woff2") format("woff2"); }
          @font-face { font-family: 'Inter Display'; font-weight: 100 900;
            src: url("../fonts/inter.woff2"); }
        `, "https://cdn.example.com/css/app.css"),
      ],
      "https://example.com"
    );

    expect(fonts).toHaveLength(1);
    expect(fonts[0]).toMatchObject({
      family: "Inter Display",
      weight: "100 900",
      src: "https://cdn.example.com/fonts/inter.woff2",
      status: "declared",
    });
  });

  it("keeps src null for local()-only faces", () => {
    const fonts = parseFontFaces(
      [sheet(`@font-face { font-family: SysFont; src: local("Arial"); }`)],
      "https://example.com"
    );
    expect(fonts[0]).toMatchObject({ family: "SysFont", src: null });
  });
});

describe("mergeFonts", () => {
  const loaded: FontFaceRecord[] = [
    { family: "Inter", weight: "400", style: "normal", src: null, status: "loaded" },
  ];
  const declared: FontFaceRecord[] = [
    { family: "Inter", weight: "400", style: "normal", src: "https://x/i.woff2", status: "declared" },
    { family: "Playfair", weight: "700", style: "normal", src: "https://x/p.woff2", status: "declared" },
  ];

  it("enriches loaded records with declared src and appends declared-only faces", () => {
    const merged = mergeFonts(loaded, declared);
    expect(merged).toHaveLength(2);
    expect(merged[0]).toMatchObject({ family: "Inter", status: "loaded", src: "https://x/i.woff2" });
    expect(merged[1]).toMatchObject({ family: "Playfair", status: "declared" });
  });

  it("F12: never borrows the src of ANOTHER weight of the same family", () => {
    const merged = mergeFonts(loaded, [
      { family: "Inter", weight: "700", style: "normal", src: "https://x/i-bold.woff2", status: "declared" },
    ]);
    expect(merged.find((f) => f.status === "loaded")?.src).toBeNull();
  });

  it("F12: a variable-font weight range covers the loaded weight", () => {
    const merged = mergeFonts(loaded, [
      { family: "Inter", weight: "100 900", style: "normal", src: "https://x/i-var.woff2", status: "declared" },
    ]);
    expect(merged.find((f) => f.status === "loaded")?.src).toBe("https://x/i-var.woff2");
  });
});
