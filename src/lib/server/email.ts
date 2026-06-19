/**
 * Transactional email, env-driven with graceful degradation.
 *
 * When RESEND_API_KEY is set, mail is sent via the Resend HTTP API (no SDK,
 * just fetch). Otherwise it is logged to the server console so flows are fully
 * testable in dev without delivering anything. Swap the body to use another
 * provider (Postmark, SES) without touching callers.
 */

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "ReFrame <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(API_KEY);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ delivered: boolean }> {
  if (!API_KEY) {
    // Dev fallback: surface the message instead of dropping it.
    console.log(
      `[email:dev] to=${opts.to} subject=${JSON.stringify(opts.subject)}\n${opts.html}`
    );
    return { delivered: false };
  }
  // Bound the call so a slow/unreachable provider can't stall the request that
  // triggered it (signup, password reset). Callers treat sending as best-effort.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Email send failed: ${res.status} ${await res.text()}`);
    return { delivered: true };
  } finally {
    clearTimeout(timer);
  }
}

/* --- templates ------------------------------------------------------------- */

function shell(title: string, body: string, cta?: { href: string; label: string }): string {
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#18181b">
    <h1 style="font-size:20px;font-weight:600;margin:0 0 12px">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#3f3f46">${body}</div>
    ${
      cta
        ? `<a href="${cta.href}" style="display:inline-block;margin-top:20px;background:#65a30d;color:#fff;text-decoration:none;padding:10px 18px;border-radius:9999px;font-size:14px;font-weight:600">${cta.label}</a>`
        : ""
    }
    <p style="margin-top:24px;font-size:12px;color:#a1a1aa">ReFrame - reframe any website into something worth visiting.</p>
  </div>`;
}

export function verifyEmailTemplate(link: string) {
  return {
    subject: "Verify your ReFrame email",
    html: shell(
      "Confirm your email",
      "Thanks for joining ReFrame. Confirm this address to secure your account and publish without limits.",
      { href: link, label: "Verify email" }
    ),
  };
}

export function resetPasswordTemplate(link: string) {
  return {
    subject: "Reset your ReFrame password",
    html: shell(
      "Reset your password",
      "We received a request to reset your password. This link expires in one hour. If you did not request it, you can ignore this email.",
      { href: link, label: "Choose a new password" }
    ),
  };
}

export function redesignLinkTemplate(link: string, brandName: string) {
  return {
    subject: `Your ${brandName} redesign is ready`,
    html: shell(
      "Your redesign is saved",
      `Here's the modern, premium rebuild of ${brandName}. Open it anytime, share it with your team, or keep editing it by chatting with the AI.`,
      { href: link, label: "View my redesign" }
    ),
  };
}
