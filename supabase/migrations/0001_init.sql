-- =====================================================================
-- Vitrio — Schéma initial
-- Tables, types, déclencheurs, RLS et bucket de stockage.
-- Toutes les données sont protégées par RLS : un utilisateur ne voit que
-- les siennes ; un administrateur voit tout.
-- =====================================================================

-- Extensions utiles
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Types énumérés
-- ---------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.site_status as enum ('analyse', 'brouillon', 'en_ligne', 'hors_ligne');
create type public.subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'inactive');

-- ---------------------------------------------------------------------
-- Table : profiles
-- Un profil par utilisateur Supabase Auth.
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role public.user_role not null default 'user',
  nom text,
  entreprise text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Table : sites
-- Le site web géré pour un client.
-- ---------------------------------------------------------------------
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  url_origine text,
  nom_domaine text,
  statut public.site_status not null default 'analyse',
  contenu jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sites_owner_id_idx on public.sites (owner_id);

-- ---------------------------------------------------------------------
-- Table : site_messages
-- Messages reçus via le formulaire de contact du site DU CLIENT.
-- ---------------------------------------------------------------------
create table public.site_messages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  nom text not null,
  email text not null,
  message text not null,
  lu boolean not null default false,
  recu_le timestamptz not null default now()
);
create index site_messages_site_id_idx on public.site_messages (site_id);

-- ---------------------------------------------------------------------
-- Table : contact_requests
-- Demandes reçues via le formulaire du site MARKETING (Vitrio lui-même).
-- ---------------------------------------------------------------------
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text not null,
  message text not null,
  traite boolean not null default false,
  recu_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Table : subscriptions
-- Abonnement d'hébergement lié à un utilisateur (renseigné via Stripe).
-- ---------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  statut public.subscription_status not null default 'inactive',
  plan text,
  periode_fin timestamptz,
  created_at timestamptz not null default now()
);
create index subscriptions_user_id_idx on public.subscriptions (user_id);

-- =====================================================================
-- Fonctions & déclencheurs
-- =====================================================================

-- Détecte si l'utilisateur courant est administrateur.
-- SECURITY DEFINER pour éviter la récursion RLS sur la table profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Crée automatiquement un profil à l'inscription d'un utilisateur.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nom, entreprise)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nom',
    new.raw_user_meta_data ->> 'entreprise'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Met à jour updated_at automatiquement.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sites_set_updated_at
  before update on public.sites
  for each row execute function public.handle_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.site_messages enable row level security;
alter table public.contact_requests enable row level security;
alter table public.subscriptions enable row level security;

-- ---- profiles ----
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (user_id = auth.uid() or public.is_admin());

create policy "profiles_insert_own" on public.profiles
  for insert with check (user_id = auth.uid());

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---- sites ----
create policy "sites_select_own_or_admin" on public.sites
  for select using (owner_id = auth.uid() or public.is_admin());

create policy "sites_insert_own" on public.sites
  for insert with check (owner_id = auth.uid());

create policy "sites_update_own_or_admin" on public.sites
  for update using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "sites_delete_own_or_admin" on public.sites
  for delete using (owner_id = auth.uid() or public.is_admin());

-- ---- site_messages ----
-- Lecture/écriture réservée au propriétaire du site concerné (ou admin).
create policy "site_messages_select_owner_or_admin" on public.site_messages
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.sites s
      where s.id = site_messages.site_id and s.owner_id = auth.uid()
    )
  );

create policy "site_messages_update_owner_or_admin" on public.site_messages
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.sites s
      where s.id = site_messages.site_id and s.owner_id = auth.uid()
    )
  );

-- L'insertion publique (depuis le site hébergé du client) se fait via une
-- Server Action utilisant la clé service role : aucune policy d'insert publique ici.

-- ---- contact_requests ----
-- Le formulaire marketing insère via Server Action (service role).
-- Seuls les admins peuvent lire/mettre à jour.
create policy "contact_requests_select_admin" on public.contact_requests
  for select using (public.is_admin());

create policy "contact_requests_update_admin" on public.contact_requests
  for update using (public.is_admin());

-- ---- subscriptions ----
create policy "subscriptions_select_own_or_admin" on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());
-- Insert/update gérés exclusivement côté serveur (webhooks Stripe, service role).

-- =====================================================================
-- Stockage : photos des sites clients
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- Chaque utilisateur gère ses fichiers dans un dossier portant son uid.
create policy "site_assets_read_public" on storage.objects
  for select using (bucket_id = 'site-assets');

create policy "site_assets_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'site-assets' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "site_assets_update_own" on storage.objects
  for update using (
    bucket_id = 'site-assets' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "site_assets_delete_own" on storage.objects
  for delete using (
    bucket_id = 'site-assets' and (storage.foldername(name))[1] = auth.uid()::text
  );
