import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { isComped } from "@/lib/server/plans";
import { isEmailConfigured, sendEmail } from "@/lib/server/email";

export const runtime = "nodejs";

/**
 * POST /api/health/email-test — send a test email to the signed-in admin's own
 * address, to confirm Resend is wired. Admin-only (ADMIN_EMAILS) to avoid abuse.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isComped(user.email)) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  if (!isEmailConfigured()) {
    return NextResponse.json({ configured: false, delivered: false, error: "Email is not configured (set RESEND_API_KEY)." });
  }
  try {
    const res = await sendEmail({
      to: user.email,
      subject: "ReFrame email test ✅",
      html: "<p>Your ReFrame email delivery is working. You can receive contact-form messages from published sites.</p>",
    });
    return NextResponse.json({ configured: true, delivered: res.delivered, to: user.email });
  } catch (e) {
    return NextResponse.json({ configured: true, delivered: false, error: String(e) }, { status: 500 });
  }
}
