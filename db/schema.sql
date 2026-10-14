-- Pasifika Navigators schema for Azure Database for PostgreSQL (v13+).
-- Run with: psql "$DATABASE_URL" -f db/schema.sql
-- Access control lives in the Azure Functions API (api/), so these tables
-- have no row-level security. Never expose this database to the browser.

-- Shared trigger to keep updated_at current.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Contact form submissions -------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  phone text check (phone is null or char_length(phone) <= 40),
  message text not null check (char_length(message) between 10 and 4000),
  source text not null default 'website_contact_page',
  is_flagged boolean not null default false,
  is_hidden boolean not null default false
);

create index if not exists contact_messages_hidden_created_idx
  on contact_messages (is_hidden, created_at desc);

-- Learning pathways --------------------------------------------------------
create table if not exists learning_pathways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  language text not null,
  level text not null,
  description text,
  url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists learning_pathways_updated_at on learning_pathways;
create trigger learning_pathways_updated_at
  before update on learning_pathways
  for each row execute function set_updated_at();

-- Place-based stories ------------------------------------------------------
-- owner_id is the Microsoft Entra object ID (oid claim) of the author.
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  slug text not null unique,
  title text not null default 'Untitled story',
  description text not null default '',
  points jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stories_owner_id_idx on stories (owner_id);
create index if not exists stories_published_slug_idx on stories (slug) where is_published = true;

drop trigger if exists stories_updated_at on stories;
create trigger stories_updated_at
  before update on stories
  for each row execute function set_updated_at();

-- User profile settings (previously Supabase auth user_metadata) ----------
create table if not exists profiles (
  user_id text primary key,
  email text,
  display_name text not null default '' check (char_length(display_name) <= 80),
  profile_visible boolean not null default false,
  product_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
