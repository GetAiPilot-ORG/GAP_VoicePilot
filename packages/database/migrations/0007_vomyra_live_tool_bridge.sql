-- VoicePilot Vomyra Live Tool Bridge Migration
-- Migration 0007: Persistent mappings between VoicePilot tools and Vomyra apiRequest tools

create table if not exists vomyra_tool_mappings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  assistant_id uuid not null references assistants(id) on delete cascade,
  workspace_connector_id uuid references workspace_connectors(id) on delete cascade,
  voicepilot_tool_name text not null,
  vomyra_tool_id text not null,
  vomyra_assistant_id text not null,
  when_to_call text not null default 'onCall' check (when_to_call in ('beforeCall', 'onCall', 'afterCall')),
  enabled boolean not null default true,
  bridge_token text not null,
  configuration_hash text not null,
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (assistant_id, voicepilot_tool_name)
);

create index if not exists idx_vomyra_tool_mappings_bridge_token on vomyra_tool_mappings (bridge_token);
create index if not exists idx_vomyra_tool_mappings_assistant on vomyra_tool_mappings (workspace_id, assistant_id);

alter table vomyra_tool_mappings enable row level security;

create policy "Workspace members can view vomyra tool mappings"
  on vomyra_tool_mappings for select
  using (
    workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

create policy "Workspace admins can manage vomyra tool mappings"
  on vomyra_tool_mappings for all
  using (
    workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );
