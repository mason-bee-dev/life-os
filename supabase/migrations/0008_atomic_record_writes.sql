-- Atomic writes for daily trackers and sleep date-move operations.

create or replace function public.save_daily_record_atomic(
  p_target_date date,
  p_target_patch jsonb,
  p_source_date date default null,
  p_source_patch jsonb default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target_patch jsonb := coalesce(p_target_patch, '{}'::jsonb);
  v_source_patch jsonb := coalesce(p_source_patch, '{}'::jsonb);
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_target_date is null then
    raise exception 'Target date is required';
  end if;

  insert into public.daily_records (date, user_id, updated_at)
  values (p_target_date, v_uid, now())
  on conflict (date) do update
    set updated_at = now()
    where public.daily_records.user_id = v_uid;

  update public.daily_records
  set
    water_glasses = case
      when v_target_patch ? 'waterGlasses' then (v_target_patch ->> 'waterGlasses')::integer
      else water_glasses
    end,
    masturbation_count = case
      when v_target_patch ? 'masturbationCount' then (v_target_patch ->> 'masturbationCount')::integer
      else masturbation_count
    end,
    wp_note = case
      when v_target_patch ? 'wpNote' then v_target_patch ->> 'wpNote'
      else wp_note
    end,
    watched_porn = case
      when v_target_patch ? 'watchedPorn' then (v_target_patch ->> 'watchedPorn')::boolean
      else watched_porn
    end,
    updated_at = now()
  where user_id = v_uid
    and date = p_target_date;

  if not found then
    raise exception 'Cannot write target date %', p_target_date;
  end if;

  if v_target_patch ? 'drinks' or v_target_patch ? 'coffee' then
    delete from public.coffee_logs
    where user_id = v_uid
      and date = p_target_date;

    insert into public.coffee_logs (
      date,
      user_id,
      type,
      custom_type,
      cups,
      category,
      amount,
      note
    )
    select
      p_target_date,
      v_uid,
      coalesce(nullif(trim(elem ->> 'type'), ''), 'Khac'),
      nullif(trim(coalesce(elem ->> 'customType', '')), ''),
      coalesce((elem ->> 'cups')::integer, 0),
      case
        when elem ->> 'category' in ('cafe', 'soft_drink', 'tea')
          then elem ->> 'category'
        else 'cafe'
      end,
      coalesce((elem ->> 'amount')::integer, 0),
      nullif(trim(coalesce(elem ->> 'note', '')), '')
    from jsonb_array_elements(
      coalesce(v_target_patch -> 'drinks', v_target_patch -> 'coffee', '[]'::jsonb)
    ) as elem;
  end if;

  if p_source_date is null or p_source_date = p_target_date then
    return;
  end if;

  insert into public.daily_records (date, user_id, updated_at)
  values (p_source_date, v_uid, now())
  on conflict (date) do update
    set updated_at = now()
    where public.daily_records.user_id = v_uid;

  update public.daily_records
  set
    water_glasses = case
      when v_source_patch ? 'waterGlasses' then (v_source_patch ->> 'waterGlasses')::integer
      else water_glasses
    end,
    masturbation_count = case
      when v_source_patch ? 'masturbationCount' then (v_source_patch ->> 'masturbationCount')::integer
      else masturbation_count
    end,
    wp_note = case
      when v_source_patch ? 'wpNote' then v_source_patch ->> 'wpNote'
      else wp_note
    end,
    watched_porn = case
      when v_source_patch ? 'watchedPorn' then (v_source_patch ->> 'watchedPorn')::boolean
      else watched_porn
    end,
    updated_at = now()
  where user_id = v_uid
    and date = p_source_date;

  if not found then
    raise exception 'Cannot write source date %', p_source_date;
  end if;

  if v_source_patch ? 'drinks' or v_source_patch ? 'coffee' then
    delete from public.coffee_logs
    where user_id = v_uid
      and date = p_source_date;

    insert into public.coffee_logs (
      date,
      user_id,
      type,
      custom_type,
      cups,
      category,
      amount,
      note
    )
    select
      p_source_date,
      v_uid,
      coalesce(nullif(trim(elem ->> 'type'), ''), 'Khac'),
      nullif(trim(coalesce(elem ->> 'customType', '')), ''),
      coalesce((elem ->> 'cups')::integer, 0),
      case
        when elem ->> 'category' in ('cafe', 'soft_drink', 'tea')
          then elem ->> 'category'
        else 'cafe'
      end,
      coalesce((elem ->> 'amount')::integer, 0),
      nullif(trim(coalesce(elem ->> 'note', '')), '')
    from jsonb_array_elements(
      coalesce(v_source_patch -> 'drinks', v_source_patch -> 'coffee', '[]'::jsonb)
    ) as elem;
  end if;
end;
$$;

create or replace function public.move_sleep_entry_atomic(
  p_kind text,
  p_source_date date,
  p_target_date date,
  p_bedtime time default null,
  p_wake_time time default null,
  p_night_waking_times time[] default null,
  p_quality text default null,
  p_nap_start time default null,
  p_nap_end time default null,
  p_note text default null,
  p_allow_overwrite boolean default false
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_source public.sleep_records%rowtype;
  v_target public.sleep_records%rowtype;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_kind not in ('night', 'nap') then
    raise exception 'Invalid sleep kind: %', p_kind;
  end if;
  if p_source_date is null or p_target_date is null then
    raise exception 'Both source and target dates are required';
  end if;

  select *
  into v_source
  from public.sleep_records
  where user_id = v_uid
    and date = p_source_date
  for update;
  if not found then
    raise exception 'Source sleep record not found: %', p_source_date;
  end if;

  select *
  into v_target
  from public.sleep_records
  where user_id = v_uid
    and date = p_target_date
  for update;

  if p_kind = 'night' then
    if p_source_date <> p_target_date
      and not p_allow_overwrite
      and found
      and v_target.bedtime is not null
      and v_target.wake_time is not null then
      raise exception 'SLEEP_NIGHT_CONFLICT';
    end if;

    insert into public.sleep_records (
      user_id,
      date,
      bedtime,
      wake_time,
      night_waking_times,
      quality,
      note,
      nap_start,
      nap_end
    )
    values (
      v_uid,
      p_target_date,
      p_bedtime,
      p_wake_time,
      coalesce(p_night_waking_times, '{}'::time[]),
      p_quality,
      p_note,
      v_target.nap_start,
      v_target.nap_end
    )
    on conflict (user_id, date) do update
      set bedtime = excluded.bedtime,
          wake_time = excluded.wake_time,
          night_waking_times = excluded.night_waking_times,
          quality = excluded.quality,
          note = excluded.note;

    if p_source_date <> p_target_date then
      if v_source.nap_start is not null and v_source.nap_end is not null then
        update public.sleep_records
        set bedtime = null,
            wake_time = null,
            night_waking_times = '{}'::time[],
            quality = null
        where user_id = v_uid
          and date = p_source_date;
      else
        delete from public.sleep_records
        where user_id = v_uid
          and date = p_source_date;
      end if;
    end if;
  else
    if p_source_date <> p_target_date
      and not p_allow_overwrite
      and found
      and v_target.nap_start is not null
      and v_target.nap_end is not null then
      raise exception 'SLEEP_NAP_CONFLICT';
    end if;

    insert into public.sleep_records (
      user_id,
      date,
      bedtime,
      wake_time,
      night_waking_times,
      quality,
      note,
      nap_start,
      nap_end
    )
    values (
      v_uid,
      p_target_date,
      v_target.bedtime,
      v_target.wake_time,
      coalesce(v_target.night_waking_times, '{}'::time[]),
      v_target.quality,
      p_note,
      p_nap_start,
      p_nap_end
    )
    on conflict (user_id, date) do update
      set note = excluded.note,
          nap_start = excluded.nap_start,
          nap_end = excluded.nap_end;

    if p_source_date <> p_target_date then
      if v_source.bedtime is not null and v_source.wake_time is not null then
        update public.sleep_records
        set nap_start = null,
            nap_end = null
        where user_id = v_uid
          and date = p_source_date;
      else
        delete from public.sleep_records
        where user_id = v_uid
          and date = p_source_date;
      end if;
    end if;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sleep_records_night_pair_check'
  ) then
    alter table public.sleep_records
      add constraint sleep_records_night_pair_check
      check ((bedtime is null) = (wake_time is null))
      not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'sleep_records_nap_pair_check'
  ) then
    alter table public.sleep_records
      add constraint sleep_records_nap_pair_check
      check ((nap_start is null) = (nap_end is null))
      not valid;
  end if;
end
$$;
