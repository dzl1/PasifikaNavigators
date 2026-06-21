create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
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

alter table public.contact_messages
  add column if not exists is_flagged boolean not null default false,
  add column if not exists is_hidden boolean not null default false;

create index if not exists contact_messages_hidden_created_idx
  on public.contact_messages (is_hidden, created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Allow public contact message inserts" on public.contact_messages;

create policy "Allow public contact message inserts"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (is_flagged = false and is_hidden = false);

grant insert on public.contact_messages to anon, authenticated;

-- Authenticated admins can read, update, and delete all messages.
drop policy if exists "Admins can read contact messages" on public.contact_messages;
drop policy if exists "Admins can update contact messages" on public.contact_messages;
drop policy if exists "Admins can delete contact messages" on public.contact_messages;

create policy "Admins can read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'dave@pasifikanavigators.nz');

create policy "Admins can update contact messages"
  on public.contact_messages
  for update
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'dave@pasifikanavigators.nz')
  with check (lower(auth.jwt() ->> 'email') = 'dave@pasifikanavigators.nz');

create policy "Admins can delete contact messages"
  on public.contact_messages
  for delete
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'dave@pasifikanavigators.nz');

grant select, update, delete on public.contact_messages to authenticated;
