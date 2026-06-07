import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Globe,
  Hash,
  Users2,
  CalendarDays,
  Clock,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Rocket,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Percent,
  Sparkles,
  Building2,
  Banknote,
  Brain,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { Panel } from "@/components/ui/Panel";
import { Reveal, Delta } from "@/components/ui/Reveal";
import { CriterionCard } from "@/components/app/CriterionCard";
import { CompanyActions } from "@/components/app/FollowButton";
import {
  GrowthChart,
  ProfitabilityChart,
  ValuationChart,
  RevenueDonut,
  CompetitorChart,
  CriteriaRadar,
} from "@/components/charts/Charts";
import { COMPANIES, getCompany } from "@/lib/data";
import { CRITERION_ORDER } from "@/lib/scoring";
import { eur, pct } from "@/lib/utils";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ id: c.id }));
}

export default function CompanyPage({ params }: { params: { id: string } }) {
  const company = getCompany(params.id);
  if (!company) notFound();

  const m = company.metrics;
  const orderedCriteria = CRITERION_ORDER.map(
    (k) => company.criteria.find((c) => c.key === k)!,
  );

  return (
    <AppShell>
      {/* Breadcrumb */}
      <Reveal>
        <nav className="mb-4 flex items-center gap-1.5 text-2xs text-mist-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <span>/</span>
          <Link href="/history" className="hover:text-white">Analyses</Link>
          <span>/</span>
          <span className="text-mist-200">{company.name}</span>
        </nav>
      </Reveal>

      {/* ───────────────── Hero header ───────────────── */}
      <Reveal>
        <header className="surface relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-2xl font-semibold tracking-wide text-accent-soft shadow-card">
                {company.logo}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {company.name}
                  </h1>
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-2xs text-mist-300">
                    {company.stage}
                  </span>
                </div>
                <p className="mt-1.5 max-w-xl text-sm text-mist-300">{company.tagline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-mist-400">
                  <Meta icon={Building2}>{company.sector}</Meta>
                  <Meta icon={MapPin}>{company.location}</Meta>
                  <Meta icon={Globe}>{company.website}</Meta>
                  <Meta icon={Hash}>{company.siren}</Meta>
                  <Meta icon={CalendarDays}>Fondée {company.founded}</Meta>
                  <Meta icon={Users2}>{company.headcount} collaborateurs</Meta>
                </div>
                <div className="mt-4">
                  <CompanyActions />
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={company.score} size={184} />
              <VerdictBadge verdict={company.verdict} />
              <div className="flex items-center gap-1.5 text-2xs text-mist-400">
                <span>30 derniers jours</span>
                <Delta value={company.trend} />
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      {/* ───────────────── Headline metrics ───────────────── */}
      <Reveal delay={0.05}>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="Revenu" value={eur(m.revenue)} sub={pct(m.revenueGrowth, true)} good />
          <Metric label="Marge EBITDA" value={pct(m.ebitdaMargin)} sub={m.ebitdaMargin >= 0 ? "Positive" : "Négative"} good={m.ebitdaMargin >= 0} />
          <Metric label="Marge nette" value={pct(m.netMargin)} sub={m.netMargin >= 0 ? "Rentable" : "Pré-rentabilité"} good={m.netMargin >= 0} />
          <Metric label="Trésorerie" value={eur(m.cash)} sub={`Dette ${eur(m.debt)}`} />
          <Metric label="Runway" value={m.runwayMonths >= 900 ? "∞" : `${m.runwayMonths} m`} sub={m.runwayMonths >= 24 || m.runwayMonths >= 900 ? "Confortable" : "À surveiller"} good={m.runwayMonths >= 24 || m.runwayMonths >= 900} />
          <Metric label="Valorisation" value={eur(m.valuation)} sub={`${(m.valuation / m.revenue).toFixed(1)}x rev.`} accent />
        </div>
      </Reveal>

      {/* ───────────────── Executive summary ───────────────── */}
      <Reveal delay={0.05}>
        <div className="mt-8">
          <SectionTitle icon={Sparkles} kicker="Résumé exécutif" title="Comprenez l'entreprise en 30 secondes" badge="Lecture : 1 min" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-3" title="Ce qu'il faut savoir" icon={Lightbulb}>
              <p className="text-sm leading-relaxed text-mist-200">{company.summary.whatToKnow}</p>
            </Panel>

            <SummaryList icon={ThumbsUp} title="Pourquoi investir" items={company.summary.whyInvest} tone="good" />
            <SummaryList icon={ThumbsDown} title="Pourquoi ne pas investir" items={company.summary.whyNot} tone="bad" />

            <div className="space-y-4">
              <Panel title="Risque principal" icon={AlertTriangle}>
                <p className="text-sm leading-relaxed text-mist-200">{company.summary.keyRisk}</p>
              </Panel>
              <Panel title="Potentiel estimé" icon={Rocket}>
                <p className="text-sm leading-relaxed text-mist-200">{company.summary.upside}</p>
              </Panel>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ───────────────── AI analysis cards ───────────────── */}
      <div className="mt-10">
        <SectionTitle icon={Brain} kicker="Analyse IA" title="Sept piliers notés sur 100" badge={`Score global ${company.score}`} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orderedCriteria.map((c, i) => (
            <CriterionCard key={c.key} c={c} index={i} />
          ))}
          {/* Radar summary card */}
          <Reveal delay={0.1} className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <Panel title="Profil global" className="h-full">
              <CriteriaRadar data={orderedCriteria} />
            </Panel>
          </Reveal>
        </div>
      </div>

      {/* ───────────────── Visualizations ───────────────── */}
      <div className="mt-10">
        <SectionTitle icon={LineChartIcon} kicker="Visualisations" title="Données financières" badge="Terminal-grade" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Panel title="Croissance — Revenu & EBITDA" subtitle="€M par exercice" icon={LineChartIcon}>
              <GrowthChart data={company.financials} />
            </Panel>
          </Reveal>
          <Reveal delay={0.05}>
            <Panel title="Évolution de la rentabilité" subtitle="Marges en %" icon={Percent}>
              <ProfitabilityChart data={company.financials} />
            </Panel>
          </Reveal>
          <Reveal>
            <Panel title="Évolution de la valorisation" subtitle="Valeur d'entreprise estimée" icon={LineChartIcon}>
              <ValuationChart data={company.financials} />
            </Panel>
          </Reveal>
          <Reveal delay={0.05}>
            <Panel title="Répartition du chiffre d'affaires" subtitle="Mix de revenu" icon={PieChartIcon}>
              <RevenueDonut data={company.revenueSegments} />
            </Panel>
          </Reveal>
        </div>
      </div>

      {/* ───────────────── Competitors ───────────────── */}
      <Reveal>
        <div className="mt-10">
          <SectionTitle icon={Building2} kicker="Benchmark" title="Comparaison concurrentielle" badge="Positionnement marché" />
          <div className="grid gap-4 lg:grid-cols-5">
            <Panel className="lg:col-span-3" title="Revenu vs. concurrents" subtitle="€M">
              <CompetitorChart data={company.competitors} />
            </Panel>
            <Panel className="lg:col-span-2" title="Tableau comparatif">
              <CompetitorTable company={company} />
            </Panel>
          </div>
        </div>
      </Reveal>

      {/* ───────────────── Funding & management ───────────────── */}
      <Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Panel title="Levées de fonds" subtitle="Historique de financement" icon={Banknote}>
            <ol className="relative ml-1 space-y-5 border-l border-white/[0.08] pl-5">
              {company.funding.map((f) => (
                <li key={f.date} className="relative">
                  <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border-2 border-ink-850 bg-accent shadow-glow" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{f.stage}</p>
                    <p className="num text-sm font-semibold text-bull">{eur(f.amount)}</p>
                  </div>
                  <p className="text-2xs text-mist-400">
                    {f.date} · Lead : {f.leadInvestor}
                    {f.valuation ? ` · Valo ${eur(f.valuation)}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Management" subtitle="Équipe dirigeante" icon={Users2}>
            <ul className="space-y-3">
              {company.management.map((p) => (
                <li key={p.name} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mist-300 to-mist-500 text-2xs font-bold text-ink-900">
                    {p.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-2xs font-medium text-accent-soft">{p.role}</p>
                    <p className="mt-0.5 text-2xs text-mist-400">{p.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Reveal>

      {/* Disclaimer */}
      <p className="mt-10 text-center text-2xs text-mist-500">
        Analyse générée par le moteur Valoryx · Investment Score™ propriétaire · Fournie à titre informatif, ne constitue pas un conseil en investissement.
      </p>
    </AppShell>
  );
}

function Meta({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function Metric({ label, value, sub, good, accent }: { label: string; value: string; sub?: string; good?: boolean; accent?: boolean }) {
  return (
    <div className="surface p-4">
      <p className="eyebrow">{label}</p>
      <p className="num mt-1.5 text-xl font-semibold tracking-tight text-white">{value}</p>
      {sub && (
        <p className={`num mt-0.5 text-2xs ${accent ? "text-accent-soft" : good ? "text-bull" : "text-mist-400"}`}>{sub}</p>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, kicker, title, badge }: { icon: any; kicker: string; title: string; badge?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <p className="eyebrow flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-accent-soft" />
          {kicker}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">{title}</h2>
      </div>
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-2xs text-mist-300">
          <Clock className="h-3 w-3" />
          {badge}
        </span>
      )}
    </div>
  );
}

function SummaryList({ icon: Icon, title, items, tone }: { icon: any; title: string; items: string[]; tone: "good" | "bad" }) {
  const color = tone === "good" ? "text-bull" : "text-bear";
  const dot = tone === "good" ? "bg-bull" : "bg-bear";
  return (
    <Panel title={title} icon={Icon}>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5 text-sm text-mist-200">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CompetitorTable({ company }: { company: (typeof COMPANIES)[number] }) {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-mist-400">
            <th className="pb-2 font-medium">Société</th>
            <th className="pb-2 text-right font-medium">Croiss.</th>
            <th className="pb-2 text-right font-medium">Valo</th>
          </tr>
        </thead>
        <tbody>
          {company.competitors.map((c) => (
            <tr key={c.name} className={`border-t border-white/[0.05] ${c.isSelf ? "text-white" : "text-mist-300"}`}>
              <td className="py-2.5 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  {c.isSelf && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-glow" />
                  )}
                  {c.name}
                </span>
              </td>
              <td className="num py-2.5 text-right text-bull">{pct(c.growth, true)}</td>
              <td className="num py-2.5 text-right">{eur(c.valuation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
