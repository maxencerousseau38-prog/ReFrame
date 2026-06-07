"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Command, Bell, Plus } from "lucide-react";

export function Topbar({ title }: { title?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/[0.06] bg-ink-950/70 px-5 py-3 backdrop-blur-xl">
      {title && (
        <h1 className="hidden text-sm font-semibold text-white md:block">{title}</h1>
      )}

      <form
        className="group relative ml-auto flex w-full max-w-md items-center"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/analyze?q=${encodeURIComponent(q)}`);
        }}
      >
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-mist-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher ou analyser une entreprise…"
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2 pl-9 pr-16 text-sm text-white placeholder:text-mist-400 outline-none transition-colors focus:border-accent/40 focus:bg-white/[0.05]"
        />
        <kbd className="num pointer-events-none absolute right-2.5 hidden items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-2xs text-mist-400 sm:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </form>

      <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-mist-300 transition-colors hover:text-white">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />
      </button>

      <Link
        href="/analyze"
        className="hidden items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-95 sm:flex"
      >
        <Plus className="h-4 w-4" />
        Analyser
      </Link>
    </header>
  );
}
