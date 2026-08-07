-- Identity -----------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id),
  email text not null,
  name text,
  created_at timestamptz default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references profiles(id),
  status text not null default 'active',
  created_at timestamptz default now()
);

create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  user_id uuid not null references profiles(id),
  role text not null check (role in ('owner','admin','agent')),
  created_at timestamptz default now(),
  unique (workspace_id, user_id)
);

-- Provider resource mapping ------------------------------------
create table assistants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  created_by uuid not null references profiles(id),
  provider text not null default 'vomyra',
  provider_resource_id text,
  name text not null,
  config_snapshot jsonb not null,
  status text not null default 'pending',
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (provider, provider_resource_id)
);

create table phone_numbers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  provider text not null default 'vomyra',
  provider_resource_id text not null,
  phone_number text not null,
  assigned_assistant_id uuid references assistants(id),
  status text not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz default now(),
  unique (provider, provider_resource_id)
);

create table tools (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  created_by uuid not null references profiles(id),
  provider text not null default 'vomyra',
  provider_resource_id text,
  name text not null,
  type text not null,
  config jsonb not null,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table assistant_tools (
  assistant_id uuid not null references assistants(id),
  tool_id uuid not null references tools(id),
  primary key (assistant_id, tool_id)
);

-- Contacts / campaigns ------------------------------------------
create table contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  name text,
  phone text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  created_by uuid not null references profiles(id),
  assistant_id uuid not null references assistants(id),
  phone_number_id uuid not null references phone_numbers(id),
  name text not null,
  status text not null default 'draft',
  concurrency_limit int not null default 5,
  total_contacts int not null default 0,
  created_at timestamptz default now()
);

create table campaign_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id),
  contact_id uuid not null references contacts(id),
  call_id uuid,
  status text not null default 'pending',
  attempts int not null default 0,
  next_attempt_at timestamptz,
  unique (campaign_id, contact_id)
);

create table calls (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  campaign_id uuid references campaigns(id),
  assistant_id uuid not null references assistants(id),
  contact_id uuid references contacts(id),
  initiated_by uuid references profiles(id),
  idempotency_key text not null unique,
  provider text not null default 'vomyra',
  provider_resource_id text,
  customer_number text not null,
  status text not null default 'queued',
  recording_url text,
  transcript jsonb,
  notes text,
  whatsapp_summary text,
  duration_seconds int,
  started_at timestamptz,
  ended_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  unique (provider, provider_resource_id)
);

-- RLS Example for Assistants
alter table assistants enable row level security;

create policy "workspace members can read their assistants"
on assistants for select
using (
  workspace_id in (
    select workspace_id from workspace_members
    where user_id = auth.uid()
  )
  and deleted_at is null
);

create policy "workspace admins/owners can write assistants"
on assistants for insert with check (
  workspace_id in (
    select workspace_id from workspace_members
    where user_id = auth.uid() and role in ('owner','admin')
  )
);
-- Usage & billing ------------------------------------------------
create table credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  type text not null check (type in ('top_up', 'reservation', 'reservation_release', 'charge')),
  amount numeric not null,
  description text,
  call_id uuid references calls(id),
  created_at timestamptz default now()
);

create table usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id),
  call_id uuid not null references calls(id),
  duration_seconds int not null,
  provider_cost numeric,
  customer_cost numeric,
  created_at timestamptz default now()
);
