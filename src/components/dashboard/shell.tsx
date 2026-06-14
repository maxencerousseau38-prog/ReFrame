"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Sparkle,
  MagicWand,
  FolderSimple,
  SignOut,
  CircleNotch,
} from "@phosphor-icons/react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { label: "My sites", href: "/dashboard/sites", icon: FolderSimple },
  { label: "Result", href: "/result", icon: Sparkle },
  { label: "AI Editor", href: "/editor", icon: MagicWand },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = React.useState<string | null>(null);
  const [verified, setVerified] = React.useState(true);
  const [loaded, setLoaded] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const [resent, setResent] = React.useState<"idle" | "sending" | "sent">("idle");

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

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl lg:flex">
        <Link href="/" className="px-2 py-3">
          <Logo />
        </Link>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-white/8 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon weight="bold" className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 pt-4">
          {!loaded ? (
            <div className="flex h-10 items-center px-3 text-zinc-600">
              <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
            </div>
          ) : email ? (
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-white">{email}</p>
                <p className="text-[11px] text-zinc-500">Signed in</p>
              </div>
              <button
                onClick={logout}
                disabled={signingOut}
                aria-label="Sign out"
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
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-white/5"
            >
              <SignOut weight="bold" className="h-[18px] w-[18px] rotate-180" /> Sign in
            </Link>
          )}
        </div>
      </aside>

      <main className="flex-1">
        {loaded && email && !verified && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/[0.06] px-6 py-2.5 text-[13px]">
            <span className="text-amber-200/90">
              Confirm your email to secure your account.
            </span>
            <button
              onClick={resendVerification}
              disabled={resent !== "idle"}
              className="font-medium text-amber-200 underline-offset-2 hover:underline disabled:no-underline disabled:opacity-70"
            >
              {resent === "sent" ? "Verification sent" : resent === "sending" ? "Sending." : "Resend email"}
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
