# Valoryx — Intelligence d'investissement

> Transformez des dizaines de pages de données financières en une **fiche
> d'investissement institutionnelle** en moins de **60 secondes**.

Valoryx est un SaaS premium qui produit, pour n'importe quelle entreprise privée
ou publique, une analyse d'investissement de niveau analyste : un **Investment
Score™** propriétaire sur 100, un résumé exécutif lisible en 30 secondes, sept
piliers d'analyse notés, des visualisations dignes d'un terminal Bloomberg, un
benchmark concurrentiel, l'historique de financement et l'évaluation du
management.

Le design s'inspire d'**Apple, Linear, Stripe, Arc et Bloomberg** : noir profond,
gris premium, un unique accent électrique, ombres élégantes, micro-interactions
et animations fluides partout.

---

## ✦ Stack technique

| Couche       | Technologies |
|--------------|--------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion |
| **Charts**   | Recharts (courbes, donut, barres, radar — habillage terminal) |
| **Icônes**   | lucide-react |
| **Backend*** | Supabase (Auth · PostgreSQL · Edge Functions), Stripe |
| **IA***      | Pipeline d'analyse (LLM + enrichissement INPI/Pappers) |

\* Le **MVP fonctionne sans aucune clé** : une couche d'intelligence
déterministe (`lib/data.ts`) alimente tous les écrans. Le backend Supabase est
fourni comme blueprint prêt à brancher (`supabase/schema.sql`, `.env.example`).

---

## ✦ Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

Build de production : `npm run build && npm run start`.
Vérification des types : `npm run typecheck`.

---

## ✦ Architecture des écrans

| Route | Écran | Description |
|-------|-------|-------------|
| `/` | **Landing** | Hero, problème → solution, 7 features, CTA. Vend la promesse « analyse de fonds en 60 s ». |
| `/analyze` | **Nouvelle analyse** | Saisie (nom, site, SIREN, LinkedIn) → animation live des 7 étapes du moteur → redirection vers la fiche. |
| `/company/[id]` | **Fiche d'investissement** | L'écran spectaculaire : score, verdict, métriques, résumé exécutif, 7 cartes IA + radar, 4 graphiques, benchmark, financements, management. |
| `/dashboard` | **Dashboard global** | Top entreprises, meilleures opportunités IA, croissance la plus forte, secteurs performants, valorisations attractives, alertes récentes. |
| `/watchlist` | **Watchlist** | Suivi par entreprise : variation de score, financements, résultats, risques détectés, alertes intelligentes. |
| `/alerts` | **Centre d'alertes** | Flux complet des signaux IA. |
| `/history` · `/favorites` | **Bibliothèque** | Historique d'analyses et favoris. |
| `/pricing` | **Abonnement** | Starter 29€ · Pro 99€ · Investor 299€. |
| `/settings` | **Paramètres** | Profil, abonnement, notifications, sécurité. |

### Arborescence

```
app/
  page.tsx               # Landing
  dashboard/             # Dashboard global
  analyze/               # Flux d'analyse 60 s
  company/[id]/          # Fiche d'investissement (SSG par entreprise)
  watchlist/  alerts/  history/  favorites/  pricing/  settings/
components/
  layout/    # AppShell, Sidebar, Topbar, Ticker (bandeau marché)
  ui/        # Logo, ScoreRing, VerdictBadge, Sparkline, Panel, Reveal
  app/       # CompanyCard, StatCard, CriterionCard, AnalyzeFlow, FollowButton
  charts/    # Growth, Profitability, Valuation, RevenueDonut, Competitor, Radar
  marketing/ # Nav landing
lib/
  types.ts       # Modèle de domaine
  scoring.ts     # Moteur Investment Score™ + verdicts + ramps couleur
  data.ts        # Couche d'intelligence (fixtures déterministes)
  watchlist.ts   # Watchlist + alertes
  utils.ts       # Formatage (€M, %, cn…)
supabase/
  schema.sql     # Schéma Postgres + RLS prêt pour la production
```

---

## ✦ Investment Score™ — le moteur propriétaire

Implémenté dans [`lib/scoring.ts`](lib/scoring.ts). Sept piliers notés sur 100 :

`Croissance · Rentabilité · Solidité financière · Position marché · Scalabilité ·
Management · Risque`

Le score final n'est **pas** une simple moyenne. Les six piliers de
fondamentaux sont pondérés comme le ferait un comité d'investissement
(croissance et rentabilité en tête), puis le **risque agit comme un
multiplicateur de confiance** (0,82 → 1,0) qui érode un profil fragile — exactement
la manière dont un investisseur décote un bilan tendu ou une dépendance client.

```
score = Σ(pilier × poids) / Σ(poids)  ×  (0.82 + 0.18 × risque/100)
```

Le verdict (Excellent / Bon / Neutre / Risque élevé / À éviter) découle du score.

---

## ✦ Base de données

[`supabase/schema.sql`](supabase/schema.sql) définit un modèle prêt pour la
production et le passage à l'échelle (100k+ utilisateurs) :

- **`profiles`** liés à `auth.users`, avec plan et quota d'analyses.
- **`plan_limits`** — quotas par tier (Starter/Pro/Investor) appliqués côté Edge Function.
- **`companies`** dédupliquées par SIREN, recherche plein-texte française.
- **`analyses`** immuables : colonnes filtrables (score, revenu…) + `payload` JSONB pour la sortie IA complète, sans migration à chaque évolution.
- **`watchlist_items`, `favorites`, `alerts`** par utilisateur.
- **Row Level Security** sur toutes les tables tenant ; companies/analyses en lecture partagée, écriture réservée au service role (pipeline).
- Trigger d'auto-provisionnement du profil au signup.

---

## ✦ Brancher l'IA réelle (production)

1. Créer le projet Supabase, appliquer `supabase/schema.sql`.
2. Renseigner `.env.local` (cf. `.env.example`).
3. Implémenter l'Edge Function `analyze` :
   `SIREN/site/LinkedIn` → enrichissement (INPI/Pappers) → raisonnement LLM →
   `computeInvestmentScore()` → insertion d'une ligne `analyses`.
4. Remplacer les lectures de `lib/data.ts` par des requêtes Supabase typées.

Le contrat de données (`lib/types.ts`) et le moteur de score sont déjà partagés
entre le front et le pipeline — l'intégration est un branchement, pas une
réécriture.

---

*Les analyses Valoryx sont fournies à titre informatif et ne constituent pas un
conseil en investissement réglementé.*
