"use client";

import * as React from "react";
import { Plugs, Warning, CaretDown } from "@phosphor-icons/react";
import type { DetectedIntegration } from "@/lib/generation/types";

const CATEGORY_LABEL: Record<string, string> = {
  payments: "Payments",
  scheduling: "Scheduling",
  booking: "Booking",
  analytics: "Analytics",
  marketing: "Marketing",
  chat: "Chat / support",
  crm: "CRM",
};

/**
 * Pre-publish safety notice. Rebuilding the site drops the original third-party
 * embeds, so before going live we surface the business-critical tools we found
 * on the source page and what to reconnect - never let a customer silently break
 * payments, booking, analytics or chat. Honest, non-blocking, dismissible.
 */
export function IntegrationsNotice({ integrations }: { integrations: DetectedIntegration[] }) {
  const [open, setOpen] = React.useState(true);
  if (!integrations.length) return null;

  const paymentsOrBooking = integrations.some((i) => i.category === "payments" || i.category === "booking" || i.category === "scheduling");

  return (
    <div className="border-b border-amber-500/25 bg-amber-500/[0.06] px-6 py-3">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 text-left">
          <Warning weight="fill" className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-[13px] font-medium text-amber-100">
            {integrations.length} business tool{integrations.length > 1 ? "s" : ""} detected on your current site
            {paymentsOrBooking && " — including payments/booking"}. Reconnect {integrations.length > 1 ? "them" : "it"} before publishing.
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            {integrations.slice(0, 6).map((i) => (
              <span key={i.id} className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200 sm:inline">
                {i.name}
              </span>
            ))}
            <CaretDown weight="bold" className={`h-3.5 w-3.5 text-amber-300 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>

        {open && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {integrations.map((i) => (
              <li key={i.id} className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-black/20 px-3 py-2">
                <Plugs weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-amber-100">
                    {i.name} <span className="font-normal text-amber-300/70">· {CATEGORY_LABEL[i.category] ?? i.category}</span>
                  </p>
                  <p className="text-[12px] leading-snug text-amber-200/70">{i.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
