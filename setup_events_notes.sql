-- Run this once in Supabase SQL Editor before uploading v7.
-- 先跑这个，不然 Calendar / Note 会报 table missing。人类喜闻乐见的“数据库还没建，网站先问数据在哪”。

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  category text not null default 'Life',
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.notes enable row level security;

drop policy if exists "Allow public read events" on public.events;
drop policy if exists "Allow public insert events" on public.events;
drop policy if exists "Allow public update events" on public.events;
drop policy if exists "Allow public delete events" on public.events;

create policy "Allow public read events"
on public.events for select to anon using (true);

create policy "Allow public insert events"
on public.events for insert to anon with check (true);

create policy "Allow public update events"
on public.events for update to anon using (true) with check (true);

create policy "Allow public delete events"
on public.events for delete to anon using (true);

drop policy if exists "Allow public read notes" on public.notes;
drop policy if exists "Allow public insert notes" on public.notes;
drop policy if exists "Allow public update notes" on public.notes;
drop policy if exists "Allow public delete notes" on public.notes;

create policy "Allow public read notes"
on public.notes for select to anon using (true);

create policy "Allow public insert notes"
on public.notes for insert to anon with check (true);

create policy "Allow public update notes"
on public.notes for update to anon using (true) with check (true);

create policy "Allow public delete notes"
on public.notes for delete to anon using (true);
