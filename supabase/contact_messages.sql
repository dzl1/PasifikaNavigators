create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  phone text check (phone is null or char_length(phone) <= 40),
  message text not null check (char_length(message) between 10 and 4000),
  source text not null default 'website_contact_page'
);

alter table public.contact_messages enable row level security;

drop policy if exists "Allow public contact message inserts" on public.contact_messages;

create policy "Allow public contact message inserts"
  on public.contact_messages
  for insert
  to anon
  with check (true);

grant insert on public.contact_messages to anon;

-- Authenticated users (admins) can read all messages
drop policy if exists "Admins can read contact messages" on public.contact_messages;

create policy "Admins can read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (true);

