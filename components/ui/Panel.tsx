import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  icon?: any;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-accent-soft">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div>
              {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
              {subtitle && <p className="text-2xs text-mist-400">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
