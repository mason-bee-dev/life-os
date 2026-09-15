-- Timeline: catalog activities + daily interval segments
-- Run in Supabase SQL Editor. Skip creating set_updated_at() if it already exists.

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  name text not null,
  icon text not null,
  color text not null,
  group_id text not null,
  archived boolean not null default false,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_user_id_idx on public.activities (user_id);

alter table public.activities enable row level security;

create policy "activities_select_own" on public.activities
  for select using (auth.uid() = user_id);
create policy "activities_insert_own" on public.activities
  for insert with check (auth.uid() = user_id);
create policy "activities_update_own" on public.activities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activities_delete_own" on public.activities
  for delete using (auth.uid() = user_id);

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create table if not exists public.activity_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete restrict,

  date date not null,
  start_min integer not null check (start_min >= 0 and start_min < 1440),
  end_min integer not null check (end_min > start_min and end_min <= 1440),
  note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_segments_user_date_idx
  on public.activity_segments (user_id, date);
create index if not exists activity_segments_activity_id_idx
  on public.activity_segments (activity_id);

alter table public.activity_segments enable row level security;

create policy "activity_segments_select_own" on public.activity_segments
  for select using (auth.uid() = user_id);
create policy "activity_segments_insert_own" on public.activity_segments
  for insert with check (auth.uid() = user_id);
create policy "activity_segments_update_own" on public.activity_segments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_segments_delete_own" on public.activity_segments
  for delete using (auth.uid() = user_id);

drop trigger if exists activity_segments_set_updated_at on public.activity_segments;
create trigger activity_segments_set_updated_at
before update on public.activity_segments
for each row execute function public.set_updated_at();
