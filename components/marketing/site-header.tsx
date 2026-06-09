"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MARKETING_NAV } from "@/lib/constants";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass border-b border-border/60" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/connexion">Connexion</Link>
            </Button>
            <Button asChild size="sm" className="shadow-sm">
              <Link href="/inscription">Créer mon site</Link>
            </Button>
          </div>

          {/* Menu mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col p-6">
                <Logo className="mb-8" />
                <nav className="flex flex-col gap-1">
                  {MARKETING_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2 pt-6">
                  <Button asChild variant="outline">
                    <Link href="/connexion" onClick={() => setOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/inscription" onClick={() => setOpen(false)}>
                      Créer mon site
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
