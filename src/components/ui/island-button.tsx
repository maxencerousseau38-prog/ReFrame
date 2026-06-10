"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Variant = "accent" | "light" | "glass";

const shell: Record<Variant, string> = {
  accent: "bg-accent text-accent-foreground hover:brightness-105",
  light: "bg-white text-neutral-950 hover:bg-white/90",
  glass: "bg-white/5 text-white ring-1 ring-inset ring-white/15 hover:bg-white/10",
};

const knob: Record<Variant, string> = {
  accent: "bg-black/10",
  light: "bg-black/10",
  glass: "bg-white/10",
};

/**
 * Island CTA: a pill whose trailing icon lives in its own circular knob,
 * with magnetic internal motion on hover and a physical press.
 * (high-end-visual-design 4.B + 5.B)
 */
export function IslandButton({
  children,
  href,
  onClick,
  variant = "accent",
  type = "button",
  className,
  disabled,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const content = (
    <span
      className={cn(
        "group inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-2 text-[15px] font-medium transition-[transform,filter,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50",
        shell[variant],
        className
      )}
    >
      {children}
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
          knob[variant]
        )}
      >
        <ArrowRight weight="bold" className="h-4 w-4" />
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-flex disabled:pointer-events-none">
      {content}
    </button>
  );
}
