"use client";

import * as React from "react";
import { toast } from "sonner";
import { createCheckoutSession } from "@/lib/stripe/actions";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

/**
 * Déclenche le (futur) paiement Stripe. Pour l'instant, l'action est un stub :
 * on affiche un message explicite tant que Stripe n'est pas branché.
 */
export function CheckoutButton({
  priceKey,
  children,
  ...props
}: { priceKey: string } & ComponentProps<typeof Button>) {
  const [pending, setPending] = React.useState(false);

  const onClick = async () => {
    setPending(true);
    const result = await createCheckoutSession(priceKey);
    setPending(false);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      // Squelette Stripe : message informatif.
      toast.info(result.success ? "Paiement bientôt disponible." : result.error);
    }
  };

  return (
    <Button onClick={onClick} disabled={pending} {...props}>
      {pending ? "Redirection…" : children}
    </Button>
  );
}
