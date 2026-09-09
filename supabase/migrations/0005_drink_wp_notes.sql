-- Optional notes on drink logs and WP daily entries.
alter table coffee_logs
  add column if not exists note text;

alter table daily_records
  add column if not exists wp_note text;

comment on column coffee_logs.note is 'Optional note for a drink log';
comment on column daily_records.wp_note is 'Optional note for WP entry on that date';
