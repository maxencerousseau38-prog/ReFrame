-- ReFrame Supabase (Postgres) schema.
--
-- Apply to a fresh Supabase project before pointing the app at it:
--   • Supabase Dashboard → SQL Editor → paste & run, or
--   • supabase db push   (if you manage this repo as migrations)
--
-- The app talks to Postgres ONLY from the server, with the service-role key,
-- which bypasses Row Level Security. Every table therefore has RLS enabled with
-- NO policies: the anon / publishable key can read or write nothing, and the
-- only path to the data is the Next.js server. See src/lib/server/supabase.ts.

-- users: ReFrame accounts. id = sha256(normalized email), matching users-store.
create table if not exists public.users (
  id                 text primary key,
  email              text not null unique,
  password_hash      text not null,
  plan               text,
  stripe_customer_id text,
  email_verified     boolean not null default false,
  created_at         timestamptz not null default now()
);

-- sites: published redesigns served at /s/<slug>.
create table if not exists public.sites (
  slug            text primary key,
  schema          jsonb not null,
  owner_id        text references public.users(id) on delete set null,
  domain          text,
  domain_verified boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists sites_owner_id_idx on public.sites (owner_id);
create index if not exists sites_updated_at_idx on public.sites (updated_at desc);
create unique index if not exists sites_domain_verified_idx
  on public.sites (domain) where domain_verified;

-- projects: a signed-in user's saved generation (schema + analysis).
create table if not exists public.projects (
  id         text primary key,
  owner_id   text not null references public.users(id) on delete cascade,
  schema     jsonb not null,
  analysis   jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_updated_idx
  on public.projects (owner_id, updated_at desc);

-- shares: anonymous, read-by-id snapshots. 60-day TTL filtered at read time.
create table if not exists public.shares (
  id         text primary key,
  schema     jsonb not null,
  analysis   jsonb,
  email      text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 days')
);
create index if not exists shares_expires_at_idx on public.shares (expires_at);

-- leads: contact-form submissions on published sites, per owner.
create table if not exists public.leads (
  id         text primary key,
  owner_id   text not null,
  slug       text not null,
  brand      text not null default '',
  name       text not null default '',
  email      text not null default '',
  message    text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists leads_owner_created_idx
  on public.leads (owner_id, created_at desc);

-- site_views: per-day pageview counters per slug. No PII, no cookies.
create table if not exists public.site_views (
  slug  text not null,
  day   date not null,
  count integer not null default 0,
  primary key (slug, day)
);
create index if not exists site_views_slug_idx on public.site_views (slug);

-- Atomic increment used by trackView(): upsert + count += 1 in one statement.
create or replace function public.increment_site_view(p_slug text)
returns void
language sql
set search_path = ''
as $$
  insert into public.site_views (slug, day, count)
  values (p_slug, current_date, 1)
  on conflict (slug, day)
  do update set count = public.site_views.count + 1;
$$;

-- Lock everything down: RLS on, no policies => only the service role gets in.
alter table public.users      enable row level security;
alter table public.sites      enable row level security;
alter table public.projects   enable row level security;
alter table public.shares     enable row level security;
alter table public.leads      enable row level security;
alter table public.site_views enable row level security;
