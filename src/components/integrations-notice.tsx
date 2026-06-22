"use client";

import * as React from "react";
import { Plugs, Warning, CaretDown, Check } from "@phosphor-icons/react";
import type { DetectedIntegration } from "@/lib/generation/types";
import { isConnectable, connectableMeta, isValidIntegrationValue } from "@/lib/integrations";

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
 * Pre-publish reconnection. We found business-critical tools on the source site;
 * rebuilding drops their embeds. For tools we can re-inject from an ID (GA4,
 * GTM, Meta Pixel, Calendly, Crisp, Intercom) we show an input and reconnect
 * them for real; for the rest (payments) we give clear manual guidance. Honest,
 * non-blocking.
 */
export function IntegrationsNotice({
  integrations,
  connected = [],
  onConnect,
}: {
  integrations: DetectedIntegration[];
  connected?: { id: string; value: string }[];
  onConnect?: (id: string, value: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const connectedMap = React.useMemo(() => new Map(connected.map((c) => [c.id, c.value])), [connected]);
  if (!integrations.length) return null;

  const flagged = integrations.some((i) => ["payments", "booking"].includes(i.category));

  return (
    <div className="border-b border-amber-500/25 bg-amber-500/[0.06] px-6 py-3">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 text-left">
          <Warning weight="fill" className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-[13px] font-medium text-amber-100">
            {integrations.length} business tool{integrations.length > 1 ? "s" : ""} on your current site
            {flagged && " — including payments/booking"}. Reconnect before publishing.
          </span>
          <CaretDown weight="bold" className={`ml-auto h-3.5 w-3.5 shrink-0 text-amber-300 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {integrations.map((i) => (
              <IntegrationRow
                key={i.id}
                integration={i}
                value={connectedMap.get(i.id) ?? ""}
                onConnect={onConnect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function IntegrationRow({
  integration: i,
  value,
  onConnect,
}: {
  integration: DetectedIntegration;
  value: string;
  onConnect?: (id: string, value: string) => void;
}) {
  const meta = connectableMeta(i.id);
  const canConnect = isConnectable(i.id) && !!onConnect;
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);
  const connected = !!value && isValidIntegrationValue(i.id, value);
  const draftValid = isValidIntegrationValue(i.id, draft);

  return (
    <li className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-black/20 px-3 py-2.5">
      <Plugs weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-amber-100">
          {i.name}
          <span className="font-normal text-amber-300/70">· {CATEGORY_LABEL[i.category] ?? i.category}</span>
          {connected && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300">
              <Check weight="bold" className="h-3 w-3" /> Reconnected
            </span>
          )}
        </p>
        {canConnect ? (
          <form
            className="mt-1.5 flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (draftValid) onConnect!(i.id, draft.trim());
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={meta?.placeholder}
              className="h-8 min-w-0 flex-1 rounded-md border border-amber-500/20 bg-black/30 px-2 text-[12.5px] text-amber-50 placeholder:text-amber-300/40 focus:border-amber-400/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draftValid || draft.trim() === value}
              className="h-8 shrink-0 rounded-md bg-amber-400/90 px-2.5 text-[12px] font-semibold text-amber-950 transition-opacity hover:bg-amber-400 disabled:opacity-40"
            >
              {connected ? "Update" : "Reconnect"}
            </button>
          </form>
        ) : (
          <p className="mt-0.5 text-[12px] leading-snug text-amber-200/70">{i.hint}</p>
        )}
        {canConnect && meta?.help && <p className="mt-1 text-[11px] leading-snug text-amber-300/50">{meta.help}</p>}
      </div>
    </li>
  );
}
