"use client";

import * as React from "react";
import { EnvelopeSimple, CircleNotch, Check, Warning } from "@phosphor-icons/react";

/**
 * Admin-only "test email delivery" affordance. Renders nothing unless the
 * signed-in account is on the ADMIN_EMAILS allowlist, so it never shows to
 * normal users. Lets the founder confirm Resend is wired in one click.
 */
export function AdminEmailTest() {
  const [show, setShow] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "sending" | "ok" | "fail">("idle");
  const [msg, setMsg] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setShow(!!d?.user?.comped))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!show) return null;

  async function test() {
    setStatus("sending");
    setMsg("");
    try {
      const res = await fetch("/api/health/email-test", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.delivered) {
        setStatus("ok");
        setMsg(`Sent to ${d.to}. Check your inbox.`);
      } else {
        setStatus("fail");
        setMsg(d.error || "Not delivered. Check RESEND_API_KEY.");
      }
    } catch {
      setStatus("fail");
      setMsg("Request failed.");
    }
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
      <span className="text-muted-foreground">Admin · email delivery</span>
      <button
        onClick={test}
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-60"
      >
        {status === "sending" ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : <EnvelopeSimple weight="bold" className="h-4 w-4" />}
        Send test email
      </button>
      {status === "ok" && (
        <span className="inline-flex items-center gap-1.5 text-emerald-400">
          <Check weight="bold" className="h-4 w-4" /> {msg}
        </span>
      )}
      {status === "fail" && (
        <span className="inline-flex items-center gap-1.5 text-amber-400">
          <Warning weight="bold" className="h-4 w-4" /> {msg}
        </span>
      )}
    </div>
  );
}
