"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

/** Liste de navigation latérale avec état actif (réutilisée dashboard + admin). */
export function SidebarNav({
  items,
  onNavigate,
}: {
  items: readonly NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        // Actif si correspondance exacte, ou sous-route (sauf racine du groupe).
        const isRoot = item.href === "/dashboard" || item.href === "/admin";
        const active = isRoot
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon
              name={item.icon}
              className={cn("size-4", active ? "text-brand" : "text-muted-foreground")}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
