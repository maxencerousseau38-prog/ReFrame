"use client";

import * as React from "react";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Checkbox — a monochrome, glass-language checkbox on a NATIVE input
 * (zero new dependency; the real input stays focusable/checkable for AT,
 * visually hidden under the styled box).
 *
 * Distilled from a sign-in page's "keep me signed in" row (intake #003) — the
 * library had no checkbox at all. Checked = silver fill (#F5F5F5) with a
 * near-black check, per the V3 primary language. Label optional, clickable.
 *
 * Universal: auth ("keep me signed in"), settings toggles-lists, publish
 * options (visibility), wizard confirmations, bulk-select in dashboards.
 */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "group inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground/90",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-white/16 bg-white/[0.04] transition-colors duration-fast ease-premium checked:border-transparent checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
            {...props}
          />
          <Check
            weight="bold"
            aria-hidden
            className="pointer-events-none relative h-3 w-3 text-primary-foreground opacity-0 transition-opacity duration-fast ease-premium peer-checked:opacity-100"
          />
        </span>
        {label != null && <span>{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
