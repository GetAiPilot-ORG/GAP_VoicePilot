-- Migration 0010: Durable Assistant Tool Assignments & Per-Assistant Configuration
-- Idempotent creation of assistant_tool_assignments table

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.assistant_tool_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  workspace_connector_id UUID REFERENCES public.workspace_connectors(id) ON DELETE SET NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL DEFAULT 'READ' CHECK (category IN ('READ', 'WRITE', 'DESTRUCTIVE')),
  when_to_use TEXT DEFAULT '',
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  timeout_ms INTEGER NOT NULL DEFAULT 10000,
  failure_message TEXT DEFAULT 'Tool execution failed. Please try again.',
  parameter_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  allowed_during_call BOOLEAN NOT NULL DEFAULT true,
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'failed', 'pending')),
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assistant_id, tool_name)
);

CREATE INDEX IF NOT EXISTS idx_assistant_tool_assignments_assistant ON public.assistant_tool_assignments(assistant_id);
CREATE INDEX IF NOT EXISTS idx_assistant_tool_assignments_workspace ON public.assistant_tool_assignments(workspace_id);

ALTER TABLE public.assistant_tool_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view assistant tool assignments" ON public.assistant_tool_assignments;
CREATE POLICY "Workspace members can view assistant tool assignments"
  ON public.assistant_tool_assignments FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Workspace admins can manage assistant tool assignments" ON public.assistant_tool_assignments;
CREATE POLICY "Workspace admins can manage assistant tool assignments"
  ON public.assistant_tool_assignments FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
