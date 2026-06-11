import { cn } from "@/lib/utils";

/**
 * ReFrame mark. Two offset rounded frames: an outlined "old" frame and a filled
 * accent "new" frame shifted out of it — the literal act of re-framing. No
 * sliders, equalizers, gauges or gears. Reads at 16px.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      {/* old frame (outline) */}
      <rect
        x="3.25"
        y="3.25"
        width="13"
        height="13"
        rx="3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.45"
      />
      {/* new frame (filled accent), shifted down-right = transformed */}
      <rect x="8.5" y="8.5" width="12.25" height="12.25" rx="3.25" fill="hsl(var(--accent))" />
    </svg>
  );
}

/** Full wordmark lockup. */
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 ring-1 ring-inset ring-white/10">
        <LogoMark className={cn("h-[18px] w-[18px]", light ? "text-neutral-900" : "text-white")} />
      </span>
      <span className={cn("text-[15px] font-semibold tracking-tight", light ? "text-neutral-900" : "text-white")}>
        ReFrame
      </span>
    </span>
  );
}
