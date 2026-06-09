import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/dashboard/app-shell";
import { DASHBOARD_NAV } from "@/lib/constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();

  return (
    <AppShell
      items={DASHBOARD_NAV}
      nom={profile?.nom ?? user.user_metadata?.nom}
      email={user.email}
      isAdmin={profile?.role === "admin"}
      area="Espace client"
    >
      {children}
    </AppShell>
  );
}
