-- Learning Pathways table
-- Run this in your Supabase SQL editor

create table if not exists public.learning_pathways (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  language    text not null,
  level       text not null,
  description text,
  url         text,
  is_published boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learning_pathways_updated_at on public.learning_pathways;
create trigger learning_pathways_updated_at
  before update on public.learning_pathways
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.learning_pathways enable row level security;

-- Public can read published pathways
create policy "Published pathways are public"
  on public.learning_pathways for select
  using (is_published = true);

-- Authenticated users (admins) can do everything
create policy "Admins can manage all pathways"
  on public.learning_pathways for all
  to authenticated
  using (true)
  with check (true);
