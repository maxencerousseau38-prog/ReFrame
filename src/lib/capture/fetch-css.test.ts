import { describe, it, expect, beforeEach } from "vitest";
import { collectStylesheets, findImports, __clearCssCache } from "./fetch-css";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const BASE = "https://example.com/page/";

/** fetchImpl backed by a URL→body map. Missing URL → 404. "!throw" → network error. */
function mockFetch(files: Record<string, string>): {
  impl: typeof fetch;
  calls: string[];
} {
  const calls: string[] = [];
  const impl = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const body = files[url];
    if (body === "!throw") throw new Error("network");
    if (body === undefined) return new Response("nope", { status: 404 });
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/css" },
    });
  }) as typeof fetch;
  return { impl, calls };
}

const allowAll = async () => {};

function collect(
  html: string,
  files: Record<string, string>,
  opts: Parameters<typeof collectStylesheets>[2] = {}
) {
  const { impl, calls } = mockFetch(files);
  return collectStylesheets(html, BASE, {
    fetchImpl: impl,
    guard: allowAll,
    cache: false,
    ...opts,
  }).then((res) => ({ res, calls }));
}

beforeEach(() => __clearCssCache());

/* -------------------------------------------------------------------------- */
/*  findImports                                                               */
/* -------------------------------------------------------------------------- */

describe("findImports", () => {
  it("parses url(), quoted url() and string forms, resolving relative URLs", () => {
    const css = `
      @import url("a.css");
      @import url(b/deep.css) screen and (min-width: 768px);
      @import 'https://cdn.example.com/c.css';
    `;
    const imports = findImports(css, "https://example.com/styles/main.css");
    expect(imports).toEqual([
      { url: "https://example.com/styles/a.css", media: null },
      { url: "https://example.com/styles/b/deep.css", media: "screen and (min-width: 768px)" },
      { url: "https://cdn.example.com/c.css", media: null },
    ]);
  });

  it("ignores non-http schemes", () => {
    expect(findImports(`@import url(data:text/css,body{});`, BASE)).toEqual([]);
  });
});

describe("commented-out @import (F11)", () => {
  it("does not fetch an @import that only lives inside a CSS comment", async () => {
    const html = `<link rel="stylesheet" href="main.css">`;
    const { res, calls } = await collect(html, {
      "https://example.com/page/main.css": `/* @import url("ghost.css"); */ .real{}`,
    });
    expect(calls).not.toContain("https://example.com/page/ghost.css");
    expect(res.failed).toEqual([]);
    expect(res.partial).toBe(false);
    // stored content stays verbatim, comment included
    expect(res.stylesheets.find((s) => s.url)?.content).toContain("ghost.css");
  });
});

describe("LRU byte cap (F6)", () => {
  it("evicts oldest entries when the byte ceiling is exceeded", async () => {
    // Two captures with cache ON: a huge file then another; both fit the
    // 8 MB ceiling individually — sanity-check accounting via re-fetch.
    const bigA = "a".repeat(5 * 1024 * 1024);
    const bigB = "b".repeat(5 * 1024 * 1024);
    const htmlA = `<link rel="stylesheet" href="a.css">`;
    const htmlB = `<link rel="stylesheet" href="b.css">`;

    const first = mockFetch({ "https://example.com/page/a.css": bigA });
    await collectStylesheets(htmlA, BASE, {
      fetchImpl: first.impl, guard: allowAll, maxBytes: 6 * 1024 * 1024,
    });
    const second = mockFetch({ "https://example.com/page/b.css": bigB });
    await collectStylesheets(htmlB, BASE, {
      fetchImpl: second.impl, guard: allowAll, maxBytes: 6 * 1024 * 1024,
    });

    // a.css (oldest) must have been evicted to admit b.css → re-fetching A hits the network again.
    const third = mockFetch({ "https://example.com/page/a.css": bigA });
    await collectStylesheets(htmlA, BASE, {
      fetchImpl: third.impl, guard: allowAll, maxBytes: 6 * 1024 * 1024,
    });
    expect(third.calls).toContain("https://example.com/page/a.css");
  });
});

/* -------------------------------------------------------------------------- */
/*  collectStylesheets                                                        */
/* -------------------------------------------------------------------------- */

