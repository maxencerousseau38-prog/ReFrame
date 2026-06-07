import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Gauge,
  LineChart,
  ShieldCheck,
  Eye,
  Zap,
  FileText,
  Building2,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/Nav";
import { Logo } from "@/components/ui/Logo";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { Reveal } from "@/components/ui/Reveal";
import { COMPANIES } from "@/lib/data";
import { eur, pct } from "@/lib/utils";

const hero = COMPANIES[0];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:48px_48px] opacity-[0.35]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.14] blur-[140px]" />

      <MarketingNav />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pt-36 pb-20 sm:pt-44">
        <Reveal>
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-2xs text-mist-200">
            <Sparkles className="h-3.5 w-3.5 text-accent-soft" />
            Intelligence d'investissement propulsée par l'IA
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mx-auto mt-6 max-w-4xl text-center text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            L'analyse d'un fonds d'investissement,
            <br className="hidden sm:block" />
            <span className="text-gradient"> en moins de 60 secondes.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-mist-300 sm:text-lg">
            Valoryx transforme des dizaines de pages de données financières en une
            fiche d'investissement institutionnelle — score propriétaire, thèse,
            risques et valorisation. Sans tableur. Sans PDF de 80 pages.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/analyze"
              className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] active:scale-95"
            >
              Analyser une entreprise
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.07]"
            >
              Voir une démo
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-5 text-center text-2xs text-mist-400">
            Aucune carte requise · Données privées & publiques · Conçu pour fonds, business angels & entrepreneurs
          </p>
        </Reveal>

        {/* Hero product preview */}
        <Reveal delay={0.25}>
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute inset-x-10 -top-6 h-24 rounded-full bg-accent/20 blur-3xl" />
            <HeroPreview />
          </div>
        </Reveal>
      </section>

      {/* ───────────────────────── Logos / trust strip ─────────── */}
      <section className="relative border-y border-white/[0.06] bg-ink-900/30 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 text-2xs uppercase tracking-[0.18em] text-mist-400">
          <span>Ressenti d'un terminal Bloomberg</span>
          <span className="text-mist-600">·</span>
          <span>Profondeur de PitchBook</span>
          <span className="text-mist-600">·</span>
          <span>Clarté de Morningstar</span>
          <span className="text-mist-600">·</span>
          <span>Finition d'Apple</span>
        </div>
      </section>

      {/* ───────────────────────── Problem ──────────────────────── */}
      <section id="produit" className="relative mx-auto max-w-6xl px-5 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="eyebrow">Le problème</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Les investisseurs noient leurs décisions dans la donnée.
              </h2>
              <p className="mt-5 text-mist-300">
                Aujourd'hui, évaluer une entreprise signifie lire 30 à 100 pages de
                rapports, recouper des chiffres, modéliser une valorisation et
                espérer ne rien manquer. C'est lent, manuel et réservé à ceux qui
                ont un analyste sous la main.
              </p>
              <p className="mt-4 text-mist-300">
                Valoryx fait ce travail à votre place — et le restitue comme le ferait
                votre meilleur analyste, en un écran.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              <ProblemCard before icon={FileText} title="Avant" lines={["80 pages de PDF", "Tableurs manuels", "2–3 jours de travail", "Biais & angles morts"]} />
              <ProblemCard icon={Zap} title="Avec Valoryx" lines={["1 fiche visuelle", "Score propriétaire", "< 60 secondes", "7 dimensions notées"]} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── Features ─────────────────────── */}
      <section id="analyse" className="relative mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <div className="text-center">
            <p className="eyebrow">Ce que Valoryx analyse</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Sept dimensions, un seul Investment Score™
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Trust / CTA ──────────────────── */}
      <section id="confiance" className="relative mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-ink-850 to-ink-900 p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-[600px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Conçu pour engager plusieurs millions en confiance.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-mist-300">
              Fonds d'investissement, business angels, family offices et entrepreneurs
              utilisent Valoryx pour décider plus vite, mieux, et sans angle mort.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/analyze"
                className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] active:scale-95"
              >
                Lancer ma première analyse
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/[0.12] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.07]"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────────────────── Footer ───────────────────────── */}
      <footer className="relative border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <Logo />
          <p className="text-2xs text-mist-400">
            © {new Date().getFullYear()} Valoryx. Intelligence d'investissement. Les analyses sont fournies à titre informatif.
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative rounded-3xl border border-white/[0.08] bg-ink-900/70 p-2 shadow-elev backdrop-blur-xl">
      <div className="rounded-[1.4rem] border border-white/[0.05] bg-ink-850/80 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-3xl text-accent-soft">
              {hero.logo}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{hero.name}</h3>
              <p className="text-sm text-mist-400">{hero.sector}</p>
              <div className="mt-2">
                <VerdictBadge verdict={hero.verdict} size="sm" />
              </div>
            </div>
          </div>
          <ScoreRing score={hero.score} size={150} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <PreviewStat label="Revenu" value={eur(hero.metrics.revenue)} sub={pct(hero.metrics.revenueGrowth, true)} good />
          <PreviewStat label="Marge EBITDA" value={pct(hero.metrics.ebitdaMargin)} />
          <PreviewStat label="Valorisation" value={eur(hero.metrics.valuation)} />
          <PreviewStat label="Runway" value={`${hero.metrics.runwayMonths} mois`} />
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="eyebrow">{label}</p>
      <p className="num mt-1.5 text-lg font-semibold text-white">{value}</p>
      {sub && <p className={`num text-2xs ${good ? "text-bull" : "text-mist-400"}`}>{sub}</p>}
    </div>
  );
}

function ProblemCard({ before, icon: Icon, title, lines }: { before?: boolean; icon: any; title: string; lines: string[] }) {
  return (
    <div className={`rounded-2xl border p-5 ${before ? "border-white/[0.06] bg-white/[0.02]" : "border-accent/25 bg-accent/[0.06]"}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${before ? "text-mist-400" : "text-accent-soft"}`} />
        <p className={`text-xs font-semibold ${before ? "text-mist-300" : "text-white"}`}>{title}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {lines.map((l) => (
          <li key={l} className={`text-sm ${before ? "text-mist-400 line-through/0" : "text-mist-200"}`}>
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

const FEATURES = [
  { icon: Gauge, title: "Investment Score™", desc: "Un score propriétaire sur 100, agrégé à partir de 7 piliers pondérés comme le ferait un comité d'investissement." },
  { icon: FileText, title: "Résumé exécutif", desc: "Comprenez l'entreprise en 30 secondes : ce qu'il faut savoir, pourquoi investir, pourquoi s'abstenir." },
  { icon: LineChart, title: "Visualisations Bloomberg", desc: "Courbes de croissance, mix de revenus, rentabilité et valorisation — qualité terminal pro." },
  { icon: Building2, title: "Benchmark concurrents", desc: "Positionnement automatique face aux concurrents sur le score, le revenu, la croissance et la valorisation." },
  { icon: ShieldCheck, title: "Détection des risques", desc: "Concentration client, runway, dette, dépendances — les angles morts remontés explicitement." },
  { icon: Eye, title: "Watchlist & alertes IA", desc: "Suivez une entreprise et soyez notifié : nouveaux financements, résultats, variations de score." },
];

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="group h-full rounded-2xl border border-white/[0.07] bg-ink-850/60 p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-ink-800/70">
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-accent-soft transition-colors group-hover:border-accent/30">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mist-300">{desc}</p>
    </div>
  );
}
