"use client";

import * as React from "react";
import { toast } from "sonner";
import { Power, PowerOff, Rocket } from "lucide-react";
import { updateSiteStatus } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import type { SiteStatus } from "@/types";

/**
 * Boutons de changement de statut du site côté client.
 * Permet de mettre en ligne / hors ligne (le client garde la main, l'admin aussi).
 */
export function SiteStatusActions({
  siteId,
  statut,
}: {
  siteId: string;
  statut: SiteStatus;
}) {
  const [pending, setPending] = React.useState(false);

  const change = async (next: SiteStatus, label: string) => {
    setPending(true);
    const result = await updateSiteStatus(siteId, next);
    setPending(false);
    if (result.success) toast.success(label);
    else toast.error(result.error ?? "Action impossible.");
  };

  if (statut === "en_ligne") {
    return (
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => change("hors_ligne", "Site mis hors ligne.")}
      >
        <PowerOff className="size-4" /> Mettre hors ligne
      </Button>
    );
  }

  if (statut === "hors_ligne") {
    return (
      <Button disabled={pending} onClick={() => change("en_ligne", "Site remis en ligne.")}>
        <Power className="size-4" /> Remettre en ligne
      </Button>
    );
  }

  if (statut === "brouillon") {
    return (
      <Button disabled={pending} onClick={() => change("en_ligne", "Votre site est en ligne !")}>
        <Rocket className="size-4" /> Publier mon site
      </Button>
    );
  }

  return null;
}
