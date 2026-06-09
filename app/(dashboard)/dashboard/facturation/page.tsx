import type { Metadata } from "next";
import { CreditCard, Download, Info } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/queries";
import { SUBSCRIPTION_STATUS_META, formatDate, formatPrice } from "@/lib/utils";
import { HOSTING_PLANS } from "@/lib/pricing";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CheckoutButton } from "@/components/dashboard/checkout-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Facturation" };

// Historique de factures simulé (démo).
const MOCK_INVOICES = [
  { id: "INV-2026-005", date: "2026-05-01", amount: 99, status: "Payée" },
  { id: "INV-2026-004", date: "2026-04-01", amount: 99, status: "Payée" },
  { id: "INV-2026-003", date: "2026-03-01", amount: 99, status: "Payée" },
];

export default async function FacturationPage() {
  const { user } = await requireUser();
  const subscription = await getUserSubscription(user.id);
  const subMeta = subscription ? SUBSCRIPTION_STATUS_META[subscription.statut] : null;
  const activePlan = HOSTING_PLANS.find((p) => p.id === subscription?.plan);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-10">
      <PageHeader
        title="Facturation"
        description="Votre abonnement d'hébergement et l'historique de vos paiements."
      />

      {/* Bandeau squelette Stripe */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-muted-foreground">
          Le paiement en ligne est en cours d'intégration (squelette Stripe). Les montants et
          factures ci-dessous sont des données de démonstration.
        </p>
      </div>

      {/* Abonnement courant */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <CreditCard className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">
                {activePlan ? `Offre ${activePlan.name}` : "Aucun abonnement actif"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activePlan
                  ? `${formatPrice(activePlan.monthly)} / mois — hébergement de votre site`
                  : "Activez un abonnement pour héberger votre site."}
              </p>
            </div>
          </div>
          {subMeta && <StatusBadge label={subMeta.label} tone={subMeta.tone} />}
        </div>

        {subscription?.periode_fin && (
          <p className="mt-4 text-sm text-muted-foreground">
            Prochaine échéance : {formatDate(subscription.periode_fin)}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {subscription?.statut === "active" ? (
            <CheckoutButton priceKey="hebergement_pro_mensuel" variant="outline">
              Gérer mon abonnement
            </CheckoutButton>
          ) : (
            <CheckoutButton priceKey="hebergement_pro_mensuel">
              Activer mon hébergement
            </CheckoutButton>
          )}
        </div>
      </section>

      {/* Choix d'offre si inactif */}
      {subscription?.statut !== "active" && (
        <section>
          <h2 className="mb-4 font-semibold">Choisir une offre d'hébergement</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOSTING_PLANS.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatPrice(plan.monthly)}
                  <span className="text-sm font-normal text-muted-foreground"> /mois</span>
                </p>
                <CheckoutButton
                  priceKey={`hebergement_${plan.id}_mensuel`}
                  variant={plan.highlight ? "default" : "outline"}
                  className="mt-4 w-full"
                >
                  Choisir
                </CheckoutButton>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Historique (mock) */}
      <section>
        <h2 className="mb-4 font-semibold">Historique des factures</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.id}</TableCell>
                  <TableCell>{formatDate(inv.date)}</TableCell>
                  <TableCell>{formatPrice(inv.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge label={inv.status} tone="success" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Télécharger" disabled>
                      <Download className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
