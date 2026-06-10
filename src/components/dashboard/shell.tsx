"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, Wand2, Settings, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Result", href: "/result", icon: Sparkles },
  { label: "AI Editor", href: "/editor", icon: Wand2 },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-background">
      {/* ambient glow top-left */}
      <div className="pointer-events-none fixed left-0 top-0 -z-10 h-[400px] w-[500px] glow blur-[100px] opacity-40" />

      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/8 bg-white/[0.02] p-4 backdrop-blur-xl lg:flex">
        <Link href="/" className="flex items-center gap-2 px-2 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6366f1,#d946ef)] text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            SiteRevive<span className="text-neutral-500"> AI</span>
          </span>
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
                  active
                    ? "bg-white/8 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-white/8 pt-4">
          <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-white">
            <LifeBuoy className="h-4 w-4" /> Support
          </Link>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
