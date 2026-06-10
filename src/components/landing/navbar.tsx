"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-white/8 bg-background/80 backdrop-blur-xl" : "border-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <ArrowsClockwise weight="bold" className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">SiteRevive</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Start free</Button>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
