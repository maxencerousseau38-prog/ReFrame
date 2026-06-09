"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  HOSTING_PLANS,
  REDESIGN_PACKS,
  YEARLY_DISCOUNT_LABEL,
  type BillingPeriod,
} from "@/lib/pricing";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Interrupteur mensuel / annuel. */
function BillingToggle({
  period,
  onChange,
}: {
  period: BillingPeriod;
  onChange: (p: BillingPeriod) => void;
}) {
  return (
    <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
      {(["mensuel", "annuel"] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {period === p && (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 -z-10 rounded-full bg-background shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          {p === "mensuel" ? "Mensuel" : "Annuel"}
          {p === "annuel" && (
            <span className="ml-1.5 text-xs font-semibold text-brand">−16%</span>
          )}
        </button>
      ))}
    </div>
  );
}

interface PricingProps {
  /** Affiche aussi les packs de refonte (paiement unique). */
  showRedesign?: boolean;
}

export function Pricing({ showRedesign = true }: PricingProps) {
  const [period, setPeriod] = React.useState<BillingPeriod>("mensuel");

  return (
    <div className="space-y-20">
      {/* Hébergement */}
      <div>
        <div className="mb-10 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">Hébergement mensuel</h3>
          <p className="mt-2 text-muted-foreground">
            Votre site reste en ligne, sécurisé et à jour. {YEARLY_DISCOUNT_LABEL} en annuel.
          </p>
          <div className="mt-6">
            <BillingToggle period={period} onChange={setPeriod} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {HOSTING_PLANS.map((plan) => {
            const price = period === "mensuel" ? plan.monthly : plan.yearly;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-8 transition-shadow",
                  plan.highlight
                    ? "border-brand/40 shadow-lg ring-1 ring-brand/20"
                    : "border-border hover:shadow-md",
                )}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-8 bg-brand text-brand-foreground hover:bg-brand">
                    {plan.badge}
                  </Badge>
                )}
                <h4 className="text-lg font-semibold">{plan.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    {formatPrice(price)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ mois</span>
                </div>
                {period === "annuel" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    soit {formatPrice(price * 12)} facturés par an
                  </p>
                )}
                <Button
                  asChild
                  className="mt-6"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  <Link href="/inscription">Choisir {plan.name}</Link>
                </Button>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refonte initiale */}
      {showRedesign && (
        <div>
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-semibold tracking-tight">Refonte initiale</h3>
            <p className="mt-2 text-muted-foreground">
              Un paiement unique pour créer votre nouveau site. Puis vous choisissez votre
              hébergement.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {REDESIGN_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-8",
                  pack.highlight ? "border-brand/40 ring-1 ring-brand/20" : "border-border",
                )}
              >
                <h4 className="text-lg font-semibold">{pack.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{pack.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    {formatPrice(pack.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">une fois</span>
                </div>
                <Button
                  asChild
                  className="mt-6"
                  variant={pack.highlight ? "default" : "outline"}
                >
                  <Link href="/inscription">Démarrer</Link>
                </Button>
                <ul className="mt-8 space-y-3">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
