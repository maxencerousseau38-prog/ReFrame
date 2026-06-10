"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowsClockwise,
  SquaresFour,
  Sparkle,
  MagicWand,
  Gear,
  Lifebuoy,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { label: "Result", href: "/result", icon: Sparkle },
  { label: "AI Editor", href: "/editor", icon: MagicWand },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/8 bg-white/[0.02] p-4 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <ArrowsClockwise weight="bold" className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">SiteRevive</span>
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

        <div className="flex flex-col gap-1 border-t border-white/8 pt-4">
          <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
            <Gear weight="bold" className="h-[18px] w-[18px]" /> Settings
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
            <Lifebuoy weight="bold" className="h-[18px] w-[18px]" /> Support
          </Link>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
