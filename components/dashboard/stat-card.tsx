import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";

interface StatCardProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  className?: string;
}

export function StatCard({ icon, label, value, hint, href, className }: StatCardProps) {
  const inner = (
    <div
      className={cn(
        "group relative h-full rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon name={icon} className="size-4.5" />
        </span>
        {href && (
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
