import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { timeAgo, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { ContactTreatToggle } from "@/components/admin/contact-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ContactRequest } from "@/types";

export const metadata: Metadata = { title: "Admin — Demandes de contact" };

export default async function AdminContactsPage() {
  await requireAdmin();
  const admin = await createAdminClient();
  const { data } = await admin
    .from("contact_requests")
    .select("*")
    .order("recu_le", { ascending: false });
  const requests = (data ?? []) as ContactRequest[];
  const pending = requests.filter((r) => !r.traite).length;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-10">
      <PageHeader
        title="Demandes de contact"
        description="Les messages reçus via le formulaire du site marketing."
      >
        {pending > 0 && (
          <Badge className="bg-brand text-brand-foreground hover:bg-brand">
            {pending} en attente
          </Badge>
        )}
      </PageHeader>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Aucune demande de contact pour l'instant.
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl border bg-card p-5 ${
                r.traite ? "border-border opacity-70" : "border-brand/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-chart-2 text-xs font-semibold text-white">
                  {getInitials(r.nom)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.nom}</span>
                    <a href={`mailto:${r.email}`} className="text-sm text-brand hover:underline">
                      {r.email}
                    </a>
                    {r.traite && (
                      <Badge variant="secondary" className="text-[10px]">
                        Traitée
                      </Badge>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {timeAgo(r.recu_le)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.message}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={`mailto:${r.email}`}>Répondre</a>
                    </Button>
                    <ContactTreatToggle id={r.id} traite={r.traite} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
