-- Upgrade night wakings: count → list of wake times
-- Run in Supabase SQL Editor after 0002_sleep_records.sql

alter table public.sleep_records drop column if exists night_wakings;

alter table public.sleep_records
  add column if not exists night_waking_times time[] not null default '{}';
