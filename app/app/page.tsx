"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout, type User } from "@/lib/auth";
import { META, type ViewId } from "@/lib/appData";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { DashboardView } from "@/components/app/DashboardView";
import { ProspectsView } from "@/components/app/ProspectsView";
import { StockView } from "@/components/app/StockView";
import { PlaceholderView } from "@/components/app/PlaceholderView";

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewId>("dashboard");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <DashboardView user={user} />;
      case "prospects":
        return <ProspectsView />;
      case "stock":
        return <StockView />;
      case "rdv":
        return <PlaceholderView icon="calendar" title="Agenda des rendez-vous" text="Planifiez essais, reprises et signatures au même endroit." />;
      case "ventes":
        return <PlaceholderView icon="trending" title="Suivi des ventes" text="Retrouvez ici vos contrats, marges et objectifs mensuels." />;
      case "documents":
        return <PlaceholderView icon="file" title="Coffre documentaire" text="Centralisez contrats, factures et cartes grises en un seul endroit." />;
      case "analyses":
        return <PlaceholderView icon="chart" title="Analyses avancées" text="Mesurez vos performances commerciales en temps réel." />;
      case "parametres":
        return <PlaceholderView icon="settings" title="Paramètres" text="Personnalisez votre espace DriveOS et votre équipe." />;
    }
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar
        active={view}
        onSelect={setView}
        user={user}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onLogout={onLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={META[view].title}
          subtitle={META[view].subtitle}
          onMenu={() => setNavOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
