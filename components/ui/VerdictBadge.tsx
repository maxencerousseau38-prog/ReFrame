import { cn } from "@/lib/utils";
import { VERDICT_META } from "@/lib/scoring";
import type { Verdict } from "@/lib/types";

export function VerdictBadge({
  verdict,
  size = "md",
}: {
  verdict: Verdict;
  size?: "sm" | "md";
}) {
  const meta = VERDICT_META[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-medium",
        meta.bg,
        meta.text,
        size === "sm" ? "px-2.5 py-1 text-2xs" : "px-3.5 py-1.5 text-xs",
      )}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.ring, boxShadow: `0 0 8px ${meta.ring}` }}
      />
      {meta.label}
    </span>
  );
}
