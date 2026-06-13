import { NextResponse } from "next/server";
import { isBlobConfigured, uploadImage } from "@/lib/server/blob";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

/** POST /api/upload (multipart, field "file") — host an uploaded image, return its URL. */
export async function POST(req: Request) {
  const limit = rateLimit(`upload:${clientKey(req)}`, 30, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many uploads." }, { status: 429 });

  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "Image hosting isn't configured yet (set BLOB_READ_WRITE_TOKEN).", code: "blob_unconfigured" },
      { status: 503 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    const url = await uploadImage(file);
    if (!url) {
      return NextResponse.json({ error: "Upload failed. Use an image under 8MB." }, { status: 400 });
    }
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed.", detail: String(err) }, { status: 500 });
  }
}
