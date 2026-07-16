"use client";

import * as React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { GlassPillNav } from "@/components/ui/glass-pill-nav";

/**
 * EditorTopBar — the studio's single command bar (V3 monochrome).
 *
 * Architecture: identity cluster left (logo = back, project name + real save
 * status), the view pill center ("Aperçu" only — we ship no dead Code tab, U0),
 * and the action cluster right (undo/redo/share/publish, passed as children so
 * the page owns the behavior). Full-bleed studio: no dashboard rail around the
 * editor — the canvas is the hero.
 */
export interface EditorTopBarProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Right-side action cluster (undo/redo, share, publish…). */
  children?: React.ReactNode;
  /** Extra element in the left cluster (e.g. back-to-result). */
  leftExtra?: React.ReactNode;
  /** Center element. Defaults to the single real view pill ("Aperçu"). */
  center?: React.ReactNode;
}

export function EditorTopBar({ title, subtitle, children, leftExtra, center }: EditorTopBarProps) {
  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/8 bg-background/80 px-3 backdrop-blur-xl sm:px-4">
      {/* Identity */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Link
          href="/dashboard"
          title="Back to dashboard"
          aria-label="Back to dashboard"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-fast ease-premium hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoMark className="h-5" />
        </Link>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold leading-tight">{title}</div>
          {subtitle && (
            <div className="truncate text-[11px] leading-tight text-muted-foreground">{subtitle}</div>
          )}
        </div>
        {leftExtra}
      </div>

      {/* Center: the view pill by default (only the real view — a Code tab
          ships when code view exists), or a page-supplied switcher. */}
      <div className="hidden sm:block">
        {center ?? <GlassPillNav aria-label="Editor view" items={[{ label: "Aperçu", active: true }]} />}
      </div>

      {/* Actions */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">{children}</div>
    </header>
  );
}
