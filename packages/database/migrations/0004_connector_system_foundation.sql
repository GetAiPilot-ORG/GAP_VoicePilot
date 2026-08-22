-- Migration 0004: Independent Connector System Foundation
-- Non-destructive migration adding connector definitions, workspace account connections, 
-- assistant connector mappings, tool permissions, and execution logging.

-- 1. Master Connector Definitions Table ------------------------------
create table if not exists connector_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  auth_type text not null check (auth_type in ('oauth2', 'api_key', 'bearer_token', 'webhook', 'none')),
  execution_type text not null check (execution_type in ('native', 'webhook', 'mcp')),
  status text not null default 'active' check (status in ('active', 'beta', 'deprecated', 'disabled')),
  supports_realtime boolean not null default true,
  supports_async boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed Connector Definitions
insert into connector_definitions (slug, name, description, auth_type, execution_type, status, supports_realtime, supports_async, metadata)
values
  ('gmail', 'Gmail', 'Send emails, manage drafts, and search messages via Google OAuth2', 'oauth2', 'native', 'active', true, true, '{"category": "Communication", "provider": "Google"}'::jsonb),
  ('slack', 'Slack', 'Post messages, dispatch webhooks, and read channel activity', 'oauth2', 'native', 'active', true, true, '{"category": "Communication", "provider": "Slack"}'::jsonb),
  ('salesforce', 'Salesforce', 'Create leads, update contacts, and manage CRM deals', 'oauth2', 'native', 'active', true, true, '{"category": "CRM", "provider": "Salesforce"}'::jsonb),
  ('notion', 'Notion', 'Create database pages, insert meeting notes, and sync docs', 'oauth2', 'native', 'active', true, true, '{"category": "Productivity", "provider": "Notion"}'::jsonb),
  ('zapier', 'Zapier', 'Trigger custom Zapier webhooks and automated workflows', 'webhook', 'webhook', 'active', true, true, '{"category": "Automation", "provider": "Zapier"}'::jsonb),
  ('freshsales', 'Freshsales', 'Sync leads, update contact lifecycles, and track voice deals', 'api_key', 'native', 'active', true, true, '{"category": "CRM", "provider": "Freshworks"}'::jsonb),
  ('clickup', 'ClickUp', 'Create tasks, assign team members, and log call notes', 'oauth2', 'native', 'active', true, true, '{"category": "Project Management", "provider": "ClickUp"}'::jsonb),
  ('jira', 'Jira', 'Create issues, track tickets, and log customer requests', 'oauth2', 'native', 'active', true, true, '{"category": "Project Management", "provider": "Atlassian"}'::jsonb),
  ('asana', 'Asana', 'Create tasks, manage projects, and schedule follow-ups', 'oauth2', 'native', 'active', true, true, '{"category": "Project Management", "provider": "Asana"}'::jsonb),
  ('monday', 'monday.com', 'Update board items, sync lead statuses, and log calls', 'oauth2', 'native', 'active', true, true, '{"category": "Project Management", "provider": "monday.com"}'::jsonb),
  ('linear', 'Linear', 'Create issue tickets, route customer feedback, and assign engineering tasks', 'oauth2', 'native', 'active', true, true, '{"category": "Issue Tracking", "provider": "Linear"}'::jsonb),
  ('apollo', 'Apollo', 'Enrich contact profiles, verify leads, and update sequences', 'api_key', 'native', 'active', true, true, '{"category": "Sales Intelligence", "provider": "Apollo.io"}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  auth_type = excluded.auth_type,
  execution_type = excluded.execution_type,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = now();

-- 2. Workspace Connected Accounts Table --------------------------------
create table if not exists workspace_connectors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  connector_definition_id uuid not null references connector_definitions(id) on delete cascade,
  name text,
  status text not null default 'connected' check (status in ('connected', 'error', 'expired', 'disabled')),
  connected_account_name text,
  connected_account_email text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  scopes text[] default '{}',
  metadata jsonb not null default '{}'::jsonb,
  authorized_by uuid references profiles(id) on delete set null,
  authorized_at timestamptz default now(),
  last_health_check_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_connectors_workspace_id on workspace_connectors(workspace_id);
create index if not exists idx_workspace_connectors_definition_id on workspace_connectors(connector_definition_id);

-- 3. Agent / Assistant Connector Mapping Table -------------------------
create table if not exists assistant_connectors (
  id uuid primary key default gen_random_uuid(),
  assistant_id uuid not null references assistants(id) on delete cascade,
  workspace_connector_id uuid not null references workspace_connectors(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assistant_id, workspace_connector_id)
);

create index if not exists idx_assistant_connectors_assistant_id on assistant_connectors(assistant_id);
create index if not exists idx_assistant_connectors_connector_id on assistant_connectors(workspace_connector_id);

-- 4. Tool Permission Table ---------------------------------------------
create table if not exists connector_tool_permissions (
  id uuid primary key default gen_random_uuid(),
  workspace_connector_id uuid not null references workspace_connectors(id) on delete cascade,
  assistant_id uuid references assistants(id) on delete cascade,
  tool_name text not null,
  enabled boolean not null default true,
  execution_policy text not null default 'automatic' check (execution_policy in ('automatic', 'confirm', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_connector_id, assistant_id, tool_name)
);

create index if not exists idx_connector_tool_perm_connector on connector_tool_permissions(workspace_connector_id);
create index if not exists idx_connector_tool_perm_assistant on connector_tool_permissions(assistant_id);

-- 5. Execution Logs Table -----------------------------------------------
create table if not exists connector_execution_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  assistant_id uuid references assistants(id) on delete set null,
  call_id uuid references calls(id) on delete set null,
  workspace_connector_id uuid references workspace_connectors(id) on delete set null,
  tool_name text not null,
  sanitized_input jsonb not null default '{}'::jsonb,
  sanitized_output jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'cancelled')),
  latency_ms integer,
  error_code text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_connector_exec_logs_workspace on connector_execution_logs(workspace_id);
