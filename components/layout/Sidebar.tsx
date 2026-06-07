"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Eye,
  Bell,
  History,
  Star,
  CreditCard,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Nouvelle analyse", icon: Sparkles, accent: true },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/alerts", label: "Alertes", icon: Bell, badge: 6 },
];

const LIBRARY = [
  { href: "/history", label: "Historique", icon: History },
  { href: "/favorites", label: "Favoris", icon: Star },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/60 px-3 py-4 backdrop-blur-xl lg:flex">
      <div className="px-2 py-1.5">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="mt-6 flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="mt-6">
        <p className="eyebrow px-3 pb-2">Bibliothèque</p>
        <nav className="flex flex-col gap-0.5">
          {LIBRARY.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <UpgradeCard />
        <nav className="flex flex-col gap-0.5">
          <NavLink href="/pricing" label="Abonnement" icon={CreditCard} active={isActive("/pricing")} />
          <NavLink href="/settings" label="Paramètres" icon={Settings} active={isActive("/settings")} />
        </nav>
        <UserChip />
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  accent,
  badge,
}: {
  href: string;
  label: string;
  icon: any;
  active?: boolean;
  accent?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
        active
          ? "bg-white/[0.06] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          : "text-mist-300 hover:bg-white/[0.03] hover:text-white",
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] transition-colors",
          active ? "text-accent-soft" : accent ? "text-accent-soft" : "text-mist-400 group-hover:text-mist-200",
        )}
      />
      <span className="flex-1 font-medium">{label}</span>
      {badge && (
        <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-accent/15 px-1.5 text-2xs font-semibold text-accent-soft">
          {badge}
        </span>
      )}
      {active && <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />}
    </Link>
  );
}

function UpgradeCard() {
  return (
    <Link
      href="/pricing"
      className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.12] to-transparent p-3.5"
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />
      <p className="text-xs font-semibold text-white">Passez à Investor</p>
      <p className="mt-1 text-2xs leading-relaxed text-mist-300">
        Analyses illimitées, alertes IA et valorisations avancées.
      </p>
      <span className="mt-2.5 inline-flex items-center gap-1 text-2xs font-semibold text-accent-soft">
        Découvrir
        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function UserChip() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-mist-300 to-mist-500 text-2xs font-bold text-ink-900">
        MR
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-white">Maxence R.</p>
        <p className="truncate text-2xs text-mist-400">Plan Pro</p>
      </div>
    </div>
  );
}
