import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminClients } from "@/lib/admin";
import { SITE_STATUS_META, SUBSCRIPTION_STATUS_META, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Admin — Clients" };

export default async function AdminClientsPage() {
  await requireAdmin();
  const clients = (await getAdminClients()).filter((c) => c.role !== "admin");

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-10">
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length > 1 ? "s" : ""} au total.`}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Site</TableHead>
              <TableHead className="hidden md:table-cell">Abonnement</TableHead>
              <TableHead className="hidden lg:table-cell">Inscrit le</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => {
              const siteMeta = c.site ? SITE_STATUS_META[c.site.statut] : null;
              const subMeta = c.subscription
                ? SUBSCRIPTION_STATUS_META[c.subscription.statut]
                : null;
              return (
                <TableRow key={c.userId} className="group">
                  <TableCell>
                    <Link href={`/admin/clients/${c.userId}`} className="block">
                      <span className="font-medium">{c.entreprise ?? c.nom ?? "—"}</span>
                      <span className="block text-xs text-muted-foreground">{c.email}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {siteMeta ? (
                      <StatusBadge label={siteMeta.label} tone={siteMeta.tone} />
                    ) : (
                      <span className="text-sm text-muted-foreground">Aucun</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subMeta ? (
                      <StatusBadge label={subMeta.label} tone={subMeta.tone} />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/clients/${c.userId}`}
                      className="text-muted-foreground transition-colors group-hover:text-foreground"
                      aria-label="Voir la fiche"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Aucun client pour l'instant.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
