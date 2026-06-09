import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Globe, Building2, Calendar, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminClientDetail } from "@/lib/admin";
import { SUBSCRIPTION_STATUS_META, formatDate, timeAgo, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AdminSiteStatus } from "@/components/admin/admin-site-status";
import { SitePreview } from "@/components/dashboard/site-preview";
import { Button } from "@/components/ui/button";
import type { SiteContent } from "@/types";

export const metadata: Metadata = { title: "Admin — Fiche client" };

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { client, messages } = await getAdminClientDetail(id);
  if (!client) notFound();

  const subMeta = client.subscription
    ? SUBSCRIPTION_STATUS_META[client.subscription.statut]
    : null;
  const content = (client.site?.contenu ?? {}) as SiteContent;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href="/admin/clients">
          <ArrowLeft className="size-4" /> Tous les clients
        </Link>
      </Button>

      <PageHeader
        title={client.entreprise ?? client.nom ?? "Client"}
        description={client.email ?? undefined}
      >
        {client.site && (
          <AdminSiteStatus siteId={client.site.id} current={client.site.statut} />
        )}
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-8">
          {/* Aperçu du site */}
          {client.site ? (
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Aperçu du site</h2>
              <SitePreview content={content} />
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Ce client n'a pas encore de site.
            </div>
          )}

          {/* Messages du site */}
          <section>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Messages reçus ({messages.length})
            </h2>
            {messages.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
                Aucun message reçu.
              </p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {messages.map((m) => (
                  <li key={m.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-chart-2 text-[10px] font-semibold text-white">
                      {getInitials(m.nom)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.nom}</span>
                        {!m.lu && <span className="size-2 rounded-full bg-brand" />}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {timeAgo(m.recu_le)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Colonne latérale : infos compte */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand to-chart-2 text-sm font-semibold text-white">
                {getInitials(client.nom)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{client.nom ?? "—"}</p>
                <p className="truncate text-xs text-muted-foreground">{client.email}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-4" /> {client.entreprise ?? "—"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" /> Inscrit le {formatDate(client.createdAt)}
              </div>
              {client.site?.nom_domaine && (
                <a
                  href={`https://${client.site.nom_domaine}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-brand hover:underline"
                >
                  <Globe className="size-4" /> {client.site.nom_domaine}
                  <ExternalLink className="size-3" />
                </a>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium">Abonnement</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                {subMeta ? (
                  <StatusBadge label={subMeta.label} tone={subMeta.tone} />
                ) : (
                  <span className="text-muted-foreground">Aucun</span>
                )}
              </div>
              {client.subscription?.plan && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Offre</span>
                  <span className="font-medium capitalize">{client.subscription.plan}</span>
                </div>
              )}
              {client.subscription?.periode_fin && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Échéance</span>
                  <span>{formatDate(client.subscription.periode_fin)}</span>
                </div>
              )}
            </div>
          </div>

          <Button asChild variant="outline" className="w-full">
            <a href={`mailto:${client.email}`}>
              <Mail className="size-4" /> Contacter par e-mail
            </a>
          </Button>
        </aside>
      </div>
    </div>
  );
}
