import { NextResponse } from "next/server";
import { getSite } from "@/lib/server/sites-store";
import { getUserById } from "@/lib/server/users-store";
import { sendEmail } from "@/lib/server/email";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * POST /api/contact — a visitor submits the contact form on a published site.
 * Resolves the site (by slug, or by the host's subdomain) to its owner and
 * emails the message to the business. Always returns 200 for a valid submission
 * so visitors get a clean "thanks"; delivery is best-effort and depends on the
 * email provider being configured.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`contact:${clientKey(req)}`, 8, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = (await req.json().catch(() => null)) as
    | { slug?: string; host?: string; name?: string; email?: string; message?: string }
    | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const name = (body.name || "").trim().slice(0, 100);
  const email = (body.email || "").trim().slice(0, 160);
  const message = (body.message || "").trim().slice(0, 2000);
  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  }

  // Resolve the site: explicit slug first, otherwise the host's first label
  // (subdomain hosting). Unresolved (e.g. in-app preview) is accepted silently.
  let slug = (body.slug || "").trim();
  if (!slug && body.host) slug = body.host.split(":")[0].split(".")[0];
  const site = slug ? await getSite(slug) : null;

  let delivered = false;
  if (site?.ownerId) {
    try {
      const owner = await getUserById(site.ownerId);
      if (owner?.email) {
        const brand = site.schema.brand?.name || "your site";
        const res = await sendEmail({
          to: owner.email,
          subject: `New message from your ${brand} site`,
          html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px">
            <h2 style="font-size:16px;margin:0 0 12px">New enquiry from ${esc(brand)}</h2>
            <p style="margin:0 0 6px"><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
            <p style="margin:12px 0 4px"><strong>Message:</strong></p>
            <p style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">${esc(message)}</p>
          </div>`,
        });
        delivered = res.delivered;
      }
    } catch {
      /* best-effort: still return ok so the visitor sees a clean confirmation */
    }
  }

  return NextResponse.json({ ok: true, delivered });
}
