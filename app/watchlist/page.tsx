import Link from "next/link";
import {
  Eye,
  Banknote,
  FileBarChart,
  AlertTriangle,
  Gauge,
  Bell,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { Reveal, Delta } from "@/components/ui/Reveal";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { Sparkline } from "@/components/ui/Sparkline";
import { WATCHLIST } from "@/lib/watchlist";
import { getCompany } from "@/lib/data";
import { scoreColor } from "@/lib/scoring";
import { eur, pct } from "@/lib/utils";
import type { Alert } from "@/lib/types";

const ALERT_ICON = {
  funding: Banknote,
  results: FileBarChart,
  risk: AlertTriangle,
  score: Gauge,
} as const;

export default function WatchlistPage() {
  const items = WATCHLIST.map((w) => ({ ...w, company: getCompany(w.companyId)! }));

  return (
    <AppShell title="Watchlist">
      <Reveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-accent-soft" />
              Suivi intelligent
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Votre watchlist
            </h1>
            <p className="mt-1 text-sm text-mist-400">
              Variations de score, financements, résultats et risques détectés en temps réel.
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-2xs text-mist-300 sm:flex">
            <Bell className="h-3.5 w-3.5 text-accent-soft" />
            Alertes IA activées
          </span>
        </div>
      </Reveal>

      <div className="space-y-4">
        {items.map((w, i) => {
          const c = w.company;
          const spark = c.financials.map((f) => f.revenue);
          return (
            <Reveal key={c.id} delay={i * 0.05}>
              <div className="surface overflow-hidden">
                <div className="grid gap-5 p-5 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
                  {/* Left: company + metrics */}
                  <div className="flex items-center gap-5">
                    <div className="hidden sm:block">
                      <ScoreRing score={c.score} size={104} stroke={8} label="" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-ink-700 to-ink-800 text-xs font-semibold tracking-wide text-accent-soft">
                          {c.logo}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/company/${c.id}`} className="block truncate text-base font-semibold text-white hover:underline">
                            {c.name}
                          </Link>
                          <p className="truncate text-2xs text-mist-400">{c.sector}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <Mini label="Score" value={`${c.score}`} color={scoreColor(c.score)} delta={w.scoreDelta} />
                        <Mini label="Revenu" value={eur(c.metrics.revenue)} sub={pct(c.metrics.revenueGrowth, true)} />
                        <Mini label="Valo" value={eur(c.metrics.valuation)} />
                        <div className="hidden md:block">
                          <Sparkline data={spark} color={w.scoreDelta >= 0 ? "#2fd180" : "#ff5d6c"} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <VerdictBadge verdict={c.verdict} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Right: alerts */}
                  <div className="border-white/[0.06] lg:border-l lg:pl-8">
                    <p className="eyebrow mb-2.5">Alertes récentes</p>
                    <ul className="space-y-2.5">
                      {w.alerts.map((a) => (
                        <AlertRow key={a.id} alert={a} />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </AppShell>
  );
}

function Mini({ label, value, sub, color, delta }: { label: string; value: string; sub?: string; color?: string; delta?: number }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="num text-base font-semibold" style={{ color: color ?? "#fff" }}>
          {value}
        </span>
        {delta != null && <Delta value={delta} />}
        {sub && <span className="num text-2xs text-bull">{sub}</span>}
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  const Icon = ALERT_ICON[alert.type];
  const tone =
    alert.tone === "positive"
      ? "text-bull border-bull/25 bg-bull/10"
      : alert.tone === "negative"
        ? "text-bear border-bear/25 bg-bear/10"
        : "text-gold border-gold/25 bg-gold/10";
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white">{alert.title}</p>
        <p className="text-2xs text-mist-400">{alert.detail}</p>
        <p className="mt-0.5 text-2xs text-mist-500">{alert.at}</p>
      </div>
    </li>
  );
}
