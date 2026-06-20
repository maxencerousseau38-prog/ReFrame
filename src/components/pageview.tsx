"use client";

import * as React from "react";

/**
 * Fires one pageview ping for a published site (no cookies, no PII). Lets the
 * owner see real traffic in the dashboard — the "your site is working" signal.
 */
export function Pageview({ slug }: { slug: string }) {
  React.useEffect(() => {
    const body = JSON.stringify({ slug });
    // Prefer sendBeacon so it doesn't block; fall back to fetch.
    try {
      if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      else void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    } catch {
      /* analytics is best-effort */
    }
  }, [slug]);
  return null;
}
