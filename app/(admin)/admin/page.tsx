import type { Metadata } from "next";
import Link from "next/link";
import { Users, CreditCard, Globe, TrendingUp, TrendingDown, MailQuestion, ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats, getAdminClients } from "@/lib/admin";
import { SITE_STATUS_META, SUBSCRIPTION_STATUS_META, formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin — Tableau de bord" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminStats();
  const clients = (await getAdminClients()).filter((c) => c.role !== "admin").slice(0, 5);

  const cards = [
    { icon: Users, label: "Clients", value: stats.totalClients, hint: "comptes actifs" },
    {
      icon: CreditCard,
      label: "Abonnements actifs",
      value: stats.activeSubscriptions,
      hint: "hébergements payants",
    },
    { icon: Globe, label: "Sites en ligne", value: stats.sitesOnline, hint: "publiés" },
    {
      icon: TrendingUp,
      label: "MRR (simulé)",
      value: formatPrice(stats.mrr),
      hint: "revenu mensuel récurrent",
    },
    {
      icon: TrendingDown,
      label: "Churn (simulé)",
      value: `${stats.churnRate}%`,
      hint: "sur 30 jours",
    },
    {
      icon: MailQuestion,
      label: "Demandes à traiter",
      value: stats.newContacts,
      hint: "formulaire marketing",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-10">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité Vitrio."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <c.icon className="size-4.5" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Derniers clients */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-semibold">Derniers clients</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/clients">
              Tous les clients <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {clients.map((c) => {
            const siteMeta = c.site ? SITE_STATUS_META[c.site.statut] : null;
            const subMeta = c.subscription ? SUBSCRIPTION_STATUS_META[c.subscription.statut] : null;
            return (
              <li key={c.userId}>
                <Link
                  href={`/admin/clients/${c.userId}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {c.entreprise ?? c.nom ?? c.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  {siteMeta && <StatusBadge label={siteMeta.label} tone={siteMeta.tone} />}
                  {subMeta && <StatusBadge label={subMeta.label} tone={subMeta.tone} />}
                </Link>
              </li>
            );
          })}
          {clients.length === 0 && (
            <li className="p-5 text-sm text-muted-foreground">Aucun client pour l'instant.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
