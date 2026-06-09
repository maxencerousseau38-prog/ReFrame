# Vitrio

> **Ton site refait, hébergé et toujours à jour. Pour quelques euros par mois.**

Vitrio est un SaaS qui **modernise le site web d'une PME locale** (artisans,
restaurants, garages, agents immobiliers, indépendants…) puis **héberge** ce
nouveau site sur une infrastructure rapide et sécurisée. L'utilisateur peut le
modifier en quelques clics. L'abonnement mensuel paie l'hébergement : si
l'abonnement s'arrête, le site est mis hors ligne.

> Positionnement assumé : Vitrio est une **plateforme** (hébergement + site +
> outils), **pas une agence marketing**. On ne promet ni trafic ni résultats
> commerciaux — on fournit un site moderne, fiable et à jour.

---

## ✨ Fonctionnalités

- **Site marketing** soigné : accueil avec démo avant/après interactive,
  fonctionnalités, tarifs (toggle mensuel/annuel), exemples, à propos, contact
  (formulaire stocké en base), blog, pages légales (RGPD), 404/erreur custom.
- **Authentification sans mot de passe** (magic link Supabase) + onboarding
  (saisie de l'URL du site existant).
- **Espace client** : vue d'ensemble, gestion du site (statut, domaine, aperçu),
  éditeur d'infos clés avec **aperçu en direct** et upload de photos (Supabase
  Storage), boîte de réception des messages, facturation, paramètres.
- **Back-office admin** (rôle `admin`) : tableau de bord global (clients,
  abonnements actifs, MRR/churn simulés), liste & fiche client, gestion des
  statuts de site, demandes de contact du site marketing.
- **Mock IA isolé** : flux « analyse + génération avant/après » réaliste
  (données simulées, aucune IA réelle — voir `lib/ai/generate-redesign.ts`).
- **Stripe en squelette** : structure complète (config, produits/prix, action
  `createCheckoutSession` stub, webhook avec vérification de signature), logique
  métier en TODO.
- Thème **clair/sombre**, design tokens, animations **framer-motion**, a11y,
  responsive mobile-first, SEO (metadata, OpenGraph, sitemap, robots).

## 🧱 Stack

| Domaine        | Choix                                            |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 15 (App Router, Server Components/Actions)|
| Langage        | TypeScript strict                                |
| Style          | Tailwind CSS v4 + shadcn/ui                       |
| Auth / DB      | Supabase (Auth, PostgreSQL, RLS, Storage)        |
| Paiement       | Stripe (squelette uniquement)                    |
| Animations     | framer-motion                                    |
| Formulaires    | react-hook-form + zod                            |
| Police         | Geist (paquet `geist`, bundlé en local)          |

---

## 🚀 Installation

### 1. Pré-requis
- Node.js 20+
- Un projet [Supabase](https://supabase.com) (ou le CLI Supabase en local)

### 2. Dépendances
```bash
npm install
```

### 3. Variables d'environnement
Copiez `.env.example` en `.env.local` et renseignez vos valeurs :
```bash
cp .env.example .env.local
```
Variables minimales pour démarrer :
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret, côté serveur uniquement)

Les variables Stripe sont optionnelles tant que le paiement n'est pas branché.

### 4. Base de données
Appliquez le schéma et les données de démo :
```bash
# Avec le CLI Supabase (recommandé)
supabase db reset            # applique migrations/ puis seed.sql

# OU manuellement dans le SQL Editor de Supabase :
#   1. collez le contenu de supabase/migrations/0001_init.sql
#   2. (optionnel) collez supabase/seed.sql pour les données de démo
```

> ⚠️ Pensez à activer l'authentification e-mail dans Supabase
> (Authentication → Providers → Email) pour le magic link.

### 5. Lancer le projet
```bash
npm run dev     # développement (http://localhost:3000)
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # lint
```

---

## 👤 Comptes de démonstration

Le `seed.sql` crée des comptes (mot de passe local : `vitrio1234`, ou utilisez
le magic link) :

| Rôle   | E-mail                      | Description              |
| ------ | --------------------------- | ----------------------- |
| Admin  | `admin@vitrio.fr`           | Accès au back-office     |
| Client | `lea@bistrot-lumiere.fr`    | Restaurant (site en ligne) |
| Client | `karim@garage-central.fr`   | Garage (site en ligne)   |
| Client | `sophie@horizon-immo.fr`    | Immobilier (en analyse)  |

> En production (magic link), connectez-vous simplement avec l'e-mail : un lien
> est envoyé. Pour tester l'admin localement, attribuez le rôle `admin` à votre
> profil (`update public.profiles set role='admin' where ...`).

---

## 🗂️ Structure du projet

```
app/
  (marketing)/      Site public (accueil, tarifs, blog, légal, contact…)
  (auth)/           Connexion, inscription, mot de passe oublié
  (dashboard)/      Espace client (overview, site, éditeur, messages…)
  (admin)/          Back-office admin (clients, contacts, stats)
  auth/callback/    Retour du lien magique (échange de session)
  api/webhooks/     Webhook Stripe (squelette)
  sitemap.ts, robots.ts, not-found.tsx, error.tsx
components/
  ui/               Composants shadcn/ui
  marketing/ dashboard/ admin/ auth/ shared/
lib/
  supabase/         Clients serveur / navigateur / middleware
  stripe/           Config, produits, action stub, (webhook côté route)
  ai/               Stub de génération de refonte (isolé)
  validations/      Schémas zod
  pricing.ts, blog.ts, marketing-data.ts, constants.ts, utils.ts, queries.ts, admin.ts, auth.ts
types/              Types DB + types applicatifs
supabase/
  migrations/0001_init.sql   Schéma + RLS + triggers + storage
  seed.sql                   Données de démonstration
middleware.ts       Protection des routes + refresh de session
```

---

## 🔌 Ce qui reste à brancher pour la production

### Stripe (paiement réel)
Tout est en **squelette**, clairement marqué `TODO` :
- `lib/stripe/config.ts` — instanciation du client (clé requise).
- `lib/stripe/products.ts` — mappez vos **price IDs** Stripe (via `.env`).
- `lib/stripe/actions.ts` — implémentez `createCheckoutSession()` (création du
  Customer + session Checkout + redirection).
- `app/api/webhooks/stripe/route.ts` — la **vérification de signature** et le
  **switch d'événements** sont prêts ; complétez la mise à jour de la table
  `subscriptions` pour chaque événement.

### Génération IA (avant/après réel)
`lib/ai/generate-redesign.ts` est un **stub** isolé qui renvoie des données
simulées. À remplacer par un vrai pipeline (récupération du site → extraction →
LLM → génération du rendu). Le reste de l'app n'a pas à changer.

### Divers
- Brancher un service d'e-mails transactionnels (confirmations, notifications).
- Connecter les noms de domaine des clients à l'infrastructure d'hébergement.
- Brancher un monitoring d'erreurs (ex. Sentry) dans `app/error.tsx`.
- Faire valider les textes légaux (mentions, RGPD, CGV, CGU) par un juriste.

---

## 🔐 Sécurité

- **RLS activée** sur toutes les tables : un utilisateur ne voit que ses
  données, un admin voit tout (fonction `is_admin()` en `SECURITY DEFINER`).
- Les opérations privilégiées (insert public du formulaire marketing, admin,
  webhooks) passent par le **client service role**, jamais exposé au navigateur.
- Routes privées protégées par le **middleware** + vérification serveur.
