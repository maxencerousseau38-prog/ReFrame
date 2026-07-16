import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * LabeledDivider — a hairline rule with a centered, quiet label.
 * ("or continue with", "or", "advanced"…)
 *
 * Distilled from a sign-in page (intake #003). Semantic: role="separator".
 * The label sits on a background chip so the hairline never strikes through it.
 *
 * Universal: auth forms, settings groups, wizard steps, pricing dividers.
 */
export interface LabeledDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
}

function LabeledDivider({ label, className, ...props }: LabeledDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("relative flex items-center justify-center", className)}
      {...props}
    >
      <span aria-hidden className="h-px w-full bg-white/8" />
      <span className="absolute bg-background px-3.5 text-[13px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export { LabeledDivider };
