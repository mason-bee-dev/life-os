-- Sleep records (MVP: night sleep + optional nap per wake-up date)
-- Run in Supabase SQL Editor. Skip creating set_updated_at() if it already exists.

create table if not exists public.sleep_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  date date not null,

  bedtime time,
  wake_time time,
  night_waking_times time[] not null default '{}',
  quality text check (quality is null or quality in ('kho_ngu', 'binh_thuong', 'ngu_ngon')),
  note text,

  nap_start time,
  nap_end time,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, date)
);

alter table public.sleep_records enable row level security;

create policy "sleep_records_select_own" on public.sleep_records
  for select using (auth.uid() = user_id);
create policy "sleep_records_insert_own" on public.sleep_records
  for insert with check (auth.uid() = user_id);
create policy "sleep_records_update_own" on public.sleep_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sleep_records_delete_own" on public.sleep_records
  for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists sleep_records_set_updated_at on public.sleep_records;
create trigger sleep_records_set_updated_at
before update on public.sleep_records
for each row execute function public.set_updated_at();