create index if not exists idx_connector_exec_logs_assistant on connector_execution_logs(assistant_id);
create index if not exists idx_connector_exec_logs_call on connector_execution_logs(call_id);
create index if not exists idx_connector_exec_logs_created_at on connector_execution_logs(created_at desc);

-- 6. Row Level Security Policies ---------------------------------------

-- 6.1 connector_definitions
alter table connector_definitions enable row level security;

create policy "authenticated users can view connector definitions"
on connector_definitions for select
to authenticated
using (true);

-- 6.2 workspace_connectors
alter table workspace_connectors enable row level security;

create policy "workspace members can view workspace connectors"
on workspace_connectors for select
to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members
    where user_id = auth.uid()
  )
);

create policy "workspace admins can manage workspace connectors"
on workspace_connectors for all
to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
)
with check (
  workspace_id in (
    select workspace_id from workspace_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- 6.3 assistant_connectors
alter table assistant_connectors enable row level security;

create policy "workspace members can view assistant connectors"
on assistant_connectors for select
to authenticated
using (
  assistant_id in (
    select a.id from assistants a
    join workspace_members wm on wm.workspace_id = a.workspace_id
    where wm.user_id = auth.uid()
  )
);

create policy "workspace admins can manage assistant connectors"
on assistant_connectors for all
to authenticated
using (
  assistant_id in (
    select a.id from assistants a
    join workspace_members wm on wm.workspace_id = a.workspace_id
    where wm.user_id = auth.uid() and wm.role in ('owner', 'admin')
  )
)
with check (
  assistant_id in (
    select a.id from assistants a
    join workspace_members wm on wm.workspace_id = a.workspace_id
    where wm.user_id = auth.uid() and wm.role in ('owner', 'admin')
  )
);

-- 6.4 connector_tool_permissions
alter table connector_tool_permissions enable row level security;

create policy "workspace members can view connector tool permissions"
on connector_tool_permissions for select
to authenticated
using (
  workspace_connector_id in (
    select wc.id from workspace_connectors wc
    join workspace_members wm on wm.workspace_id = wc.workspace_id
    where wm.user_id = auth.uid()
  )
);

create policy "workspace admins can manage connector tool permissions"
on connector_tool_permissions for all
to authenticated
using (
  workspace_connector_id in (
    select wc.id from workspace_connectors wc
    join workspace_members wm on wm.workspace_id = wc.workspace_id
    where wm.user_id = auth.uid() and wm.role in ('owner', 'admin')
  )
)
with check (
  workspace_connector_id in (
    select wc.id from workspace_connectors wc
    join workspace_members wm on wm.workspace_id = wc.workspace_id
    where wm.user_id = auth.uid() and wm.role in ('owner', 'admin')
  )
);

-- 6.5 connector_execution_logs
alter table connector_execution_logs enable row level security;

create policy "workspace members can view connector execution logs"
on connector_execution_logs for select
to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members
    where user_id = auth.uid()
  )
);

create policy "workspace members can write connector execution logs"
on connector_execution_logs for insert
to authenticated
with check (
  workspace_id in (
    select workspace_id from workspace_members
    where user_id = auth.uid()
  )
);
