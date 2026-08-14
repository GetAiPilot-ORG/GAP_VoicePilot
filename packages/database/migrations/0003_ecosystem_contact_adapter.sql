-- VoicePilot local contact mirror support for GetAiPilot ecosystem sync.

alter table profiles
  add column if not exists hub_user_id uuid unique;

alter table contacts
  add column if not exists canonical_contact_id uuid,
  add column if not exists ecosystem_synced_at timestamptz,
  add column if not exists ecosystem_sync_source text,
  add column if not exists ecosystem_sync_status text not null default 'local'
    check (ecosystem_sync_status in ('local', 'synced', 'failed', 'skipped'));

create index if not exists idx_voice_contacts_canonical_contact_id
  on contacts(canonical_contact_id)
  where canonical_contact_id is not null;

create unique index if not exists idx_voice_contacts_workspace_canonical_unique
  on contacts(workspace_id, canonical_contact_id)
  where canonical_contact_id is not null;
