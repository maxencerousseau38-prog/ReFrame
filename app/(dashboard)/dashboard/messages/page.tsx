import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUserSite } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { MessageList } from "@/components/dashboard/message-list";
import { Badge } from "@/components/ui/badge";
import type { SiteMessage } from "@/types";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { user } = await requireUser();
  const site = await getUserSite(user.id);

  let messages: SiteMessage[] = [];
  if (site) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_messages")
      .select("*")
      .eq("site_id", site.id)
      .order("recu_le", { ascending: false });
    messages = (data ?? []) as SiteMessage[];
  }

  const unread = messages.filter((m) => !m.lu).length;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-10">
      <PageHeader
        title="Messages"
        description="Les demandes reçues via le formulaire de contact de votre site."
      >
        {unread > 0 && <Badge className="bg-brand text-brand-foreground hover:bg-brand">{unread} non lus</Badge>}
      </PageHeader>
      <MessageList messages={messages} />
    </div>
  );
}
