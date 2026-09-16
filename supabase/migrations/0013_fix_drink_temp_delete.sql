-- Fix drink rewrite: safeupdate blocks DELETE without WHERE on temp clear.

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
  on conflict (user_id, date) do update
    set updated_at = now();

  update public.daily_records
  set
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
    wp_logged_at = case
      when not (
        v_target_patch ? 'masturbationCount'
        or v_target_patch ? 'wpNote'
        or v_target_patch ? 'watchedPorn'
      ) then wp_logged_at
      when coalesce(
             case
               when v_target_patch ? 'masturbationCount'
                 then (v_target_patch ->> 'masturbationCount')::integer
               else masturbation_count
             end,
             0
           ) <= 0
        and nullif(
              trim(
                coalesce(
                  case
                    when v_target_patch ? 'wpNote' then v_target_patch ->> 'wpNote'
                    else wp_note
                  end,
                  ''
                )
              ),
              ''
            ) is null
        and coalesce(
              case
                when v_target_patch ? 'watchedPorn'
                  then (v_target_patch ->> 'watchedPorn')::boolean
                else watched_porn
              end,
              false
            ) is not true
      then null
      else coalesce(wp_logged_at, now())
    end,
    wp_updated_at = case
      when not (
        v_target_patch ? 'masturbationCount'
        or v_target_patch ? 'wpNote'
        or v_target_patch ? 'watchedPorn'
      ) then wp_updated_at
      when coalesce(
             case
               when v_target_patch ? 'masturbationCount'
                 then (v_target_patch ->> 'masturbationCount')::integer
               else masturbation_count
             end,
             0
           ) <= 0
        and nullif(
              trim(
                coalesce(
                  case
                    when v_target_patch ? 'wpNote' then v_target_patch ->> 'wpNote'
                    else wp_note
                  end,
                  ''
                )
              ),
              ''
            ) is null
        and coalesce(
              case
                when v_target_patch ? 'watchedPorn'
                  then (v_target_patch ->> 'watchedPorn')::boolean
                else watched_porn
              end,
              false
            ) is not true
      then null
      else now()
    end,
    updated_at = now()
  where user_id = v_uid
    and date = p_target_date;

  if not found then
    raise exception 'Cannot write target date %', p_target_date;
  end if;

  if v_target_patch ? 'drinks' or v_target_patch ? 'coffee' then
    drop table if exists _drink_created_at;
    create temporary table _drink_created_at (
      id bigint primary key,
      created_at timestamptz not null
    ) on commit drop;

    insert into _drink_created_at (id, created_at)
    select id, created_at
    from public.coffee_logs
    where user_id = v_uid
      and date = p_target_date;

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
      note,
      created_at,
      updated_at
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
      nullif(trim(coalesce(elem ->> 'note', '')), ''),
      coalesce(
        nullif(elem ->> 'createdAt', '')::timestamptz,
        (
          select c.created_at
          from _drink_created_at as c
          where c.id = nullif(elem ->> 'id', '')::bigint
        ),
        now()
      ),
      now()
    from jsonb_array_elements(
      coalesce(v_target_patch -> 'drinks', v_target_patch -> 'coffee', '[]'::jsonb)
    ) as elem;
  end if;

  if p_source_date is null or p_source_date = p_target_date then
    return;
  end if;

  insert into public.daily_records (date, user_id, updated_at)
  values (p_source_date, v_uid, now())
  on conflict (user_id, date) do update
    set updated_at = now();

  update public.daily_records
  set
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
    wp_logged_at = case
      when not (
        v_source_patch ? 'masturbationCount'
        or v_source_patch ? 'wpNote'
        or v_source_patch ? 'watchedPorn'
      ) then wp_logged_at
      when coalesce(
             case
               when v_source_patch ? 'masturbationCount'
                 then (v_source_patch ->> 'masturbationCount')::integer
               else masturbation_count
             end,
             0
           ) <= 0
        and nullif(
              trim(
                coalesce(
                  case
                    when v_source_patch ? 'wpNote' then v_source_patch ->> 'wpNote'
                    else wp_note
                  end,
                  ''
                )
              ),
              ''
            ) is null
        and coalesce(
              case
                when v_source_patch ? 'watchedPorn'
                  then (v_source_patch ->> 'watchedPorn')::boolean
                else watched_porn
              end,
              false
            ) is not true
      then null
      else coalesce(wp_logged_at, now())
    end,
    wp_updated_at = case
      when not (
        v_source_patch ? 'masturbationCount'
        or v_source_patch ? 'wpNote'
        or v_source_patch ? 'watchedPorn'
      ) then wp_updated_at
      when coalesce(
             case
               when v_source_patch ? 'masturbationCount'
                 then (v_source_patch ->> 'masturbationCount')::integer
               else masturbation_count
             end,
             0
           ) <= 0
        and nullif(
              trim(
                coalesce(
                  case
                    when v_source_patch ? 'wpNote' then v_source_patch ->> 'wpNote'
                    else wp_note
                  end,
                  ''
                )
              ),
              ''
            ) is null
        and coalesce(
              case
                when v_source_patch ? 'watchedPorn'
                  then (v_source_patch ->> 'watchedPorn')::boolean
                else watched_porn
              end,
              false
            ) is not true
      then null
      else now()
    end,
    updated_at = now()
  where user_id = v_uid
    and date = p_source_date;

  if not found then
    raise exception 'Cannot write source date %', p_source_date;
  end if;

  if v_source_patch ? 'drinks' or v_source_patch ? 'coffee' then
    drop table if exists _drink_created_at;
    create temporary table _drink_created_at (
      id bigint primary key,
      created_at timestamptz not null
    ) on commit drop;

    insert into _drink_created_at (id, created_at)
    select id, created_at
    from public.coffee_logs
    where user_id = v_uid
      and date = p_source_date;

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
      note,
      created_at,
      updated_at
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
      nullif(trim(coalesce(elem ->> 'note', '')), ''),
      coalesce(
        nullif(elem ->> 'createdAt', '')::timestamptz,
        (
          select c.created_at
          from _drink_created_at as c
          where c.id = nullif(elem ->> 'id', '')::bigint
        ),
        now()
      ),
      now()
    from jsonb_array_elements(
      coalesce(v_source_patch -> 'drinks', v_source_patch -> 'coffee', '[]'::jsonb)
    ) as elem;
  end if;
end;
$$;
