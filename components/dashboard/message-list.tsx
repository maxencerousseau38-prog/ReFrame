"use client";

import * as React from "react";
import { toast } from "sonner";
import { Mail, MailOpen, Check } from "lucide-react";
import { setMessageRead } from "@/app/(dashboard)/actions";
import { timeAgo, getInitials, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SiteMessage } from "@/types";

export function MessageList({ messages }: { messages: SiteMessage[] }) {
  const [items, setItems] = React.useState(messages);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const toggleRead = async (msg: SiteMessage) => {
    const lu = !msg.lu;
    setItems((prev) => prev.map((m) => (m.id === msg.id ? { ...m, lu } : m)));
    const result = await setMessageRead(msg.id, lu);
    if (!result.success) {
      toast.error(result.error ?? "Action impossible.");
      setItems((prev) => prev.map((m) => (m.id === msg.id ? { ...m, lu: !lu } : m)));
    }
  };

  const open = (msg: SiteMessage) => {
    setOpenId((id) => (id === msg.id ? null : msg.id));
    if (!msg.lu) void toggleRead(msg);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <Mail className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 font-semibold">Aucun message pour l'instant</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Les messages envoyés via le formulaire de contact de votre site apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {items.map((msg) => (
        <li key={msg.id}>
          <button
            onClick={() => open(msg)}
            className={cn(
              "flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/40",
              !msg.lu && "bg-brand/[0.04]",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-chart-2 text-xs font-semibold text-white">
              {getInitials(msg.nom)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("truncate text-sm", !msg.lu && "font-semibold")}>
                  {msg.nom}
                </span>
                {!msg.lu && <span className="size-2 shrink-0 rounded-full bg-brand" />}
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {timeAgo(msg.recu_le)}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{msg.email}</p>
              <p
                className={cn(
                  "mt-1 text-sm text-muted-foreground",
                  openId === msg.id ? "" : "line-clamp-1",
                )}
              >
                {msg.message}
              </p>

              {openId === msg.id && (
                <div className="mt-3 flex items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`mailto:${msg.email}`}>
                      <Mail className="size-4" /> Répondre
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleRead(msg);
                    }}
                  >
                    {msg.lu ? (
                      <>
                        <MailOpen className="size-4" /> Marquer non lu
                      </>
                    ) : (
                      <>
                        <Check className="size-4" /> Marquer lu
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
