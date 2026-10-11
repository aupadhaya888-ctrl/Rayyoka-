-- YagyaHisab monetization foundation. Apply once to the YagyaHisab Supabase project.
create table if not exists public.yagyahisab_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_key text not null default 'free' check (plan_key in ('free','premium')),
  status text not null default 'inactive' check (status in ('inactive','active','expired','cancelled')),
  provider text not null default 'esewa' check (provider in ('esewa','manual','none')),
  started_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint premium_requires_expiry check (plan_key <> 'premium' or expires_at is not null)
);
create table if not exists public.yagyahisab_payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'esewa' check (provider = 'esewa'),
  amount_npr numeric(10,2) not null check (amount_npr = 99.00),
  currency text not null default 'NPR' check (currency = 'NPR'),
  status text not null default 'pending' check (status in ('pending','complete','failed','cancelled','refunded')),
  transaction_uuid text not null unique,
  provider_reference text,
  verified_at timestamptz,
  verification_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists yagyahisab_payment_orders_user_created_idx on public.yagyahisab_payment_orders (user_id, created_at desc);
create table if not exists public.yagyahisab_saved_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Saved calculation' check (char_length(title) <= 120),
  calculator_type text not null check (calculator_type in ('emi','interest','sip','percentage','comparison','other')),
  inputs jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists yagyahisab_saved_calculations_user_created_idx on public.yagyahisab_saved_calculations (user_id, created_at desc);
create table if not exists public.yagyahisab_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null,
  category text not null check (char_length(category) <= 80),
  planned_npr numeric(12,2) not null default 0 check (planned_npr >= 0),
  actual_npr numeric(12,2) not null default 0 check (actual_npr >= 0),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_start, category)
);
create index if not exists yagyahisab_budgets_user_month_idx on public.yagyahisab_budgets (user_id, month_start desc);
alter table public.yagyahisab_subscriptions enable row level security;
alter table public.yagyahisab_payment_orders enable row level security;
alter table public.yagyahisab_saved_calculations enable row level security;
alter table public.yagyahisab_budgets enable row level security;
revoke all on public.yagyahisab_subscriptions from anon, authenticated;
revoke all on public.yagyahisab_payment_orders from anon, authenticated;
revoke all on public.yagyahisab_saved_calculations from anon, authenticated;
revoke all on public.yagyahisab_budgets from anon, authenticated;
grant select on public.yagyahisab_subscriptions to authenticated;
grant select on public.yagyahisab_payment_orders to authenticated;
grant select, insert, update, delete on public.yagyahisab_saved_calculations to authenticated;
grant select, insert, update, delete on public.yagyahisab_budgets to authenticated;
drop policy if exists "Users can read own subscription" on public.yagyahisab_subscriptions;
create policy "Users can read own subscription" on public.yagyahisab_subscriptions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can read own payment orders" on public.yagyahisab_payment_orders;
create policy "Users can read own payment orders" on public.yagyahisab_payment_orders for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users manage own saved calculations" on public.yagyahisab_saved_calculations;
create policy "Users manage own saved calculations" on public.yagyahisab_saved_calculations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own budgets" on public.yagyahisab_budgets;
create policy "Users manage own budgets" on public.yagyahisab_budgets for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
