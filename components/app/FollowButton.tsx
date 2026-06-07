"use client";

import { useState } from "react";
import { Eye, Check, Download, Lock } from "lucide-react";
import { usePlan } from "@/components/app/PlanProvider";

export function CompanyActions() {
  const [following, setFollowing] = useState(false);
  const { plan, openPaywall } = usePlan();
  const canExport = plan.features.pdfExport;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setFollowing((f) => !f)}
        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all active:scale-95 ${
          following
            ? "border-bull/30 bg-bull/10 text-bull"
            : "border-white/[0.1] bg-white/[0.03] text-white hover:bg-white/[0.07]"
        }`}
      >
        {following ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {following ? "Suivi" : "Suivre"}
      </button>
      <button
        onClick={() => canExport ? window.print() : openPaywall("pdfExport")}
        className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-95"
      >
        {canExport ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        Export PDF
      </button>
    </div>
  );
}
