create table daily_records (
  date date primary key,
  user_id uuid not null default auth.uid(),
  water_glasses integer,
  masturbation_count integer,
  watched_porn boolean,
  updated_at timestamptz not null default now()
);

create table coffee_logs (
  id bigint generated always as identity primary key,
  date date not null references daily_records(date) on delete cascade,
  user_id uuid not null default auth.uid(),
  type text not null,
  custom_type text,
  cups integer not null,
  created_at timestamptz not null default now()
);

alter table daily_records enable row level security;
alter table coffee_logs enable row level security;

create policy "own daily_records" on daily_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own coffee_logs" on coffee_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
