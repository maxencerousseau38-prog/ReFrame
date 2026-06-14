import * as React from "react";
import { LockSimple } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * A modern, minimal browser frame for product mockups — deliberately NOT the
 * macOS "traffic-light" three dots. A single live accent status dot, a clean
 * address field with a lock glyph, and one faint window control. Reused across
 * the marketing surface so every mock reads the same, current way.
 */
export function BrowserFrame({
  url,
  children,
  className,
  live = true,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
  live?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e10] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
          {live && (
            <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-accent/50 motion-safe:animate-ping" />
          )}
          <span className={cn("relative h-2 w-2 rounded-full", live ? "bg-accent" : "bg-zinc-600")} />
        </span>

        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 ring-1 ring-inset ring-white/[0.06]">
          <LockSimple weight="bold" className="h-3 w-3 shrink-0 text-zinc-500" />
          <span className="truncate font-mono text-[11px] text-zinc-400">{url}</span>
        </div>

        <span className="hidden h-3.5 w-3.5 shrink-0 rounded-[4px] border border-white/15 sm:block" />
      </div>
      {children}
    </div>
  );
}
