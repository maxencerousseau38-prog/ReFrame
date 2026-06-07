import Link from "next/link";
import {
  Bell,
  Banknote,
  FileBarChart,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Reveal } from "@/components/ui/Reveal";
import { ALL_ALERTS } from "@/lib/watchlist";
import { getCompany } from "@/lib/data";

const ICON = {
  funding: Banknote,
  results: FileBarChart,
  risk: AlertTriangle,
  score: Gauge,
} as const;

export default function AlertsPage() {
  return (
    <AppShell title="Alertes">
      <Reveal>
        <div className="mb-6">
          <p className="eyebrow flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-accent-soft" />
            Centre d'alertes
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Alertes intelligentes
          </h1>
          <p className="mt-1 text-sm text-mist-400">
            Signaux détectés par l'IA sur votre univers suivi.
          </p>
        </div>
      </Reveal>

      <div className="surface divide-y divide-white/[0.05]">
        {ALL_ALERTS.map((a, i) => {
          const co = getCompany(a.companyId);
          const Icon = ICON[a.type];
          const tone =
            a.tone === "positive"
              ? "text-bull border-bull/25 bg-bull/10"
              : a.tone === "negative"
                ? "text-bear border-bear/25 bg-bear/10"
                : "text-gold border-gold/25 bg-gold/10";
          return (
            <Reveal key={a.id} delay={i * 0.04}>
              <Link
                href={`/company/${a.companyId}`}
                className="flex items-start gap-4 p-4 transition-colors hover:bg-white/[0.03]"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{a.title}</p>
                    <span className="shrink-0 text-2xs text-mist-500">{a.at}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-mist-300">{a.detail}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-2xs text-mist-400">
                    <span className="font-semibold tracking-wide text-accent-soft">{co?.logo}</span>
                    {co?.name}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </AppShell>
  );
}
