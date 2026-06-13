import { put } from "@vercel/blob";

/**
 * Image hosting via Vercel Blob, env-driven with graceful degradation (same
 * pattern as the KV/email/render adapters). Lets owners upload a real logo and
 * photos for the rebuild instead of relying on flaky scraped images.
 *
 * Activates when BLOB_READ_WRITE_TOKEN is set (Vercel injects it when you add a
 * Blob store). Without it, isBlobConfigured() is false and uploads return 503.
 */

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const OK_TYPES = new Set([
  "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml", "image/avif",
]);

export function isBlobConfigured(): boolean {
  return Boolean(TOKEN);
}

/** Upload an image file and return its public URL, or null on rejection/failure. */
export async function uploadImage(file: File): Promise<string | null> {
  if (!TOKEN) return null;
  if (!OK_TYPES.has(file.type)) return null;
  if (file.size > MAX_BYTES || file.size === 0) return null;
  try {
    const ext = (file.name.split(".").pop() || "img").slice(0, 6).replace(/[^a-z0-9]/gi, "") || "img";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const blob = await put(key, file, { access: "public", token: TOKEN, contentType: file.type });
    return blob.url;
  } catch {
    return null;
  }
}
