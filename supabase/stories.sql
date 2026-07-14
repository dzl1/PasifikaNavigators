-- Place-based digital stories. Run this file in the Supabase SQL editor.
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null default 'Untitled story',
  description text not null default '',
  points jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stories_owner_id_idx on public.stories(owner_id);
create index if not exists stories_published_slug_idx on public.stories(slug) where is_published = true;

create or replace function public.set_story_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists stories_updated_at on public.stories;
create trigger stories_updated_at before update on public.stories
for each row execute function public.set_story_updated_at();

alter table public.stories enable row level security;

drop policy if exists "Published stories are public" on public.stories;
create policy "Published stories are public" on public.stories
for select using (is_published = true);

drop policy if exists "Owners can read their stories" on public.stories;
create policy "Owners can read their stories" on public.stories
for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "Owners can create stories" on public.stories;
create policy "Owners can create stories" on public.stories
for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their stories" on public.stories;
create policy "Owners can update their stories" on public.stories
for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete their stories" on public.stories;
create policy "Owners can delete their stories" on public.stories
for delete to authenticated using (auth.uid() = owner_id);
