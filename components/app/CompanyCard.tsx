import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Company } from "@/lib/types";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { Delta } from "@/components/ui/Reveal";
import { Sparkline } from "@/components/ui/Sparkline";
import { scoreColor } from "@/lib/scoring";
import { eur, pct } from "@/lib/utils";

export function CompanyCard({ company, rank }: { company: Company; rank?: number }) {
  const spark = company.financials.map((f) => f.revenue);
  return (
    <Link
      href={`/company/${company.id}`}
      className="group surface surface-hover flex items-center gap-4 p-4"
    >
      {rank != null && (
        <span className="num w-5 shrink-0 text-center text-sm font-semibold text-mist-400">
          {rank}
        </span>
      )}
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-ink-700 to-ink-800 text-xl text-accent-soft">
        {company.logo}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">{company.name}</p>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-mist-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="truncate text-2xs text-mist-400">{company.sector}</p>
      </div>

      <div className="hidden sm:block">
        <Sparkline data={spark} color={company.trend >= 0 ? "#2fd180" : "#ff5d6c"} />
      </div>

      <div className="hidden w-24 text-right md:block">
        <p className="num text-sm font-semibold text-white">{eur(company.metrics.revenue)}</p>
        <p className="num text-2xs text-bull">{pct(company.metrics.revenueGrowth, true)}</p>
      </div>

      <div className="flex w-[120px] shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <span
            className="num text-base font-semibold"
            style={{ color: scoreColor(company.score) }}
          >
            {company.score}
          </span>
          <Delta value={company.trend} />
        </div>
        <VerdictBadge verdict={company.verdict} size="sm" />
      </div>
    </Link>
  );
}
