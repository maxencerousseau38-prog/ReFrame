"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Sparkle,
  MagicWand,
  FolderSimple,
  Tray,
  SignOut,
  CircleNotch,
  List,
  SidebarSimple,
} from "@phosphor-icons/react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/lib/use-persistent-state";
import { useDash } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/landing/language-switcher";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui";

const NAV_META = [
  { href: "/dashboard", icon: SquaresFour },
  { href: "/dashboard/sites", icon: FolderSimple },
  { href: "/dashboard/leads", icon: Tray },
  { href: "/result", icon: Sparkle },
  { href: "/editor", icon: MagicWand },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const d = useDash();
  const nav = NAV_META.map((n, i) => ({ ...n, label: d.nav[i] }));
  const [email, setEmail] = React.useState<string | null>(null);
  const [verified, setVerified] = React.useState(true);
  const [loaded, setLoaded] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const [resent, setResent] = React.useState<"idle" | "sending" | "sent">("idle");
  const [navOpen, setNavOpen] = React.useState(false);
  // UX3: professional collapsible rail — icons-only ↔ open, persisted. A hidden
  // label reserves no space; the flex-1 <main> reclaims it for the preview.
  const [collapsed, setCollapsed] = usePersistentState("rf-nav-collapsed", false);

  // Close the mobile sheet whenever the route changes.
  React.useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setEmail(d.user?.email ?? null);
        setVerified(d.user ? Boolean(d.user.emailVerified) : true);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function resendVerification() {
    setResent("sending");
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setResent("sent");
    } catch {
      setResent("idle");
    }
  }

  async function logout() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const renderNav = (onNavigate?: () => void, rail = false) => (
    <nav className="mt-4 flex flex-1 flex-col gap-1">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={rail ? item.label : undefined}
            aria-label={rail ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-fast ease-premium",
              rail ? "justify-center px-0" : "px-3",
              active ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon weight="bold" className="h-[18px] w-[18px] shrink-0" />
            {!rail && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const renderAccount = (rail = false) =>
    !loaded ? (
      <div className={cn("flex h-10 items-center text-zinc-600", rail ? "justify-center" : "px-3")}>
        <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
      </div>
    ) : email ? (
      <div className={cn("flex items-center gap-2 py-2", rail ? "justify-center px-0" : "justify-between px-3")}>
        {!rail && (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">{email}</p>
            <p className="text-[11px] text-zinc-500">{d.signedIn}</p>
          </div>
        )}
        <button
          onClick={logout}
          disabled={signingOut}
          aria-label="Sign out"
          title={rail ? email : undefined}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          {signingOut ? (
            <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
          ) : (
            <SignOut weight="bold" className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    ) : (
      <Link
        href="/login"
        title={rail ? d.signIn : undefined}
        aria-label={rail ? d.signIn : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg py-2 text-sm font-medium text-accent hover:bg-white/5",
          rail ? "justify-center px-0" : "px-3"
        )}
      >
        <SignOut weight="bold" className="h-[18px] w-[18px] rotate-180 shrink-0" /> {!rail && d.signIn}
      </Link>
    );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — collapsible rail (UX3). Width animates; a hidden
          label reserves no space, so <main> (and the preview) reclaim it. */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl transition-[width] duration-base ease-premium lg:flex",
          collapsed ? "lg:w-[68px]" : "lg:w-60"
        )}
      >
        <div className={cn("flex items-center py-2", collapsed ? "justify-center" : "justify-between px-1")}>
          {!collapsed && (
            <Link href="/" className="min-w-0 truncate">
              <Logo />
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SidebarSimple weight="bold" className="h-[18px] w-[18px]" />
          </button>
        </div>
        {renderNav(undefined, collapsed)}
        {!collapsed && (
          <div className="mb-1 flex justify-start px-1">
            <LanguageSwitcher />
          </div>
        )}
        <div className="border-t border-white/8 pt-3">{renderAccount(collapsed)}</div>
      </aside>

      <main className="min-w-0 flex-1">
        {/* Mobile top bar + Sheet menu (below lg) */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <List weight="bold" className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Link href="/" className="px-2 py-1" onClick={() => setNavOpen(false)}>
                <Logo />
              </Link>
              {renderNav(() => setNavOpen(false))}
              <div className="flex justify-start px-1">
                <LanguageSwitcher />
              </div>
              <div className="border-t border-white/8 pt-4">{renderAccount()}</div>
            </SheetContent>
          </Sheet>
        </div>

        {loaded && email && !verified && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/[0.06] px-6 py-2.5 text-[13px]">
            <span className="text-amber-200/90">{d.verifyMsg}</span>
            <button
              onClick={resendVerification}
              disabled={resent !== "idle"}
              className="font-medium text-amber-200 underline-offset-2 hover:underline disabled:no-underline disabled:opacity-70"
            >
              {resent === "sent" ? d.verifySent : resent === "sending" ? d.verifySending : d.verifyResend}
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
