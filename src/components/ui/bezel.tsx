import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Double-bezel (Doppelrand) container. An outer shell holds an inner core with
 * concentric radii, so cards read like a glass plate seated in a machined tray
 * rather than a flat div on the page. (high-end-visual-design, Section 4.A)
 */
export function Bezel({
  className,
  innerClassName,
  children,
}: {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] bg-white/[0.04] p-2 ring-1 ring-inset ring-white/10",
        className
      )}
    >
      <div
        className={cn(
          "bezel-core h-full rounded-[1.5rem] bg-card",
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
