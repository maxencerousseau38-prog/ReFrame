import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUserSite } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EditorForm } from "@/components/dashboard/editor-form";
import type { SiteContent } from "@/types";

export const metadata: Metadata = { title: "Éditeur" };

export default async function EditeurPage() {
  const { user } = await requireUser();
  const site = await getUserSite(user.id);
  if (!site) redirect("/onboarding");

  const content = (site.contenu ?? {}) as SiteContent;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-10">
      <PageHeader
        title="Éditeur"
        description="Modifiez les informations clés de votre site. Les changements sont publiés en un clic."
      />
      <EditorForm siteId={site.id} userId={user.id} initialContent={content} />
    </div>
  );
}
