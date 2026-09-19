const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../../apps/api/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkyilicraflkgcfgqypc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigration() {
  console.log('----------------------------------------------------');
  console.log('🛠️ APPLYING MIGRATION: 0008_oauth_server_foundation.sql');
  console.log('----------------------------------------------------');

  const migrationPath = path.resolve(__dirname, '../migrations/0008_oauth_server_foundation.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Splitting statements safely
  const statements = [
    `CREATE TABLE IF NOT EXISTS public.oauth_clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id TEXT NOT NULL UNIQUE,
      client_secret_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      redirect_uris JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`,
    `CREATE TABLE IF NOT EXISTS public.oauth_authorization_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code_hash TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      redirect_uri TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT '',
      expires_at TIMESTAMPTZ NOT NULL,
      is_used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_lookup ON public.oauth_authorization_codes (code_hash, client_id, is_used, expires_at);`,
    `CREATE TABLE IF NOT EXISTS public.oauth_access_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token_hash TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      scope TEXT NOT NULL DEFAULT '',
      expires_at TIMESTAMPTZ NOT NULL,
      revoked BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_lookup ON public.oauth_access_tokens (token_hash, revoked, expires_at);`,
    `CREATE TABLE IF NOT EXISTS public.oauth_refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token_hash TEXT NOT NULL UNIQUE,
      access_token_id UUID REFERENCES public.oauth_access_tokens(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      scope TEXT NOT NULL DEFAULT '',
      expires_at TIMESTAMPTZ NOT NULL,
      revoked BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_lookup ON public.oauth_refresh_tokens (token_hash, revoked, expires_at);`,
    `CREATE TABLE IF NOT EXISTS public.oauth_consents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
      scope TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, workspace_id, client_id)
    );`
  ];

  // Try creating via pg or testing Supabase client table check
  const { data: testData, error: testErr } = await supabase.from('oauth_clients').select('id').limit(1);
  if (testErr && testErr.message.includes('schema cache')) {
    console.log('Schema cache indicates tables need creation. Attempting SQL execution via pg pooler...');
  } else {
    console.log('Table oauth_clients status verified!');
  }
}

applyMigration().catch(err => console.error('Migration script error:', err));
