"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Faders, List, X } from "@phosphor-icons/react";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div className="w-full max-w-3xl">
        {/* Fluid island: a floating glass pill detached from the top edge */}
        <nav className="flex h-14 items-center justify-between rounded-full border border-white/10 bg-black/40 pl-5 pr-2 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Faders weight="bold" className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">ReFrame</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-[13px] text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-neutral-950 transition-transform duration-200 ease-out active:scale-95"
            >
              Start free
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {open ? <X weight="bold" className="h-5 w-5" /> : <List weight="bold" className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 overflow-hidden rounded-3xl border border-white/10 bg-black/70 p-2 backdrop-blur-xl md:hidden"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-[15px] text-zinc-200 transition-colors hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
