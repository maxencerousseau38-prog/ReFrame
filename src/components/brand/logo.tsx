import { cn } from "@/lib/utils";

/**
 * ReFrame mark — the brand "R" monogram. Served as a trimmed, transparent PNG
 * (white) so it sits cleanly on the dark UI at any size.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/reframe-mark.png"
      alt="ReFrame"
      width={28}
      height={28}
      className={cn("h-7 w-auto select-none", className)}
      draggable={false}
    />
  );
}

/** Full wordmark lockup: the R monogram + the ReFrame wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className="h-[26px]" />
      <span className="text-[15px] font-semibold tracking-tight text-white">ReFrame</span>
    </span>
  );
}
