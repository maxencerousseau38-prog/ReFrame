import { cn } from "@/lib/utils";

type Tone = "neutral" | "warn" | "success" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  warn: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  danger: "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400",
};

const DOT_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  warn: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
};

/** Pastille de statut colorée (site, abonnement…). */
export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_CLASSES[tone])} />
      {label}
    </span>
  );
}
