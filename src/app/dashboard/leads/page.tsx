import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/server/auth";
import { listLeadsByOwner } from "@/lib/server/leads-store";

export const dynamic = "force-dynamic";

function when(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/leads");
  const leads = await listLeadsByOwner(user.id);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">Leads</h1>
        <p className="mt-2 text-muted-foreground">
          Every enquiry from your published sites, captured and kept — even if email delivery fails.
        </p>

        {leads.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-white/15 px-6 py-14 text-center text-muted-foreground">
            No leads yet. When a visitor submits the contact form on your live site, it shows up here.
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {leads.map((l) => (
              <li key={l.id} className="rounded-xl border border-border bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-medium text-white">{l.name}</span>
                  <a href={`mailto:${l.email}`} className="text-[13px] text-accent hover:underline">{l.email}</a>
                  <span className="ml-auto text-[12px] text-zinc-500">{l.brand} · {when(l.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-300">{l.message}</p>
                <a
                  href={`mailto:${l.email}?subject=${encodeURIComponent(`Re: your enquiry on ${l.brand}`)}`}
                  className="mt-3 inline-block rounded-full border border-white/15 px-3.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-white/5"
                >
                  Reply
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
