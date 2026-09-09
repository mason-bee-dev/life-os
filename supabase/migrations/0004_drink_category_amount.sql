-- Expand coffee_logs into cafe / soft drink / tea with spend amount (VND).
alter table coffee_logs
  add column if not exists category text not null default 'cafe',
  add column if not exists amount integer;

comment on column coffee_logs.category is 'cafe | soft_drink | tea';
comment on column coffee_logs.amount is 'Amount spent in VND';

-- Optional: constrain known categories (existing rows default to cafe).
alter table coffee_logs
  drop constraint if exists coffee_logs_category_check;

alter table coffee_logs
  add constraint coffee_logs_category_check
  check (category in ('cafe', 'soft_drink', 'tea'));
