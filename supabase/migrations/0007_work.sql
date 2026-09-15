-- Work days + work logs (1 day row when needed; many logs per day)
-- Run in Supabase SQL Editor. Skip creating set_updated_at() if it already exists.

create table if not exists public.work_days (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  day_type text not null default 'work'
    check (day_type in ('work', 'weekend', 'holiday', 'leave')),
  load text
    check (load is null or load in ('full', 'half', 'empty')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.work_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  category text not null
    check (category in ('company', 'personal')),
  project text not null,
  hours numeric,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists work_logs_date_idx on public.work_logs (date);
create index if not exists work_logs_user_date_idx on public.work_logs (user_id, date);

alter table public.work_days enable row level security;
alter table public.work_logs enable row level security;

create policy "work_days_select_own" on public.work_days
  for select using (auth.uid() = user_id);
create policy "work_days_insert_own" on public.work_days
  for insert with check (auth.uid() = user_id);
create policy "work_days_update_own" on public.work_days
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "work_days_delete_own" on public.work_days
  for delete using (auth.uid() = user_id);

create policy "work_logs_select_own" on public.work_logs
  for select using (auth.uid() = user_id);
create policy "work_logs_insert_own" on public.work_logs
  for insert with check (auth.uid() = user_id);
create policy "work_logs_update_own" on public.work_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "work_logs_delete_own" on public.work_logs
  for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists work_days_set_updated_at on public.work_days;
create trigger work_days_set_updated_at
before update on public.work_days
for each row execute function public.set_updated_at();
