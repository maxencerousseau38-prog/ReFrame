import { History } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CompanyCard } from "@/components/app/CompanyCard";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANIES } from "@/lib/data";

export default function HistoryPage() {
  return (
    <AppShell title="Historique">
      <Reveal>
        <div className="mb-6">
          <p className="eyebrow flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-accent-soft" />
            Vos analyses
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Historique d'analyses
          </h1>
          <p className="mt-1 text-sm text-mist-400">
            {COMPANIES.length} entreprises analysées · triées par Investment Score™
          </p>
        </div>
      </Reveal>
      <div className="space-y-2.5">
        {[...COMPANIES]
          .sort((a, b) => b.score - a.score)
          .map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <CompanyCard company={c} rank={i + 1} />
            </Reveal>
          ))}
      </div>
    </AppShell>
  );
}
