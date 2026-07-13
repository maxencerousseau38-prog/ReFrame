import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StatGroup — a row of headline metrics (value + label).
 *
 * Extracted from the same hero's stats block (1M+ / 50+ / 24/7). Rebuilt
 * monochrome: value in near-white with tabular figures, label in muted grey.
 * No colour, no gauge, no decoration — the number carries the meaning.
 *
 * Universal: landing social-proof, dashboard KPI row, result-page "why your new
 * site is better", pricing comparison headers.
 */
export interface Stat {
  value: React.ReactNode;
  label: React.ReactNode;
}

export interface StatGroupProps extends React.HTMLAttributes<HTMLDListElement> {
  items: Stat[];
  /** Column count at the sm+ breakpoint (2-4). Defaults to the number of items. */
  columns?: 2 | 3 | 4;
}

// Literal classes so Tailwind's static extractor keeps them. Mobile stacks.
const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

function StatGroup({ items, columns, className, ...props }: StatGroupProps) {
  const cols = columns ?? items.length;
  return (
    <dl
      className={cn("grid grid-cols-1 gap-8", COLS[cols] ?? "sm:grid-cols-3", className)}
      {...props}
    >
      {items.map((s, i) => (
        <div key={i} className="text-center">
          <dt className="sr-only">{s.label}</dt>
          <dd className="m-0">
            <span className="block text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              {s.value}
            </span>
            <span className="mt-1.5 block text-[13px] text-muted-foreground">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export { StatGroup };
