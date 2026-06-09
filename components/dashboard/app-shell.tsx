"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SidebarNav, type NavItem } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface AppShellProps {
  items: readonly NavItem[];
  nom?: string | null;
  email?: string | null;
  isAdmin?: boolean;
  /** Étiquette affichée sous le logo (« Espace client » / « Admin »). */
  area?: string;
  children: React.ReactNode;
}

/** Coquille applicative : sidebar fixe (desktop) + barre + menu (mobile). */
export function AppShell({ items, nom, email, isAdmin, area, children }: AppShellProps) {
  const [open, setOpen] = React.useState(false);

  const SidebarBody = (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="px-2 py-3">
        <Logo href={isAdmin && area === "Admin" ? "/admin" : "/dashboard"} />
        {area && (
          <Badge variant="secondary" className="mt-2 text-[10px]">
            {area}
          </Badge>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav items={items} onNavigate={() => setOpen(false)} />
      </div>
      <div className="border-t border-border pt-2">
        <UserMenu nom={nom} email={email} isAdmin={isAdmin} />
      </div>
    </div>
  );

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-svh border-r border-border bg-card/40 lg:block">
        {SidebarBody}
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Barre mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          <Logo />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {SidebarBody}
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
