"use client";

import * as React from "react";
import { toast } from "sonner";
import { adminUpdateSiteStatus } from "@/app/(admin)/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SiteStatus } from "@/types";
import { SITE_STATUS_META } from "@/lib/utils";

const OPTIONS: SiteStatus[] = ["analyse", "brouillon", "en_ligne", "hors_ligne"];

/** Sélecteur admin pour changer le statut du site d'un client. */
export function AdminSiteStatus({
  siteId,
  current,
}: {
  siteId: string;
  current: SiteStatus;
}) {
  const [value, setValue] = React.useState<SiteStatus>(current);
  const [pending, setPending] = React.useState(false);

  const onChange = async (next: string) => {
    const status = next as SiteStatus;
    const previous = value;
    setValue(status);
    setPending(true);
    const result = await adminUpdateSiteStatus(siteId, status);
    setPending(false);
    if (result.success) toast.success(result.message ?? "Statut mis à jour.");
    else {
      toast.error(result.error ?? "Erreur.");
      setValue(previous);
    }
  };

  return (
    <Select value={value} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((s) => (
          <SelectItem key={s} value={s}>
            {SITE_STATUS_META[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
