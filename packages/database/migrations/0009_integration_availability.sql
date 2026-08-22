-- Migration 0009: Centralized Integration Availability Management
-- Fully idempotent migration creating or altering connector_definitions table and seeding default integration states.

-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure Table Exists with All Necessary Columns
CREATE TABLE IF NOT EXISTS public.connector_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  auth_type TEXT NOT NULL DEFAULT 'oauth2',
  execution_type TEXT NOT NULL DEFAULT 'native',
  status TEXT NOT NULL DEFAULT 'active',
  availability_status TEXT NOT NULL DEFAULT 'enabled',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  internal_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Safely Add Missing Columns & Drop Overly Restrictive Legacy Constraints
ALTER TABLE public.connector_definitions 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'enabled',
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS internal_note TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.connector_definitions 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Drop legacy check constraints if present to allow modern integration auth and execution types
ALTER TABLE public.connector_definitions 
DROP CONSTRAINT IF EXISTS connector_definitions_auth_type_check,
DROP CONSTRAINT IF EXISTS connector_definitions_execution_type_check,
DROP CONSTRAINT IF EXISTS connector_definitions_status_check;

-- Remove obsolete separate sub-feature rows (google_calendar, google_sheets) so Google Workspace is unified
DELETE FROM public.connector_definitions WHERE slug IN ('google_calendar', 'google_sheets', 'vomyra_crm', 'api');

-- 3. Seed & Update Initial Availability Configuration

-- ENABLED CONNECTORS:
-- Google Workspace, Webhooks, Notion Workspace, Linear Issue Tracker, Custom MCP Server
INSERT INTO public.connector_definitions (id, slug, name, description, auth_type, execution_type, status, availability_status, is_visible, internal_note)
VALUES
  (gen_random_uuid(), 'gmail', 'Google Workspace', 'Gmail, Calendar, Contacts, Drive, Sheets, and Meet via unified OAuth2', 'oauth2', 'native', 'active', 'enabled', true, 'Primary Unified Google Workspace Connector'),
  (gen_random_uuid(), 'zapier_webhook', 'Webhooks', 'Dispatch custom call events and trigger custom webhook URLs', 'none', 'webhook', 'active', 'enabled', true, 'Native Webhook Integration'),
  (gen_random_uuid(), 'notion', 'Notion Workspace', 'Search workspace pages, read databases, and create meeting notes', 'oauth2', 'native', 'active', 'enabled', true, 'Notion Workspace Integration'),
  (gen_random_uuid(), 'linear', 'Linear Issue Tracker', 'Search issues, fetch ticket details, and create Linear tasks', 'oauth2', 'native', 'active', 'enabled', true, 'Linear Issue Tracker Integration'),
  (gen_random_uuid(), 'mcp', 'Custom MCP Server', 'Connect external Model Context Protocol (MCP) servers', 'bearer_token', 'native', 'active', 'enabled', true, 'Custom MCP Server Integration')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  availability_status = 'enabled',
  is_visible = true,
  updated_at = now();

-- DISABLED CONNECTORS:
-- Zapier Native App
INSERT INTO public.connector_definitions (id, slug, name, description, auth_type, execution_type, status, availability_status, is_visible, internal_note)
VALUES
  (gen_random_uuid(), 'zapier', 'Zapier Native App', 'Connect GAP VoicePilot to 6,000+ apps on Zapier via OAuth 2.0 Provider', 'oauth2_provider', 'native', 'active', 'disabled', false, 'Zapier Native OAuth App - Disabled for customers')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  availability_status = 'disabled',
  is_visible = false,
  updated_at = now();

-- COMING SOON / OPTIONAL CONNECTORS:
-- Slack, HubSpot, Salesforce, Make, n8n
INSERT INTO public.connector_definitions (id, slug, name, description, auth_type, execution_type, status, availability_status, is_visible, internal_note)
VALUES
  (gen_random_uuid(), 'slack', 'Slack', 'Post messages, dispatch webhooks, and read channel activity', 'oauth2', 'native', 'active', 'coming_soon', true, 'Slack Integration - Coming Soon'),
  (gen_random_uuid(), 'hubspot', 'HubSpot CRM', 'Sync contacts, deals, and engagement timeline', 'oauth2', 'native', 'active', 'coming_soon', true, 'HubSpot Integration - Coming Soon'),
  (gen_random_uuid(), 'salesforce', 'Salesforce CRM', 'Create leads, update contacts, and manage CRM deals', 'oauth2', 'native', 'active', 'coming_soon', true, 'Salesforce Integration - Coming Soon'),
  (gen_random_uuid(), 'make', 'Make (Integromat)', 'Automate workflows with Make scenario blueprints', 'none', 'webhook', 'active', 'coming_soon', true, 'Make Automation - Coming Soon'),
  (gen_random_uuid(), 'n8n', 'n8n Workflow Automation', 'Connect n8n self-hosted workflows', 'none', 'webhook', 'active', 'coming_soon', true, 'n8n Automation - Coming Soon')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  availability_status = 'coming_soon',
  is_visible = true,
  updated_at = now();
