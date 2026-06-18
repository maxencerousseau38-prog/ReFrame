import JSZip from "jszip";
import { schemaToFiles, slugForFilename, collectImages } from "@/lib/export-html";
import type { SiteSchema } from "@/lib/generation/types";

/**
 * Build a fully self-contained export of a site: standalone HTML/CSS (no React,
 * no build step) plus the site's images downloaded into an assets/ folder, so
 * the result keeps working with no dependency on ReFrame or the original host.
 * This is the heart of the "no vendor lock-in" promise.
 */

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg",
};

async function bundleImages(
  urls: string[]
): Promise<{ map: Record<string, string>; files: { path: string; data: ArrayBuffer }[] }> {
  const map: Record<string, string> = {};
  const files: { path: string; data: ArrayBuffer }[] = [];
  let i = 0;
  await Promise.all(
    urls.slice(0, 40).map(async (url) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
        clearTimeout(timer);
        if (!res.ok) return;
        const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
        if (!type.startsWith("image/")) return;
        const data = await res.arrayBuffer();
        if (data.byteLength === 0 || data.byteLength > 8_000_000) return; // cap 8MB
        const ext = EXT_BY_TYPE[type] || "img";
        const path = `assets/img-${++i}.${ext}`;
        map[url] = path;
        files.push({ path, data });
      } catch {
        /* leave this image as its remote URL rather than break the export */
      }
    })
  );
  return { map, files };
}

export interface SiteExport {
  body: ArrayBuffer | string;
  contentType: string;
  filename: string;
}

/** Produce a downloadable export. Single page with no images -> .html; anything
 *  with extra pages or images -> a portable .zip (index.html + pages + assets/). */
export async function buildSiteExport(schema: SiteSchema, opts: { branded: boolean }): Promise<SiteExport> {
  const slug = slugForFilename(schema.brand.name);
  const { map, files: assetFiles } = await bundleImages(collectImages(schema));
  const pages = schemaToFiles(schema, { branded: opts.branded, assets: map });

  if (pages.length === 1 && assetFiles.length === 0) {
    return { body: pages[0].html, contentType: "text/html; charset=utf-8", filename: `${slug}.html` };
  }

  const zip = new JSZip();
  for (const f of pages) zip.file(f.name, f.html);
  for (const a of assetFiles) zip.file(a.path, a.data);
  const body = await zip.generateAsync({ type: "arraybuffer" });
  return { body, contentType: "application/zip", filename: `${slug}.zip` };
}
