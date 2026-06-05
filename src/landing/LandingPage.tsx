import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Layers,
  Menu,
  Quote,
  Sparkles,
  Star,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------- helpers */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const Stars = () => (
  <div className="flex gap-0.5 text-amber-400">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="size-4 fill-current" />
    ))}
  </div>
)

/* ------------------------------------------------------------------- data */

const features = [
  {
    icon: Layers,
    title: 'Tableaux & listes flexibles',
    text: 'Kanban, listes, calendrier ou timeline : visualisez le travail comme votre équipe le pense, pas l’inverse.',
  },
  {
    icon: Zap,
    title: 'Automatisations sans code',
    text: 'Assignez, relancez et déplacez les tâches automatiquement. Vos process tournent pendant que vous avancez.',
  },
  {
    icon: Users,
    title: 'Collaboration en temps réel',
    text: 'Commentaires, mentions et pièces jointes. Toute l’équipe reste alignée, sans la avalanche d’e-mails.',
  },
  {
    icon: BarChart3,
    title: 'Tableaux de bord clairs',
    text: 'Charge de travail, échéances et vélocité en un coup d’œil. Décidez sur des faits, pas des impressions.',
  },
  {
    icon: Bell,
    title: 'Rappels intelligents',
    text: 'Tempo priorise vos rappels selon les deadlines et la charge réelle. Plus rien ne passe entre les mailles.',
  },
  {
    icon: Workflow,
    title: '100+ intégrations',
    text: 'Slack, Google Agenda, GitHub, Notion… Connectez vos outils en deux clics et centralisez le travail.',
  },
]

const steps = [
  { n: '01', title: 'Créez votre espace', text: 'Importez vos tâches ou partez d’un modèle prêt à l’emploi en moins de 2 minutes.' },
  { n: '02', title: 'Invitez votre équipe', text: 'Ajoutez vos coéquipiers, définissez les rôles et répartissez la charge en glisser-déposer.' },
  { n: '03', title: 'Livrez plus vite', text: 'Suivez l’avancement en direct et laissez les automatisations gérer le reste.' },
]

const testimonials = [
  {
    quote: 'On a réduit nos réunions de suivi de 40 %. Tout le monde sait quoi faire et pour quand. Tempo est devenu le cœur de notre quotidien.',
    name: 'Camille Besson',
    role: 'Head of Ops, Lumio',
  },
  {
    quote: 'Adopté en une journée par toute l’équipe produit. L’interface est rapide, claire, et les automatisations nous font gagner des heures chaque semaine.',
    name: 'Yanis Moreau',
    role: 'CTO, Drivco',
  },
  {
    quote: 'Enfin un outil que mes équipes utilisent vraiment. La visibilité sur la charge a tout changé pour nos plannings.',
    name: 'Sofia Renard',
    role: 'Directrice de projets, Atelier 9',
  },
]

const plans = [
  {
    name: 'Gratuit',
    price: '0 €',
    period: '/ pour toujours',
    desc: 'Pour démarrer et tester en équipe réduite.',
    cta: 'Commencer gratuitement',
    highlight: false,
    features: ['Jusqu’à 5 membres', 'Tâches illimitées', 'Vues liste & kanban', '100 Mo de stockage'],
  },
  {
    name: 'Pro',
    price: '9 €',
    period: '/ utilisateur / mois',
    desc: 'Pour les équipes qui veulent accélérer.',
    cta: 'Démarrer l’essai de 14 jours',
    highlight: true,
    features: [
      'Membres illimités',
      'Automatisations illimitées',
      'Vues calendrier & timeline',
      'Tableaux de bord avancés',
      '100+ intégrations',
    ],
  },
  {
    name: 'Équipe',
    price: 'Sur mesure',
    period: '',
    desc: 'Pour les organisations exigeantes.',
    cta: 'Contacter l’équipe',
    highlight: false,
    features: ['Tout le plan Pro', 'SSO & SAML', 'Rôles & permissions avancés', 'Support dédié 24/7', 'SLA & conformité'],
  },
]

const faqs = [
  { q: 'Ai-je besoin d’une carte bancaire pour essayer ?', a: 'Non. Le plan Gratuit l’est à vie, et l’essai Pro de 14 jours ne demande aucune carte bancaire.' },
  { q: 'Puis-je importer mes tâches depuis un autre outil ?', a: 'Oui, Tempo importe depuis Trello, Asana, Notion, Jira et un simple fichier CSV en quelques clics.' },
  { q: 'Mes données sont-elles en sécurité ?', a: 'Chiffrement en transit et au repos, hébergement en Europe, conformité RGPD et sauvegardes quotidiennes.' },
  { q: 'Puis-je annuler à tout moment ?', a: 'Bien sûr. Aucun engagement : vous pouvez changer de plan ou résilier en un clic depuis vos paramètres.' },
]

