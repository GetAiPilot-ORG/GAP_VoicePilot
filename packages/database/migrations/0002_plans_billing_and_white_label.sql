-- Add is_super_admin and current_plan to profiles ------------------
alter table profiles add column if not exists is_super_admin boolean default false;
alter table profiles add column if not exists current_plan text references plans(id);

-- Plans Table ------------------------------------------------------
create table if not exists plans (
  id text primary key,
  name text not null,
  price_monthly numeric default 0,
  included_credits numeric default 0,
  max_assistants int default 3,
  max_concurrent_calls int default 2,
  features jsonb not null default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Seed Default Plans (INR ₹ Currency)
insert into plans (id, name, price_monthly, included_credits, max_assistants, max_concurrent_calls, features)
values 
  ('call_lite', 'CALL LITE', 1499, 100, 1, 1, '{"extra_min_rate": 5, "campaigns": false}'::jsonb),
  ('call_pro', 'CALL PRO', 2999, 500, 5, 1, '{"extra_min_rate": 4, "campaigns": true}'::jsonb),
  ('call_elite', 'CALL ELITE', 7999, 2000, 20, 5, '{"extra_min_rate": 3, "campaigns": true}'::jsonb)
on conflict (id) do update set 
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  included_credits = excluded.included_credits;

-- Active Workspace Subscriptions -----------------------------------
create table if not exists workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade unique,
  plan_id text not null references plans(id),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean default false,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workspace Feature Overrides --------------------------------------
create table if not exists workspace_feature_overrides (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  feature_key text not null,
  is_enabled boolean not null default true,
  notes text,
  granted_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (workspace_id, feature_key)
);

-- Rate Cards (Pricing Engine in INR) ------------------------------
create table if not exists rate_cards (
  id uuid primary key default gen_random_uuid(),
  service_type text not null,
  provider text not null default 'vomyra',
  cost_per_unit numeric not null,
  unit_name text not null default 'minute',
  created_at timestamptz default now()
);

insert into rate_cards (service_type, provider, cost_per_unit, unit_name)
values
  ('call_minute', 'vomyra', 5.0, 'minute'),
  ('whatsapp_summary', 'vomyra', 2.0, 'summary')
on conflict do nothing;

-- Credit Ledger Table -------------------------------------------
create table if not exists credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type text not null check (type in ('top_up', 'grant', 'reservation', 'reservation_release', 'charge', 'refund')),
  amount numeric not null,
  description text,
  reference_id text,
  call_id uuid references calls(id),
  created_at timestamptz default now()
);

-- Usage Events Table -------------------------------------------
create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  call_id uuid references calls(id),
  duration_seconds int not null default 0,
  units_billed numeric default 0,
  total_credit_cost numeric default 0,
  provider_raw_cost numeric,
  customer_cost numeric,
  created_at timestamptz default now()
);

-- White Label Branding Settings --------------------------------
create table if not exists white_label_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  brand_name text not null default 'VoicePilot',
  logo_url text,
  favicon_url text,
  primary_color text default '#4F46E5',
  custom_domain text unique,
  support_email text,
  smtp_config jsonb default '{}'::jsonb,
  
  created_at timestamptz default now()
);

-- RPC Function: Get Workspace Credit Balance -------------------
create or replace function get_workspace_credit_balance(p_workspace_id uuid)
returns numeric
language sql
stable
as $$
  select coalesce(sum(amount), 0)
  from credit_ledger
  where workspace_id = p_workspace_id;
$$;
