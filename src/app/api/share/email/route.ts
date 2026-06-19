import { NextResponse } from "next/server";
import { getShare, attachEmail } from "@/lib/server/shares-store";
import { sendEmail, redesignLinkTemplate } from "@/lib/server/email";
import { isValidEmail } from "@/lib/server/users-store";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

function originOf(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * POST /api/share/email — email the redesign link to the visitor. Turns the
 * "save your work" moment into a captured lead: the email is stored on the
 * share and the link is sent so the rebuild is never lost.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`shareEmail:${clientKey(req)}`, 8, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  const { id, email } = (await req.json().catch(() => ({}))) as { id?: string; email?: string };
  if (!id || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "A valid id and email are required." }, { status: 400 });
  }

  const share = await attachEmail(id, email.trim().toLowerCase());
  if (!share) return NextResponse.json({ error: "Redesign not found." }, { status: 404 });

  const link = `${originOf(req)}/r/${id}`;
  const tpl = redesignLinkTemplate(link, share.schema.brand?.name || "your site");
  // Best-effort: a delivery hiccup must not lose the lead (already stored).
  const { delivered } = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html }).catch(() => ({ delivered: false }));
  return NextResponse.json({ ok: true, delivered });
}