const navLinks = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how' },
  { label: 'Témoignages', href: '#testimonials' },
  { label: 'Tarifs', href: '#pricing' },
]

/* ------------------------------------------------------------------- page */

export function LandingPage() {
  const [open, setOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="bg-background text-foreground min-h-screen scroll-smooth font-sans">
      {/* NAV */}
      <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#" className="flex items-center gap-2.5">
            <span className="brand-gradient grid size-9 place-items-center rounded-xl text-white shadow-lg shadow-primary/30">
              <Sparkles className="size-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">Tempo</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost">Se connecter</Button>
            <Button className="shadow-lg shadow-primary/25">
              Essayer gratuitement
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu />
          </button>
        </div>
        {open && (
          <div className="border-border/60 border-t px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-muted-foreground text-sm font-medium" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
              <Button className="mt-2 w-full">Essayer gratuitement</Button>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-primary/20 pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full blur-[140px]" />
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-10 text-center md:pt-24">
          <Reveal>
            <a
              href="#"
              className="border-border bg-card text-muted-foreground hover:text-foreground mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium shadow-sm transition-colors"
            >
              <span className="bg-primary/12 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                Nouveau
              </span>
              Automatisations IA — disponibles maintenant
              <ArrowRight className="size-3.5" />
            </a>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-balance md:text-6xl">
              La gestion de tâches qui fait{' '}
              <span className="text-primary">avancer votre équipe</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">
              Priorisez ce qui compte, automatisez le reste et livrez plus vite —
              le tout depuis un espace de travail que votre équipe adore vraiment utiliser.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 px-7 text-base shadow-xl shadow-primary/30">
                Commencer gratuitement
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 text-base">
                Voir la démo
              </Button>
            </div>
            <p className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm">
              <Check className="text-primary size-4" />
              Sans carte bancaire · Configuration en 2 minutes
            </p>
          </Reveal>

          {/* social proof */}
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
              <div className="flex -space-x-2.5">
                {['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'].map((c, i) => (
                  <span
                    key={i}
                    className="border-background grid size-9 place-items-center rounded-full border-2 text-xs font-bold text-white"
                    style={{ background: c }}
                  >
                    {['CB', 'YM', 'SR', 'LP', 'IM'][i]}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Stars />
                <span className="text-muted-foreground text-sm">
                  <strong className="text-foreground">12 000+ équipes</strong> nous font confiance
                </span>
              </div>
            </div>
          </Reveal>

          {/* product mockup */}
          <Reveal delay={0.25}>
            <div className="relative mx-auto mt-14 max-w-4xl">
              <div className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-2xl shadow-primary/10">
                <div className="border-border/60 flex items-center gap-2 border-b px-4 py-3">
                  <span className="size-3 rounded-full bg-red-400" />
                  <span className="size-3 rounded-full bg-amber-400" />
                  <span className="size-3 rounded-full bg-emerald-400" />
                  <span className="text-muted-foreground ml-3 text-xs">Tempo · Sprint produit</span>
                </div>
                <div className="grid grid-cols-3 gap-3 p-4 text-left">
                  {[
                    { title: 'À faire', tone: 'bg-muted-foreground/40', cards: ['Refonte onboarding', 'Specs facturation'] },
                    { title: 'En cours', tone: 'bg-primary', cards: ['Page tarifs A/B', 'API webhooks'] },
                    { title: 'Terminé', tone: 'bg-emerald-500', cards: ['Auth SSO', 'Dashboard v2'] },
                  ].map((col) => (
                    <div key={col.title} className="bg-secondary/50 rounded-xl p-2.5">
                      <div className="mb-2 flex items-center gap-2 px-1">
                        <span className={cn('size-2 rounded-full', col.tone)} />
                        <span className="text-xs font-semibold">{col.title}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {col.cards.map((c) => (
                          <div key={c} className="bg-card rounded-lg border p-2.5 shadow-sm">
                            <p className="text-[13px] font-medium">{c}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="bg-primary/12 text-primary rounded px-1.5 py-0.5 text-[10px] font-semibold">
                                Produit
                              </span>
                              <span className="bg-muted-foreground/30 size-5 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-border/60 border-y py-8">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-muted-foreground mb-6 text-center text-xs font-semibold tracking-widest uppercase">
            Ils accélèrent avec Tempo
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {['Lumio', 'Drivco', 'Atelier 9', 'Northpeak', 'Velora', 'Studio Onde'].map((b) => (
              <span key={b} className="text-lg font-bold tracking-tight">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold">Fonctionnalités</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Tout pour livrer, rien pour ralentir
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Tempo réunit tâches, projets et automatisations dans une interface rapide
            que votre équipe adopte sans formation.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div className="group border-border bg-card hover:border-primary/40 h-full rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5">
                <span className="bg-primary/10 text-primary mb-4 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110">
                  <f.icon className="size-6" />
                </span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-muted-foreground mt-2 text-[15px]">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-secondary/40 border-border/60 border-y py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-primary text-sm font-semibold">Comment ça marche</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Opérationnel en quelques minutes
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="relative h-full">
                  <span className="text-primary/15 text-6xl font-extrabold">{s.n}</span>
                  <h3 className="-mt-4 text-xl font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground mt-2">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold">Témoignages</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Les équipes qui livrent choisissent Tempo
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="border-border bg-card flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                <Quote className="text-primary/30 size-8" />
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">
                  « {t.quote} »
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="brand-gradient grid size-10 place-items-center rounded-full text-xs font-bold text-white">
                    {t.name.split(' ').map((p) => p[0]).join('')}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-muted-foreground text-[13px]">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-secondary/40 border-border/60 border-y py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-primary text-sm font-semibold">Tarifs</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Un prix simple, qui grandit avec vous
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Commencez gratuitement. Passez au niveau supérieur quand vous êtes prêt.
            </p>
          </Reveal>

          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08} className="h-full">
                <div
                  className={cn(
                    'relative flex h-full flex-col rounded-2xl border p-7 shadow-sm',
                    p.highlight
                      ? 'border-primary bg-card ring-primary/30 shadow-xl shadow-primary/10 ring-1'
                      : 'border-border bg-card',
                  )}
                >
                  {p.highlight && (
                    <span className="brand-gradient absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      Le plus populaire
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
                    <span className="text-muted-foreground text-sm">{p.period}</span>
                  </div>
                  <Button
                    className="mt-6 w-full"
                    variant={p.highlight ? 'default' : 'outline'}
                  >
                    {p.cta}
                  </Button>
                  <ul className="mt-7 flex flex-col gap-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[15px]">
                        <span className="bg-primary/12 text-primary mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                          <Check className="size-3.5" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <Reveal className="text-center">
          <span className="text-primary text-sm font-semibold">FAQ</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>
        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((f, i) => {
            const isOpen = faqOpen === i
            return (
              <Reveal key={f.q} delay={i * 0.05}>
                <div className="border-border bg-card rounded-xl border">
                  <button
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setFaqOpen(isOpen ? null : i)}
                  >
                    <span className="font-medium">{f.q}</span>
                    <ChevronDown
                      className={cn(
                        'text-muted-foreground size-5 shrink-0 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-muted-foreground px-5 pb-4 text-[15px]"
                    >
                      {f.a}
                    </motion.p>
                  )}
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal>
          <div className="brand-gradient relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white shadow-2xl shadow-primary/30">
            <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl" />
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
              Prêt à faire avancer votre équipe ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/85">
              Rejoignez 12 000+ équipes qui livrent plus vite avec Tempo. Gratuit pour commencer.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="text-primary h-12 bg-white px-7 text-base font-semibold hover:bg-white/90">
                Commencer gratuitement
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white">
                Parler à un expert
              </Button>
            </div>
            <p className="mt-5 flex items-center justify-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> Prêt en 2 min</span>
              <span className="flex items-center gap-1.5"><Check className="size-4" /> Sans carte bancaire</span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-border/60 border-t">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="brand-gradient grid size-8 place-items-center rounded-lg text-white">
                  <Sparkles className="size-4" />
                </span>
                <span className="text-lg font-extrabold tracking-tight">Tempo</span>
              </div>
              <p className="text-muted-foreground mt-3 max-w-xs text-sm">
                L’espace de travail qui aide les équipes à prioriser, collaborer et livrer plus vite.
              </p>
            </div>
            {[
              { h: 'Produit', l: ['Fonctionnalités', 'Tarifs', 'Intégrations', 'Nouveautés'] },
              { h: 'Ressources', l: ['Blog', 'Guides', 'Centre d’aide', 'Statut'] },
              { h: 'Entreprise', l: ['À propos', 'Clients', 'Carrières', 'Contact'] },
            ].map((col) => (
              <div key={col.h}>
                <h4 className="text-sm font-semibold">{col.h}</h4>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.l.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-border/60 text-muted-foreground mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm sm:flex-row">
            <span>© {new Date().getFullYear()} Tempo. Tous droits réservés.</span>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <span>Conçu pour les équipes qui avancent</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
