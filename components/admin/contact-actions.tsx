"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, RotateCcw } from "lucide-react";
import { setContactTreated } from "@/app/(admin)/actions";
import { Button } from "@/components/ui/button";

/** Bouton pour (dé)marquer une demande de contact comme traitée. */
export function ContactTreatToggle({
  id,
  traite,
}: {
  id: string;
  traite: boolean;
}) {
  const [done, setDone] = React.useState(traite);
  const [pending, setPending] = React.useState(false);

  const toggle = async () => {
    const next = !done;
    setDone(next);
    setPending(true);
    const result = await setContactTreated(id, next);
    setPending(false);
    if (!result.success) {
      toast.error(result.error ?? "Action impossible.");
      setDone(!next);
    } else {
      toast.success(next ? "Marquée comme traitée." : "Remise en attente.");
    }
  };

  return (
    <Button
      variant={done ? "ghost" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={pending}
    >
      {done ? (
        <>
          <RotateCcw className="size-4" /> Rouvrir
        </>
      ) : (
        <>
          <Check className="size-4" /> Marquer traitée
        </>
      )}
    </Button>
  );
}
