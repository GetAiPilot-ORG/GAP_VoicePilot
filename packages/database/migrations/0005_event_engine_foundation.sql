-- ============================================================================
-- Migration: 0005_event_engine_foundation.sql
-- VoicePilot Event Engine Foundation & Webhook Idempotency Layer
-- ============================================================================

-- 1. Webhook / Event Idempotency Store
create table if not exists event_idempotency (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'vomyra',
  idempotency_key text not null unique,
  event_type text not null,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_event_idempotency_key on event_idempotency(idempotency_key);
create index if not exists idx_event_idempotency_created on event_idempotency(created_at desc);

-- 2. VoicePilot Normalized Event Bus Store
create table if not exists voicepilot_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  provider text not null default 'vomyra',
  provider_event_id text,
  workspace_id uuid references workspaces(id) on delete cascade,
  assistant_id text,
  call_id text,
  sanitized_payload jsonb not null default '{}'::jsonb,
  raw_provider_payload jsonb,
  status text not null default 'normalized', -- 'normalized', 'dispatched', 'failed'
  created_at timestamptz not null default now()
);

create index if not exists idx_voicepilot_events_workspace on voicepilot_events(workspace_id);
create index if not exists idx_voicepilot_events_type on voicepilot_events(event_type);
create index if not exists idx_voicepilot_events_call on voicepilot_events(call_id);
create index if not exists idx_voicepilot_events_created on voicepilot_events(created_at desc);

-- 3. Row-Level Security Policies
alter table event_idempotency enable row level security;
alter table voicepilot_events enable row level security;

create policy "service role full access to event idempotency"
on event_idempotency for all to service_role using (true);

create policy "workspace members view workspace events"
on voicepilot_events for select to authenticated
using (
  workspace_id in (
    select workspace_id from workspace_members where user_id = auth.uid()
  )
);

create policy "service role full access to voicepilot events"
on voicepilot_events for all to service_role using (true);
