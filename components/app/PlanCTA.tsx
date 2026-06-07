"use client";

import { ArrowRight, Check } from "lucide-react";
import { usePlan } from "@/components/app/PlanProvider";
import type { PlanId } from "@/lib/plan";
import { cn } from "@/lib/utils";

export function PlanCTA({
  id,
  label,
  highlight,
}: {
  id: PlanId;
  label: string;
  highlight?: boolean;
}) {
  const { plan, setPlan } = usePlan();
  const current = plan.id === id;

  return (
    <button
      onClick={() => !current && setPlan(id)}
      disabled={current}
      className={cn(
        "group mt-5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95",
        current
          ? "cursor-default border border-bull/30 bg-bull/10 text-bull"
          : highlight
            ? "bg-white text-ink-950 hover:scale-[1.02]"
            : "border border-white/[0.12] bg-white/[0.03] text-white hover:bg-white/[0.07]",
      )}
    >
      {current ? (
        <>
          <Check className="h-4 w-4" /> Plan actuel
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}