describe("collectStylesheets", () => {
  it("collects <link rel=stylesheet> (relative + absolute) and inline <style>", async () => {
    const html = `
      <html><head>
        <link rel="stylesheet" href="main.css">
        <link rel="preload stylesheet" href="https://cdn.example.com/lib.css" media="print">
        <link rel="icon" href="favicon.ico">
        <style>:root { --brand: #123456; }</style>
      </head><body></body></html>`;
    const { res } = await collect(html, {
      "https://example.com/page/main.css": "body { margin: 0 }",
      "https://cdn.example.com/lib.css": ".lib { color: red }",
    });

    expect(res.failed).toEqual([]);
    expect(res.partial).toBe(false);

    const inline = res.stylesheets.find((s) => s.via === "inline");
    expect(inline?.content).toContain("--brand: #123456");
    expect(inline?.url).toBeNull();

    const main = res.stylesheets.find((s) => s.url?.endsWith("main.css"));
    expect(main).toMatchObject({ via: "link", depth: 0, content: "body { margin: 0 }" });

    const lib = res.stylesheets.find((s) => s.url?.endsWith("lib.css"));
    expect(lib?.media).toBe("print");
  });

  it("follows @import chains up to depth 2 and stops beyond", async () => {
    const html = `<link rel="stylesheet" href="a.css">`;
    const { res, calls } = await collect(html, {
      "https://example.com/page/a.css": `@import url("b.css"); .a{}`,
      "https://example.com/page/b.css": `@import url("c.css"); .b{}`,
      "https://example.com/page/c.css": `@import url("d.css"); .c{}`,
      "https://example.com/page/d.css": `.d{}`,
    });

    const urls = res.stylesheets.filter((s) => s.url).map((s) => s.url!);
    expect(urls).toContain("https://example.com/page/a.css"); // depth 0
    expect(urls).toContain("https://example.com/page/b.css"); // depth 1
    expect(urls).toContain("https://example.com/page/c.css"); // depth 2
    expect(urls).not.toContain("https://example.com/page/d.css"); // depth 3 → capped
    expect(calls).not.toContain("https://example.com/page/d.css");
    expect(res.partial).toBe(true);
    expect(res.notes.some((n) => n.includes("depth cap"))).toBe(true);

    const b = res.stylesheets.find((s) => s.url?.endsWith("b.css"));
    expect(b).toMatchObject({ via: "import", depth: 1 });
  });

  it("collects @imports declared inside inline <style>", async () => {
    const html = `<style>@import url("from-inline.css"); body{}</style>`;
    const { res } = await collect(html, {
      "https://example.com/page/from-inline.css": ".x{}",
    });
    const imported = res.stylesheets.find((s) => s.url?.endsWith("from-inline.css"));
    expect(imported).toMatchObject({ via: "import", depth: 1 });
  });

  it("enforces the file budget and reports partial", async () => {
    const links = Array.from({ length: 5 }, (_, i) => `<link rel="stylesheet" href="f${i}.css">`).join("");
    const files = Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => [`https://example.com/page/f${i}.css`, `.f${i}{}`])
    );
    const { res } = await collect(links, files, { maxFiles: 3 });

    expect(res.stylesheets.filter((s) => s.url)).toHaveLength(3);
    expect(res.partial).toBe(true);
    expect(res.notes.some((n) => n.includes("file budget"))).toBe(true);
  });

  it("enforces the byte budget", async () => {
    const html = `<link rel="stylesheet" href="big.css"><link rel="stylesheet" href="next.css">`;
    const { res } = await collect(
      html,
      {
        "https://example.com/page/big.css": "x".repeat(2048),
        "https://example.com/page/next.css": ".next{}",
      },
      { maxBytes: 1024 }
    );

    const urls = res.stylesheets.filter((s) => s.url).map((s) => s.url!);
    expect(urls).toEqual(["https://example.com/page/big.css"]);
    expect(res.partial).toBe(true);
    expect(res.notes.some((n) => n.includes("byte budget"))).toBe(true);
  });

  it("records fetch failures (404 / network) without throwing", async () => {
    const html = `
      <link rel="stylesheet" href="ok.css">
      <link rel="stylesheet" href="missing.css">
      <link rel="stylesheet" href="boom.css">`;
    const { res } = await collect(html, {
      "https://example.com/page/ok.css": ".ok{}",
      "https://example.com/page/boom.css": "!throw",
    });

    expect(res.stylesheets.filter((s) => s.url)).toHaveLength(1);
    expect(res.failed.sort()).toEqual([
      "https://example.com/page/boom.css",
      "https://example.com/page/missing.css",
    ]);
    expect(res.partial).toBe(false); // failures ≠ budget partial
  });

  it("excludes guard-rejected URLs and traces them", async () => {
    const html = `
      <link rel="stylesheet" href="https://internal.corp/private.css">
      <link rel="stylesheet" href="public.css">`;
    const { impl, calls } = mockFetch({
      "https://example.com/page/public.css": ".pub{}",
      "https://internal.corp/private.css": ".secret{}",
    });
    const res = await collectStylesheets(html, BASE, {
      fetchImpl: impl,
      cache: false,
      guard: async (url) => {
        if (url.includes("internal.corp")) throw new Error("blocked");
      },
    });

    expect(calls).not.toContain("https://internal.corp/private.css");
    expect(res.failed).toContain("https://internal.corp/private.css");
    expect(res.notes.some((n) => n.includes("SSRF"))).toBe(true);
    expect(res.stylesheets.filter((s) => s.url)).toHaveLength(1);
  });

  it("dedupes stylesheets referenced more than once", async () => {
    const html = `
      <link rel="stylesheet" href="dup.css">
      <link rel="stylesheet" href="dup.css">
      <link rel="stylesheet" href="importer.css">`;
    const { res, calls } = await collect(html, {
      "https://example.com/page/dup.css": ".dup{}",
      "https://example.com/page/importer.css": `@import url("dup.css");`,
    });

    expect(calls.filter((c) => c.endsWith("dup.css"))).toHaveLength(1);
    expect(res.stylesheets.filter((s) => s.url?.endsWith("dup.css"))).toHaveLength(1);
  });

  it("uses the LRU cache when enabled", async () => {
    const html = `<link rel="stylesheet" href="cached.css">`;
    const files = { "https://example.com/page/cached.css": ".c{}" };

    const first = mockFetch(files);
    await collectStylesheets(html, BASE, { fetchImpl: first.impl, guard: allowAll });
    const second = mockFetch(files);
    const res = await collectStylesheets(html, BASE, { fetchImpl: second.impl, guard: allowAll });

    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(0); // served from cache
    expect(res.stylesheets.find((s) => s.url)?.content).toBe(".c{}");
  });

  it("returns inline styles even when the HTML has no external CSS", async () => {
    const { res } = await collect(`<style>.only{}</style>`, {});
    expect(res.stylesheets).toHaveLength(1);
    expect(res.stylesheets[0].via).toBe("inline");
    expect(res.failed).toEqual([]);
  });
});
