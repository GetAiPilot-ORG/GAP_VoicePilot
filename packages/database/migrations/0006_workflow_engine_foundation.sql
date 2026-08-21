-- ============================================================================
-- Migration: 0006_workflow_engine_foundation.sql
-- VoicePilot Workflow Engine & Execution Logs Foundation
-- ============================================================================

-- 1. Workflows Table
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  enabled boolean not null default true,
  trigger_type text not null, -- 'call.completed', 'call.failed', 'transcript.ready', 'summary.ready'
  conditions jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb, -- array of { id, tool_name, config }
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workflows_workspace on workflows(workspace_id);
create index if not exists idx_workflows_trigger on workflows(workspace_id, trigger_type) where enabled = true;

-- 2. Workflow Execution Logs Table
create table if not exists workflow_execution_logs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  trigger_event_id text not null,
  trigger_event_type text not null,
  status text not null default 'running', -- 'running', 'completed', 'partial_failure', 'failed'
  action_results jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_workflow_exec_logs_wf on workflow_execution_logs(workflow_id);
create index if not exists idx_workflow_exec_logs_ws on workflow_execution_logs(workspace_id);
create index if not exists idx_workflow_exec_logs_evt on workflow_execution_logs(trigger_event_id, workflow_id);

-- 3. Row-Level Security Policies
alter table workflows enable row level security;
alter table workflow_execution_logs enable row level security;

create policy "workspace members view workflows"
on workflows for select to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "workspace admins manage workflows"
on workflows for all to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "service role manage workflows"
on workflows for all to service_role using (true);

create policy "workspace members view workflow exec logs"
on workflow_execution_logs for select to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "service role manage workflow exec logs"
on workflow_execution_logs for all to service_role using (true);
