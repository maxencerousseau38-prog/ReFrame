import { requireAdmin } from "@/lib/auth";
import { AppShell } from "@/components/dashboard/app-shell";
import { ADMIN_NAV } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin();

  return (
    <AppShell
      items={ADMIN_NAV}
      nom={profile?.nom ?? user.user_metadata?.nom}
      email={user.email}
      isAdmin
      area="Admin"
    >
      {children}
    </AppShell>
  );
}
