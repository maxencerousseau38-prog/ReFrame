import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Eye,
  Bell,
  Flame,
  Trophy,
  Gem,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CompanyCard } from "@/components/app/CompanyCard";
import { StatCard } from "@/components/app/StatCard";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANIES } from "@/lib/data";
import { ALL_ALERTS } from "@/lib/watchlist";
import { getCompany } from "@/lib/data";
import { eur, pct } from "@/lib/utils";

export default function DashboardPage() {
  const byScore = [...COMPANIES].sort((a, b) => b.score - a.score);
  const byGrowth = [...COMPANIES].sort(
    (a, b) => b.metrics.revenueGrowth - a.metrics.revenueGrowth,
  );
  const opportunities = byScore.filter((c) => c.score >= 70);
  const avgScore = Math.round(
    COMPANIES.reduce((s, c) => s + c.score, 0) / COMPANIES.length,
  );

  // sector performance
  const sectors = aggregateSectors();

  return (
    <AppShell title="Dashboard">
      {/* Greeting */}
      <Reveal>
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Lundi · Marché ouvert</p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Bonjour Maxence
            </h1>
            <p className="mt-1 text-sm text-mist-400">
              Voici l'état de votre univers d'investissement aujourd'hui.
            </p>
          </div>
          <Link
            href="/analyze"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Nouvelle analyse
          </Link>
        </div>
      </Reveal>

      {/* KPIs */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Analyses ce mois" value="47" sub="+12 vs. mois dernier" tone="good" icon={Sparkles} />
          <StatCard label="Score moyen" value={`${avgScore}/100`} sub="Qualité du portefeuille" tone="accent" icon={TrendingUp} />
          <StatCard label="Entreprises suivies" value={`${COMPANIES.length}`} sub="Watchlist active" tone="neutral" icon={Eye} />
          <StatCard label="Alertes ouvertes" value={`${ALL_ALERTS.length}`} sub="3 nouvelles aujourd'hui" tone="good" icon={Bell} />
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          <ListSection
            icon={Trophy}
            title="Top entreprises du moment"
            href="/history"
            companies={byScore.slice(0, 4)}
            ranked
          />
          <ListSection
            icon={Gem}
            title="Meilleures opportunités détectées par l'IA"
            subtitle="Score ≥ 70 — thèses à fort potentiel"
            companies={opportunities.slice(0, 3)}
          />
          <ListSection
            icon={Flame}
            title="Croissance la plus forte"
            companies={byGrowth.slice(0, 3)}
          />
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Sector performance */}
          <Reveal delay={0.1}>
            <section className="surface p-5">
              <h2 className="text-sm font-semibold text-white">Secteurs les plus performants</h2>
              <div className="mt-4 space-y-3">
                {sectors.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-mist-200">{s.name}</span>
                      <span className="num font-semibold text-white">{s.avg}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent-soft"
                        style={{ width: `${s.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Attractive valuations */}
          <Reveal delay={0.15}>
            <section className="surface p-5">
              <h2 className="text-sm font-semibold text-white">Valorisations les plus attractives</h2>
              <p className="mt-1 text-2xs text-mist-400">Multiple revenu le plus faible</p>
              <div className="mt-4 space-y-2.5">
                {attractiveValuations().map((c) => (
                  <Link
                    key={c.id}
                    href={`/company/${c.id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/[0.04] text-2xs font-semibold tracking-wide text-accent-soft">
                        {c.logo}
                      </span>
                      <span className="text-xs font-medium text-white">{c.name}</span>
                    </div>
                    <span className="num text-xs text-mist-300">{c.multiple}x rev.</span>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Recent alerts */}
          <Reveal delay={0.2}>
            <section className="surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Alertes récentes</h2>
                <Link href="/alerts" className="text-2xs text-accent-soft hover:underline">
                  Tout voir
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                {ALL_ALERTS.slice(0, 4).map((a) => {
                  const co = getCompany(a.companyId);
                  const dot =
                    a.tone === "positive" ? "bg-bull" : a.tone === "negative" ? "bg-bear" : "bg-gold";
                  return (
                    <Link
                      key={a.id}
                      href={`/company/${a.companyId}`}
                      className="flex gap-2.5 rounded-lg p-2 transition-colors hover:bg-white/[0.04]"
                    >
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-white">{a.title}</p>
                        <p className="truncate text-2xs text-mist-400">
                          {co?.name} · {a.at}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </AppShell>
  );
}

function ListSection({
  icon: Icon,
  title,
  subtitle,
  href,
  companies,
  ranked,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  href?: string;
  companies: typeof COMPANIES;
  ranked?: boolean;
}) {
  return (
    <Reveal>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 text-accent-soft" />
            <div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              {subtitle && <p className="text-2xs text-mist-400">{subtitle}</p>}
            </div>
          </div>
          {href && (
            <Link href={href} className="group inline-flex items-center gap-1 text-2xs text-mist-300 hover:text-white">
              Voir tout
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        <div className="space-y-2.5">
          {companies.map((c, i) => (
            <CompanyCard key={c.id} company={c} rank={ranked ? i + 1 : undefined} />
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function aggregateSectors() {
  const map = new Map<string, number[]>();
  for (const c of COMPANIES) {
    const sector = c.sector.split("·")[0].trim();
    if (!map.has(sector)) map.set(sector, []);
    map.get(sector)!.push(c.score);
  }
  return Array.from(map.entries())
    .map(([name, scores]) => ({
      name,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);
}

function attractiveValuations() {
  return [...COMPANIES]
    .map((c) => ({ ...c, multiple: +(c.metrics.valuation / c.metrics.revenue).toFixed(1) }))
    .sort((a, b) => a.multiple - b.multiple)
    .slice(0, 4);
}
